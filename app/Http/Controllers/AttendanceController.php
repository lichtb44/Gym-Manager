<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'member' => ['required', 'string'],
            'date' => ['required', 'date'],
            'checkIn' => ['nullable', 'string'],
            'checkOut' => ['nullable', 'string'],
            'status' => ['required', 'string'],
        ]);

        Attendance::create($validated);

        return redirect()->route('dashboard');
    }

    public function destroy(string $id)
    {
        $attendance = Attendance::findOrFail($id);
        $attendance->delete();

        return redirect()->route('dashboard');
    }
}
