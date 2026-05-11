<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Member;
use App\Models\Payment;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MemberProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('email', 'member@fitcore.com')->first();
        
        if ($user && !$user->member) {
            $member = Member::create([
                'user_id' => $user->id,
                'name' => 'John Member',
                'email' => $user->email,
                'phone' => '555-1234',
                'plan' => 'Premium',
                'status' => 'Active',
                'join_date' => now(),
            ]);

            Payment::create([
                'member_id' => $member->id,
                'plan' => 'Premium',
                'amount' => 79.99,
                'method' => 'Credit Card',
                'status' => 'Paid',
                'payment_date' => now(),
            ]);
        }
    }
}
