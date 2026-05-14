<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Member;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function memberStore(Request $request)
    {
        $user = $request->user();

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

        $stripeSecret = config('services.stripe.secret');

        if (!$stripeSecret) {
            return redirect()->back()->withErrors('Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file.');
        }

        $payment = Payment::create([
            'member_id' => $member->id,
            'plan' => $member->plan,
            'amount' => $plan->price,
            'method' => 'Stripe',
            'status' => 'Pending',
            'payment_date' => now()->toDateString(),
        ]);

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
                        'unit_amount' => (int) round(((float) $plan->price) * 100),
                        'product_data' => [
                            'name' => "{$member->plan} Membership",
                            'description' => "FitCore Manager membership payment for {$member->name}",
                        ],
                    ],
                ]],
            ]);

        if ($response->failed()) {
            $payment->delete();

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
                'status' => $payment->status === 'Paid'
                    ? 'Paid'
                    : 'Pending Confirmation',
                'method' => 'Stripe',
                'stripe_checkout_session_id' => $response->json('id'),
                'stripe_payment_intent_id' => $response->json('payment_intent'),
                'payment_date' => now()->toDateString(),
            ]);
        }

        return redirect()->route('payments');
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
