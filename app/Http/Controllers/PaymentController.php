<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Member;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
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
