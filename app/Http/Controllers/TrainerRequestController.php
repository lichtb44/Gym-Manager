<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Payment;
use App\Models\TrainerRequest as TrainerRequestModel;
use App\Models\User;
use Illuminate\Http\Request;

class TrainerRequestController extends Controller
{
    private const TRAINER_CAPACITY = 10;
    private const TRAINER_IDS = [1, 2, 3, 4, 5];

    public function store(Request $request)
    {
        $user = auth()->user();

        if ($user->isAdmin()) {
            return redirect()->route('trainers')->withErrors('Admins approve trainer requests from the admin side.');
        }

        $validated = $request->validate([
            'trainer_id' => ['required', 'integer', 'in:1,2,3,4,5'],
            'trainer_name' => ['required', 'string', 'max:255'],
            'trainer_user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);
        $trainerUser = User::where('role', 'trainer')
            ->where('trainer_profile_id', $validated['trainer_id'])
            ->first();

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

        if ($this->trainerIsFull($validated['trainer_id'])) {
            return redirect()
                ->route('trainers')
                ->withErrors('That trainer is currently full. Choose another available trainer.');
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
            'requested_trainer_user_id' => $trainerUser?->id ?? $validated['trainer_user_id'] ?? null,
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
            'assigned_trainer_id' => ['nullable', 'integer', 'in:1,2,3,4,5'],
            'assigned_trainer' => ['nullable', 'string', 'max:255'],
            'assigned_trainer_user_id' => ['nullable', 'integer', 'exists:users,id'],
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
        $assignedTrainerUserId = $validated['assigned_trainer_user_id']
            ?? User::where('role', 'trainer')
                ->where('trainer_profile_id', $assignedTrainerId)
                ->value('id')
            ?? $trainerRequest->requested_trainer_user_id;

        $alreadyAssigned = TrainerRequestModel::where('member_id', $trainerRequest->member_id)
            ->where('id', '!=', $trainerRequest->id)
            ->where('status', 'Approved')
            ->whereRaw('COALESCE(assigned_trainer_id, requested_trainer_id) = ?', [$assignedTrainerId])
            ->exists();

        if ($alreadyAssigned) {
            return back()->withErrors('This member is already being trained by that trainer.');
        }

        if ($this->trainerIsFull($assignedTrainerId, $trainerRequest->id)) {
            return back()->withErrors('That trainer is currently full. Assign an available trainer instead.');
        }

        $trainerRequest->update([
            'assigned_trainer_id' => $assignedTrainerId,
            'assigned_trainer' => $assignedTrainer,
            'assigned_trainer_user_id' => $assignedTrainerUserId,
            'status' => 'Approved',
            'decided_at' => now(),
        ]);

        return back();
    }

    private function trainerIsFull(int $trainerId, ?int $excludingRequestId = null): bool
    {
        if (!in_array($trainerId, self::TRAINER_IDS, true)) {
            return true;
        }

        $approvedCount = TrainerRequestModel::where('status', 'Approved')
            ->whereRaw('COALESCE(assigned_trainer_id, requested_trainer_id) = ?', [$trainerId])
            ->when($excludingRequestId, fn ($query) => $query->where('id', '!=', $excludingRequestId))
            ->count();

        return $approvedCount >= self::TRAINER_CAPACITY;
    }
}
