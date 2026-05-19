<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'planName' => ['required', 'string', 'max:255'],
            'duration' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'string'],
        ]);

        Plan::create([
            'name' => $validated['planName'],
            'duration' => $validated['duration'],
            'price' => $validated['price'],
            'description' => $validated['description'],
            'status' => $validated['status'],
        ]);

        return redirect()->route('dashboard');
    }

    public function update(Request $request, string $id)
    {
        $plan = Plan::findOrFail($id);
        
        $validated = $request->validate([
            'planName' => ['required', 'string', 'max:255'],
            'duration' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'string'],
        ]);

        $plan->update([
            'name' => $validated['planName'],
            'duration' => $validated['duration'],
            'price' => $validated['price'],
            'description' => $validated['description'],
            'status' => $validated['status'],
        ]);

        return redirect()->route('dashboard');
    }

    public function destroy(string $id)
    {
        $plan = Plan::findOrFail($id);

        if ($plan->isDefault()) {
            return redirect()->route('plans')->withErrors('Default plans cannot be deleted.');
        }

        $plan->delete();

        return redirect()->route('dashboard');
    }
}
