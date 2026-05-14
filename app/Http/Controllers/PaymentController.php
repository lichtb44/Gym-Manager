<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Member;
use App\Models\Plan;
use Illuminate\Http\Request;

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

        $validated = $request->validate([
            'method' => ['required', 'string', 'max:255'],
        ]);

        $plan = Plan::where('name', $member->plan)->first();

        if (!$plan) {
            return redirect()->back()->withErrors('Your current plan could not be found.');
        }

        Payment::create([
            'member_id' => $member->id,
            'plan' => $member->plan,
            'amount' => $plan->price,
            'method' => $validated['method'],
            'status' => 'Pending',
            'payment_date' => now()->toDateString(),
        ]);

        return redirect()->back();
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
