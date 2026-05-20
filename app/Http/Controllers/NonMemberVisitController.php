<?php

namespace App\Http\Controllers;

use App\Models\NonMemberVisit;
use Illuminate\Http\Request;

class NonMemberVisitController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'purpose' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        NonMemberVisit::create([
            ...$validated,
            'logged_by' => $request->user()?->name,
            'entered_at' => now(),
        ]);

        return redirect()->route('members')->with('success', 'Non-member visit logged.');
    }

    public function destroy(string $id)
    {
        NonMemberVisit::findOrFail($id)->delete();

        return redirect()->route('members')->with('success', 'Logbook entry removed.');
    }
}
