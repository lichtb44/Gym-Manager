<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Payment;
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

        $approvedSameTrainer = TrainerRequestModel::where('member_id', $member->id)
            ->where('status', 'Approved')
            ->whereRaw('COALESCE(assigned_trainer_id, requested_trainer_id) = ?', [$validated['trainer_id']])
            ->exists();

        if ($approvedSameTrainer) {
            return redirect()
                ->route('trainers')
                ->withErrors('You are already being trained by this trainer.');
        }

        $pendingSameTrainer = TrainerRequestModel::where('member_id', $member->id)
            ->where('status', 'Pending')
            ->where('requested_trainer_id', $validated['trainer_id'])
            ->exists();

        if ($pendingSameTrainer) {
            return redirect()
                ->route('trainers')
                ->withErrors('You already sent a request for this trainer.');
        }

        $hasApprovedTrainer = TrainerRequestModel::where('member_id', $member->id)
            ->where('status', 'Approved')
            ->exists();

        if ($hasApprovedTrainer) {
            Payment::create([
                'member_id' => $member->id,
                'plan' => 'Additional Trainer - '.$validated['trainer_name'],
                'amount' => 50,
                'method' => 'Trainer Add-on',
                'status' => 'Pending Confirmation',
                'payment_date' => now()->toDateString(),
            ]);
        }

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

        $alreadyAssigned = TrainerRequestModel::where('member_id', $trainerRequest->member_id)
            ->where('id', '!=', $trainerRequest->id)
            ->where('status', 'Approved')
            ->whereRaw('COALESCE(assigned_trainer_id, requested_trainer_id) = ?', [$assignedTrainerId])
            ->exists();

        if ($alreadyAssigned) {
            return back()->withErrors('This member is already being trained by that trainer.');
        }

        $trainerRequest->update([
            'assigned_trainer_id' => $assignedTrainerId,
            'assigned_trainer' => $assignedTrainer,
            'status' => 'Approved',
            'decided_at' => now(),
        ]);

        return back();
    }
}
