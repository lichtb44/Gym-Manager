<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\TrainerRequest as TrainerRequestModel;
use Illuminate\Http\Request;

class TrainerRequestController extends Controller
{
    public function store(Request $request)
    {
        $user = auth()->user();

        if ($user->isAdmin()) {
            return redirect()->route('trainers')->withErrors('Admins approve trainer requests from the admin side.');
        }

        $validated = $request->validate([
            'trainer_id' => ['required', 'integer'],
            'trainer_name' => ['required', 'string', 'max:255'],
        ]);

        $member = $user->member;

        if (!$member) {
            $member = Member::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => null,
                'plan' => 'No plan yet',
                'status' => 'Pending',
                'join_date' => now(),
            ]);
        }

        if (strtolower($member->plan ?? '') !== 'premium') {
            return redirect()
                ->route('my-plan')
                ->withErrors('Only Premium members can choose a trainer. Change your plan to Premium first.');
        }

        TrainerRequestModel::where('member_id', $member->id)
            ->where('status', 'Pending')
            ->delete();

        TrainerRequestModel::create([
            'member_id' => $member->id,
            'requested_trainer_id' => $validated['trainer_id'],
            'requested_trainer' => $validated['trainer_name'],
            'status' => 'Pending',
        ]);

        return redirect()->route('trainers');
    }

    public function decide(Request $request, string $id)
    {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            return redirect()->route('dashboard')->withErrors('Unauthorized');
        }

        $trainerRequest = TrainerRequestModel::findOrFail($id);
        $validated = $request->validate([
            'action' => ['required', 'in:approve,reject'],
            'assigned_trainer_id' => ['nullable', 'integer'],
            'assigned_trainer' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validated['action'] === 'reject') {
            $trainerRequest->update([
                'status' => 'Rejected',
                'decided_at' => now(),
            ]);

            return back();
        }

        $assignedTrainerId = $validated['assigned_trainer_id'] ?? $trainerRequest->requested_trainer_id;
        $assignedTrainer = $validated['assigned_trainer'] ?? $trainerRequest->requested_trainer;

        $trainerRequest->update([
            'assigned_trainer_id' => $assignedTrainerId,
            'assigned_trainer' => $assignedTrainer,
            'status' => 'Approved',
            'decided_at' => now(),
        ]);

        return back();
    }
}
