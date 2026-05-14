<?php

use App\Models\Member;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\Http;

test('stripe success marks member payment as waiting for admin confirmation', function () {
    config(['services.stripe.secret' => 'sk_test_123']);

    Http::fake([
        'https://api.stripe.com/v1/checkout/sessions/*' => Http::response([
            'id' => 'cs_test_123',
            'payment_status' => 'paid',
            'payment_intent' => 'pi_test_123',
        ]),
    ]);

    $user = User::factory()->create();
    $member = Member::create([
        'user_id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'phone' => null,
        'plan' => 'Premium',
        'status' => 'Active',
        'join_date' => now(),
    ]);
    $payment = Payment::create([
        'member_id' => $member->id,
        'plan' => 'Premium',
        'amount' => 79.99,
        'method' => 'Stripe',
        'status' => 'Pending',
        'payment_date' => now()->toDateString(),
    ]);

    $this->actingAs($user)
        ->get(
            route('payments.stripe-success', $payment).'?session_id=cs_test_123'
        )
        ->assertRedirect(route('payments'));

    expect($payment->fresh()->status)->toBe('Pending Confirmation');
});

test('admin can confirm a pending payment', function () {
    $admin = User::factory()->create([
        'email' => User::ADMIN_EMAIL,
        'role' => 'admin',
    ]);
    $user = User::factory()->create();
    $member = Member::create([
        'user_id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'phone' => null,
        'plan' => 'Premium',
        'status' => 'Active',
        'join_date' => now(),
    ]);
    $payment = Payment::create([
        'member_id' => $member->id,
        'plan' => 'Premium',
        'amount' => 79.99,
        'method' => 'Stripe',
        'status' => 'Pending Confirmation',
        'payment_date' => now()->toDateString(),
    ]);

    $this->actingAs($admin)
        ->post("/dashboard/payments/{$payment->id}/confirm")
        ->assertRedirect(route('dashboard'));

    expect($payment->fresh()->status)->toBe('Paid');
});
