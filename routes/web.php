<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\MemberRegisterController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\TrainerRatingController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Public member registration
Route::get('/join', [MemberRegisterController::class, 'create'])->name('member.register');
Route::post('/join', [MemberRegisterController::class, 'store']);
Route::post('/stripe/webhook', [PaymentController::class, 'stripeWebhook'])->name('stripe.webhook');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('my-plan', [DashboardController::class, 'myPlan'])->name('my-plan');
    Route::get('attendance', [DashboardController::class, 'attendance'])->name('attendance');
    Route::get('payments', [DashboardController::class, 'payments'])->name('payments');
    Route::get('trainers', [DashboardController::class, 'trainers'])->name('trainers');
    Route::post('payments', [PaymentController::class, 'memberStore'])->name('payments.store');
    Route::get('payments/stripe/success/{payment}', [PaymentController::class, 'stripeSuccess'])
        ->name('payments.stripe-success');
    Route::post('dashboard/select-plan', [MemberController::class, 'selectPlan'])->name('dashboard.select-plan');

    // Trainer rating routes
    Route::post('trainers/{trainerId}/rate', [TrainerRatingController::class, 'store'])->name('trainers.rate');
    Route::get('trainers/{trainerId}/my-rating', [TrainerRatingController::class, 'getTrainerRating'])->name('trainers.my-rating');
    Route::get('trainers/{trainerId}/average-rating', [TrainerRatingController::class, 'getTrainerAverageRating'])->name('trainers.average-rating');

    Route::middleware('admin')->group(function () {
        Route::get('members', [DashboardController::class, 'members'])->name('members');
        Route::get('plans', [DashboardController::class, 'plans'])->name('plans');

        Route::post('dashboard/members', [MemberController::class, 'store']);
        Route::match(['delete', 'post'], 'dashboard/members/{id}', [MemberController::class, 'destroy']);
        Route::post('dashboard/members/{id}/approve-plan', [MemberController::class, 'approvePlanChange']);

        Route::post('dashboard/plans', [PlanController::class, 'store']);
        Route::put('dashboard/plans/{id}', [PlanController::class, 'update']);
        Route::match(['delete', 'post'], 'dashboard/plans/{id}', [PlanController::class, 'destroy']);

        Route::post('dashboard/payments', [PaymentController::class, 'store']);
        Route::post('dashboard/payments/{id}/confirm', [PaymentController::class, 'confirm']);
        Route::put('dashboard/payments/{id}', [PaymentController::class, 'update']);
        Route::match(['delete', 'post'], 'dashboard/payments/{id}', [PaymentController::class, 'destroy']);

        Route::post('dashboard/attendances', [AttendanceController::class, 'store']);
        Route::match(['delete', 'post'], 'dashboard/attendances/{id}', [AttendanceController::class, 'destroy']);

        // Trainer rating admin routes
        Route::get('dashboard/trainer-ratings', [TrainerRatingController::class, 'getPendingRatings']);
        Route::post('dashboard/trainer-ratings/{id}/approve', [TrainerRatingController::class, 'approveRating']);
        Route::post('dashboard/trainer-ratings/{id}/reject', [TrainerRatingController::class, 'rejectRating']);
    });

    // Allow both members and admins to update members (with authorization check in controller)
    Route::put('dashboard/members/{id}', [MemberController::class, 'update']);
});

require __DIR__.'/settings.php';
