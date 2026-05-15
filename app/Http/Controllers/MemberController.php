<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Payment;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

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
        $user = auth()->user();
        $isAdmin = $user->role === 'admin' || $user->isAdmin();
        $supportsPlanApproval = Schema::hasColumn('members', 'pending_plan')
            && Schema::hasColumn('members', 'plan_status');
        $supportsPlanStartTime = Schema::hasColumn('members', 'plan_started_at');
        
        // Check authorization
        $userMember = $user->member;
        $isMemberUpdatingOwnRecord = $userMember && $userMember->id == $id;
        
        // If only plan is being updated (member selecting a plan)
        if ($request->has('plan') && !$request->has('name')) {
            // Allow if: admin OR member updating their own record
            if (!$isAdmin && !$isMemberUpdatingOwnRecord) {
                return redirect()->route('dashboard')->withErrors('Unauthorized');
            }
            
            if ($isAdmin) {
                // Admin updates plan directly (active immediately)
                $validated = $request->validate([
                    'plan' => ['required', 'string'],
                ]);

                $updates = [
                    'plan' => $validated['plan'],
                    'join_date' => now(),
                    'status' => 'Active',
                ];

                if ($supportsPlanApproval) {
                    $updates += [
                        'pending_plan' => null,
                        'plan_status' => 'active',
                    ];
                }

                if ($supportsPlanStartTime) {
                    $updates['plan_started_at'] = now();
                }

                $member->update($updates);
            } else {
                $validated = $request->validate([
                    'plan' => ['required', 'string'],
                ]);

                $hasActivePlan = !empty($member->plan)
                    && $member->plan !== 'No plan yet'
                    && $member->status !== 'Pending';

                $updates = $supportsPlanApproval && $hasActivePlan ? [
                    'pending_plan' => $validated['plan'],
                    'plan_status' => 'pending',
                ] : [
                    'plan' => $validated['plan'],
                    'status' => 'Active',
                    'join_date' => now(),
                ];

                if ($supportsPlanApproval && !$hasActivePlan) {
                    $updates += [
                        'pending_plan' => null,
                        'plan_status' => 'active',
                    ];
                }

                if ((!$supportsPlanApproval || !$hasActivePlan) && $supportsPlanStartTime) {
                    $updates['plan_started_at'] = now();
                }

                $member->update($updates);
            }
        } else {
            // Full member update - only admins allowed
            if (!$isAdmin) {
                return redirect()->route('dashboard')->withErrors('Unauthorized');
            }
            
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255'],
                'phone' => ['nullable', 'string', 'max:30'],
                'plan' => ['required', 'string'],
                'status' => ['required', 'string'],
            ]);
            
            $member->update($validated);
        }

        return redirect()->route('dashboard');
    }

    public function selectPlan(Request $request)
    {
        $user = auth()->user();

        if ($user->role === 'admin' || $user->isAdmin()) {
            return redirect()->route('dashboard')->withErrors('Admins should update plans from the members table.');
        }

        $validated = $request->validate([
            'plan' => ['required', 'string', 'exists:plans,name'],
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

        $supportsPlanApproval = Schema::hasColumn('members', 'pending_plan')
            && Schema::hasColumn('members', 'plan_status');
        $supportsPlanStartTime = Schema::hasColumn('members', 'plan_started_at');

        $hasActivePlan = !empty($member->plan)
            && $member->plan !== 'No plan yet'
            && $member->status !== 'Pending';

        $updates = $supportsPlanApproval && $hasActivePlan ? [
            'pending_plan' => $validated['plan'],
            'plan_status' => 'pending',
        ] : [
            'plan' => $validated['plan'],
            'status' => 'Active',
            'join_date' => now(),
        ];

        if ($supportsPlanApproval && !$hasActivePlan) {
            $updates += [
                'pending_plan' => null,
                'plan_status' => 'active',
            ];
        }

        if ((!$supportsPlanApproval || !$hasActivePlan) && $supportsPlanStartTime) {
            $updates['plan_started_at'] = now();
        }

        $member->update($updates);

        return redirect()->route('dashboard');
    }

    public function approvePlanChange(Request $request, string $id)
    {
        $user = auth()->user();
        if ($user->role !== 'admin' && !$user->isAdmin()) {
            return redirect()->route('dashboard')->withErrors('Unauthorized');
        }

        $member = Member::findOrFail($id);

        $action = $request->input('action'); // 'approve' or 'reject'

        if (!Schema::hasColumn('members', 'pending_plan') || !Schema::hasColumn('members', 'plan_status')) {
            return redirect()->route('dashboard')->withErrors('Plan approvals require the pending_plan and plan_status columns. Run php artisan migrate.');
        }

        if ($action === 'approve') {
            if (empty($member->pending_plan)) {
                return redirect()->route('dashboard')->withErrors('No pending plan to approve.');
            }

            $validated = $request->validate([
                'payment_method' => ['required', 'string', 'max:255'],
                'payment_date' => ['nullable', 'date'],
                'payment_amount' => ['nullable', 'numeric', 'min:0'],
            ]);

            $plan = Plan::where('name', $member->pending_plan)->first();

            $amount = $validated['payment_amount'];
            if ($amount === null && $plan) {
                $amount = $plan->price;
            }
            if ($amount === null) {
                return redirect()->route('dashboard')->withErrors('Payment amount is required.');
            }

            // Activate plan
            $updates = [
                'plan' => $member->pending_plan,
                'pending_plan' => null,
                'plan_status' => 'active',
                'status' => 'Active',
                'join_date' => now(),
            ];

            if (Schema::hasColumn('members', 'plan_started_at')) {
                $updates['plan_started_at'] = now();
            }

            $member->update($updates);

            // Confirm payment (create paid payment record)
            Payment::create([
                'member_id' => $member->id,
                'plan' => $member->plan,
                'amount' => $amount,
                'method' => $validated['payment_method'],
                'status' => 'Paid',
                'payment_date' => $validated['payment_date'] ?? now()->toDateString(),
            ]);
        } elseif ($action === 'reject') {
            $member->update([
                'pending_plan' => null,
                'plan_status' => 'rejected',
            ]);
        }

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
