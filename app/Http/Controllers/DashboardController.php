<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Plan;
use App\Models\Payment;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        if ($user->isAdmin()) {
            return $this->adminDashboard();
        } else {
            return $this->memberDashboard($user);
        }
    }

    public function myPlan()
    {
        $user = auth()->user();
        $member = Member::where('user_id', $user->id)->first();
        $memberProfile = $member ?: [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => null,
            'plan' => 'No plan yet',
            'plan_started_at' => null,
            'status' => 'Pending',
            'join_date' => optional($user->created_at)->format('M j, Y'),
        ];
        $payments = [];

        if ($member) {
            $payments = Payment::where('member_id', $member->id)
                ->latest('payment_date')
                ->get()
                ->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'member' => $payment->member->name ?? 'Member',
                        'member_id' => $payment->member_id,
                        'plan' => $payment->plan,
                        'amount' => $payment->amount,
                        'payment_date' => optional($payment->payment_date)->format('M j, Y'),
                        'method' => $payment->method,
                        'status' => $payment->status,
                    ];
                })
                ->toArray();
        }

        return inertia('my-plan', [
            'member' => $memberProfile,
            'plans' => Plan::where('status', 'Active')->get(),
            'payments' => $payments,
        ]);
    }

    public function attendance()
    {
        $user = auth()->user();
        $member = Member::where('user_id', $user->id)->first();
        $memberProfile = $member ?: [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => null,
            'plan' => 'No plan yet',
            'plan_started_at' => null,
            'status' => 'Pending',
            'join_date' => optional($user->created_at)->format('M j, Y'),
        ];
        $attendance = $member
            ? collect($this->generateAttendanceRecords(collect([$member])))->values()
            : collect();

        return inertia('attendance', [
            'member' => $memberProfile,
            'attendance' => $attendance,
        ]);
    }

    public function payments()
    {
        $user = auth()->user();
        $member = Member::where('user_id', $user->id)->first();
        $memberProfile = $member ?: [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => null,
            'plan' => 'No plan yet',
            'plan_started_at' => null,
            'status' => 'Pending',
            'join_date' => optional($user->created_at)->format('M j, Y'),
        ];
        $payments = [];

        if ($member) {
            $payments = Payment::where('member_id', $member->id)
                ->latest('payment_date')
                ->get()
                ->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'member' => $payment->member->name ?? 'Member',
                        'member_id' => $payment->member_id,
                        'plan' => $payment->plan,
                        'amount' => $payment->amount,
                        'payment_date' => optional($payment->payment_date)->format('M j, Y'),
                        'method' => $payment->method,
                        'status' => $payment->status,
                    ];
                })
                ->toArray();
        }

        return inertia('payments', [
            'member' => $memberProfile,
            'currentPlan' => $member ? Plan::where('name', $member->plan)->first() : null,
            'payments' => $payments,
        ]);
    }

    private function generateAttendanceRecords($members)
    {
        $attendanceRecords = [];
        
        foreach ($members as $member) {
            if (($member->plan ?? null) === 'No plan yet' || ($member->status ?? null) === 'Pending') {
                continue;
            }

            $attendanceStart = $member->plan_started_at ?? $member->join_date ?? $member->created_at ?? now();
            $startDate = Carbon::parse($attendanceStart);
            $today = Carbon::today();
            
            // Generate attendance records from join date to today
            $currentDate = $startDate->clone();
            $recordCount = 0;
            
            while ($currentDate->lte($today) && $recordCount < 30) {
                // Skip weekends optionally or include all days
                if ($currentDate->isWeekday()) {
                    $checkInHour = rand(5, 8);
                    $checkInMinute = rand(0, 59);
                    $checkOutHour = rand(9, 11);
                    $checkOutMinute = rand(0, 59);
                    
                    $status = rand(0, 100) > 20 ? 'Present' : 'Absent';
                    $checkIn = $status === 'Present' ? sprintf('%02d:%02d AM', $checkInHour, $checkInMinute) : '-';
                    $checkOut = $status === 'Present' ? sprintf('%02d:%02d AM', $checkOutHour, $checkOutMinute) : '-';
                    
                    $attendanceRecords[] = [
                        'id' => uniqid(),
                        'member' => $member->name,
                        'member_id' => $member->id,
                        'checkIn' => $checkIn,
                        'checkOut' => $checkOut,
                        'date' => $currentDate->format('M j, Y'),
                        'status' => $status,
                    ];
                    
                    $recordCount++;
                }
                
                $currentDate->addDay();
            }
        }
        
        return $attendanceRecords;
    }

    private function adminDashboard()
    {
        $members = Member::all();
        $plans = Plan::all();
        $payments = Payment::with('member')->latest()->get()->map(function ($payment) {
            return [
                'id' => $payment->id,
                'member' => $payment->member->name ?? 'Member',
                'member_id' => $payment->member_id,
                'plan' => $payment->plan,
                'amount' => $payment->amount,
                'payment_date' => optional($payment->payment_date)->format('M j, Y'),
                'method' => $payment->method,
                'status' => $payment->status,
                'created_at' => optional($payment->created_at)->format('M j, Y g:i A'),
            ];
        });
        $pendingPaymentConfirmations = $payments
            ->filter(fn ($payment) => strtolower($payment['status']) === 'pending confirmation')
            ->values();
        
        // Generate attendance records from each member's join date
        $attendance = $this->generateAttendanceRecords($members);
        
        // Get pending plan approvals when the migration has been applied.
        $pendingApprovals = collect();
        if (Schema::hasColumn('members', 'pending_plan') && Schema::hasColumn('members', 'plan_status')) {
            $pendingApprovals = Member::where('plan_status', 'pending')
                ->get()
                ->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'name' => $member->name,
                        'current_plan' => $member->plan ?? 'None',
                        'requested_plan' => $member->pending_plan,
                        'status' => 'Pending',
                    ];
                });
        }

        return inertia('dashboard', [
            'members' => $members,
            'plans' => $plans,
            'payments' => $payments,
            'recentPayments' => $payments->take(5)->values(),
            'pendingPaymentConfirmations' => $pendingPaymentConfirmations,
            'attendance' => $attendance,
            'pendingApprovals' => $pendingApprovals,
            'userRole' => 'admin',
        ]);
    }

    private function memberDashboard($user)
    {
        $member = Member::where('user_id', $user->id)->first();
        $memberProfile = $member ?: [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => null,
            'plan' => 'No plan yet',
            'plan_started_at' => null,
            'status' => 'Pending',
            'join_date' => optional($user->created_at)->format('M j, Y'),
        ];
        $plans = Plan::all();
        
        $payments = [];
        if ($member) {
            $payments = Payment::where('member_id', $member->id)
                ->get()
                ->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'member' => $payment->member->name ?? 'Member',
                        'member_id' => $payment->member_id,
                        'plan' => $payment->plan,
                        'amount' => $payment->amount,
                        'payment_date' => optional($payment->payment_date)->format('M j, Y'),
                        'method' => $payment->method,
                        'status' => $payment->status,
                    ];
                })
                ->toArray();
        }

        return inertia('dashboard', [
            'member' => $memberProfile,
            'plans' => $plans,
            'payments' => $payments,
            'userRole' => 'member',
        ]);
    }
}
