<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Member;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function memberStore(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'method' => ['required', 'string', 'max:255'],
            'payment_id' => ['nullable', 'integer', 'exists:payments,id'],
        ]);

        if ($user->isAdmin()) {
            return redirect()->route('dashboard')->withErrors('Admins should add payments from the dashboard.');
        }

        $member = $user->member;

        if (!$member) {
            return redirect()->back()->withErrors('Create or select a membership plan before paying.');
        }

        if (($member->plan_status ?? null) === 'pending') {
            return redirect()->back()->withErrors('Your plan change is still waiting for admin approval.');
        }

        if (($member->plan ?? null) === 'No plan yet' || ($member->status ?? null) === 'Pending') {
            return redirect()->back()->withErrors('Your membership must be active before paying.');
        }

        $plan = Plan::where('name', $member->plan)->first();

        if (!$plan) {
            return redirect()->back()->withErrors('Your current plan could not be found.');
        }

        $payment = null;

        if (!empty($validated['payment_id'])) {
            $payment = Payment::where('member_id', $member->id)
                ->where('status', '!=', 'Paid')
                ->find($validated['payment_id']);

            if (!$payment) {
                return redirect()->back()->withErrors('That pending payment could not be found.');
            }
        }

        if (!$payment) {
            $payment = Payment::where('member_id', $member->id)
                ->where('status', '!=', 'Paid')
                ->oldest('payment_date')
                ->oldest()
                ->first();
        }

        if (!$payment) {
            $payment = Payment::create([
                'member_id' => $member->id,
                'plan' => $member->plan,
                'amount' => $plan->price,
                'method' => $validated['method'],
                'status' => 'Pending',
                'payment_date' => now()->toDateString(),
            ]);
        } else {
            $payment->update([
                'method' => $validated['method'],
                'status' => 'Pending',
                'payment_date' => now()->toDateString(),
            ]);
        }

        if (strtolower($validated['method']) !== 'stripe') {
            $payment->update([
                'status' => 'Pending Confirmation',
            ]);

            return redirect()->route('payments')->with('success', 'Payment request sent for admin confirmation.');
        }

        $stripeSecret = config('services.stripe.secret');

        if (!$stripeSecret) {
            $payment->update([
                'status' => 'Failed',
            ]);

            return redirect()->back()->withErrors('Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file.');
        }

        $response = Http::asForm()
            ->withToken($stripeSecret)
            ->post('https://api.stripe.com/v1/checkout/sessions', [
                'mode' => 'payment',
                'customer_email' => $user->email,
                'client_reference_id' => (string) $payment->id,
                'success_url' => route('payments.stripe-success', $payment).'?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('payments'),
                'metadata' => [
                    'payment_id' => (string) $payment->id,
                    'member_id' => (string) $member->id,
                    'plan' => $member->plan,
                ],
                'line_items' => [[
                    'quantity' => 1,
                    'price_data' => [
                        'currency' => config('services.stripe.currency', 'usd'),
                        'unit_amount' => (int) round(((float) $payment->amount) * 100),
                        'product_data' => [
                            'name' => "{$payment->plan} Membership",
                            'description' => "FitCore Manager membership payment for {$member->name}",
                        ],
                    ],
                ]],
            ]);

        if ($response->failed()) {
            $payment->update([
                'status' => 'Failed',
            ]);

            return redirect()->back()->withErrors($response->json('error.message') ?? 'Stripe Checkout could not be started.');
        }

        $payment->update([
            'stripe_checkout_session_id' => $response->json('id'),
        ]);

        return Inertia::location($response->json('url'));
    }

    public function stripeSuccess(Request $request, Payment $payment)
    {
        $user = $request->user();

        if (!$user->isAdmin() && $payment->member?->user_id !== $user->id) {
            abort(403);
        }

        $sessionId = $request->query('session_id');
        $stripeSecret = config('services.stripe.secret');

        if (!$sessionId || !$stripeSecret) {
            return redirect()->route('payments')->withErrors('Stripe payment could not be verified.');
        }

        $response = Http::withToken($stripeSecret)
            ->get("https://api.stripe.com/v1/checkout/sessions/{$sessionId}");

        if ($response->failed()) {
            return redirect()->route('payments')->withErrors('Stripe payment could not be verified.');
        }

        if ($response->json('payment_status') === 'paid') {
            $payment->update([
                'status' => 'Paid',
                'method' => 'Stripe',
                'stripe_checkout_session_id' => $response->json('id'),
                'stripe_payment_intent_id' => $response->json('payment_intent'),
                'payment_date' => now()->toDateString(),
            ]);
        }

        return redirect()->route('payments');
    }

    public function stripeWebhook(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        if (!$signature || !$webhookSecret || !$this->hasValidStripeSignature($payload, $signature, $webhookSecret)) {
            Log::warning('Rejected Stripe webhook with invalid signature.');

            return response('Invalid signature', 400);
        }

        $event = json_decode($payload, true);

        if (!is_array($event)) {
            return response('Invalid payload', 400);
        }

        if (($event['type'] ?? null) !== 'checkout.session.completed') {
            return response('Event ignored');
        }

        $session = $event['data']['object'] ?? [];
        $paymentId = $session['metadata']['payment_id'] ?? $session['client_reference_id'] ?? null;

        if (!$paymentId) {
            Log::warning('Stripe checkout session completed without a payment_id.', [
                'session_id' => $session['id'] ?? null,
            ]);

            return response('Missing payment id', 400);
        }

        $payment = Payment::find($paymentId);

        if (!$payment) {
            Log::warning('Stripe webhook referenced an unknown payment.', [
                'payment_id' => $paymentId,
                'session_id' => $session['id'] ?? null,
            ]);

            return response('Payment not found', 404);
        }

        if (($session['payment_status'] ?? null) === 'paid') {
            $payment->update([
                'status' => 'Paid',
                'method' => 'Stripe',
                'stripe_checkout_session_id' => $session['id'] ?? $payment->stripe_checkout_session_id,
                'stripe_payment_intent_id' => $session['payment_intent'] ?? $payment->stripe_payment_intent_id,
                'payment_date' => now()->toDateString(),
            ]);
        }

        return response('Webhook received');
    }

    private function hasValidStripeSignature(string $payload, string $signatureHeader, string $secret): bool
    {
        $parts = collect(explode(',', $signatureHeader))
            ->mapWithKeys(function (string $part) {
                [$key, $value] = array_pad(explode('=', $part, 2), 2, null);

                return $key && $value ? [$key => $value] : [];
            });

        $timestamp = $parts->get('t');
        $signature = $parts->get('v1');

        if (!$timestamp || !$signature || abs(time() - (int) $timestamp) > 300) {
            return false;
        }

        $signedPayload = "{$timestamp}.{$payload}";
        $expectedSignature = hash_hmac('sha256', $signedPayload, $secret);

        return hash_equals($expectedSignature, $signature);
    }

    public function confirm(string $id)
    {
        $payment = Payment::findOrFail($id);

        $payment->update([
            'status' => 'Paid',
            'payment_date' => $payment->payment_date ?? now()->toDateString(),
        ]);

        return redirect()->route('dashboard')->with('success', 'Payment confirmed.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'member' => ['required', 'exists:members,id'],
            'plan' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
            'date' => ['nullable', 'date'],
            'method' => ['required', 'string'],
            'status' => ['required', 'string'],
        ]);

        Payment::create([
            'member_id' => $validated['member'],
            'plan' => $validated['plan'],
            'amount' => $validated['amount'],
            'payment_date' => $validated['date'],
            'method' => $validated['method'],
            'status' => $validated['status'],
        ]);

        return redirect()->route('dashboard');
    }

    public function update(Request $request, string $id)
    {
        $payment = Payment::findOrFail($id);
        
        $validated = $request->validate([
            'member' => ['required', 'exists:members,id'],
            'plan' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
            'date' => ['nullable', 'date'],
            'method' => ['required', 'string'],
            'status' => ['required', 'string'],
        ]);

        $payment->update([
            'member_id' => $validated['member'],
            'plan' => $validated['plan'],
            'amount' => $validated['amount'],
            'payment_date' => $validated['date'],
            'method' => $validated['method'],
            'status' => $validated['status'],
        ]);

        return redirect()->route('dashboard');
    }

    public function destroy(string $id)
    {
        $payment = Payment::findOrFail($id);
        $payment->delete();

        return redirect()->route('dashboard');
    }
}
