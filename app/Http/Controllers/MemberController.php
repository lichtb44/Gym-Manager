<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Payment;
use App\Models\Plan;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'plan' => ['required', 'string'],
            'status' => ['required', 'string'],
        ]);

        $member = Member::create($validated + ['join_date' => now()]);

        return redirect()->route('dashboard');
    }

    public function update(Request $request, string $id)
    {
        $member = Member::findOrFail($id);
        
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'plan' => ['required', 'string'],
            'status' => ['required', 'string'],
        ]);

        $member->update($validated);

        return redirect()->route('dashboard');
    }

    public function destroy(string $id)
    {
        $member = Member::findOrFail($id);

        $member->payments()->delete();
        $member->delete();

        return redirect()->route('dashboard');
    }
}
