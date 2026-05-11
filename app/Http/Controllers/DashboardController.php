<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Plan;
use App\Models\Payment;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        if ($user->role === 'admin') {
            return $this->adminDashboard();
        } else {
            return $this->memberDashboard($user);
        }
    }

    private function adminDashboard()
    {
        $members = Member::all();
        $plans = Plan::all();
        $payments = Payment::with('member')->get()->map(function ($payment) {
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
        });
        $attendance = Attendance::all();

        return inertia('dashboard', [
            'members' => $members,
            'plans' => $plans,
            'payments' => $payments,
            'attendance' => $attendance,
            'userRole' => 'admin',
        ]);
    }

    private function memberDashboard($user)
    {
        $member = Member::where('user_id', $user->id)->first();
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
            'member' => $member,
            'plans' => $plans,
            'payments' => $payments,
            'userRole' => 'member',
        ]);
    }
}
