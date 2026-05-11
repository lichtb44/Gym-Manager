<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Str;
use Inertia\Inertia;

class MemberRegisterController extends Controller
{
    public function create()
    {
        return Inertia::render('member-register', [
            'plans' => Plan::where('status', 'Active')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'plan_id' => ['required', 'integer', 'exists:plans,id'],
            'method' => ['required', 'string', 'max:50'],
        ]);

        $plan = Plan::findOrFail($validated['plan_id']);

        $user = User::firstWhere('email', $validated['email']);

        if (!$user) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make(Str::random(16)),
                'role' => 'member',
            ]);
        }

        $member = Member::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'plan' => $plan->name,
            'status' => 'Active',
            'join_date' => now()->toDateString(),
        ]);

        Payment::create([
            'member_id' => $member->id,
            'plan' => $plan->name,
            'amount' => $plan->price,
            'method' => $validated['method'],
            'status' => 'Paid',
            'payment_date' => now()->toDateString(),
        ]);

        return redirect()->route('member.register')->with('success', 'Welcome to FitCore Gym! Your membership has been created.');
    }
}
