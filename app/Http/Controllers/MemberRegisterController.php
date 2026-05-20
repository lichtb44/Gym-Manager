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

        if (strtolower($validated['email']) === User::ADMIN_EMAIL) {
            return back()->withErrors([
                'email' => 'This email is reserved for the website admin.',
            ]);
        }

        $plan = Plan::findOrFail($validated['plan_id']);

        if (strtolower($plan->name) !== 'basic') {
            return back()->withErrors([
                'plan_id' => 'New members must start with the Basic plan first.',
            ]);
        }

        $user = User::with('member')->firstWhere('email', $validated['email']);

        if ($user?->member || Member::where('email', $validated['email'])->exists()) {
            return back()->withErrors([
                'email' => 'A membership already exists for this email.',
            ]);
        }

        if ($user && $user->isAdmin()) {
            return back()->withErrors([
                'email' => 'This email is reserved for the website admin.',
            ]);
        }

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
            'plan_started_at' => now(),
            'pending_plan' => null,
            'plan_status' => 'active',
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
