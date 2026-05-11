<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\MemberRegisterController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PlanController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Public member registration
Route::get('/join', [MemberRegisterController::class, 'create'])->name('member.register');
Route::post('/join', [MemberRegisterController::class, 'store']);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::middleware('admin')->group(function () {
        Route::post('dashboard/members', [MemberController::class, 'store']);
        Route::put('dashboard/members/{id}', [MemberController::class, 'update']);
        Route::match(['delete', 'post'], 'dashboard/members/{id}', [MemberController::class, 'destroy']);

        Route::post('dashboard/plans', [PlanController::class, 'store']);
        Route::put('dashboard/plans/{id}', [PlanController::class, 'update']);
        Route::match(['delete', 'post'], 'dashboard/plans/{id}', [PlanController::class, 'destroy']);

        Route::post('dashboard/payments', [PaymentController::class, 'store']);
        Route::put('dashboard/payments/{id}', [PaymentController::class, 'update']);
        Route::match(['delete', 'post'], 'dashboard/payments/{id}', [PaymentController::class, 'destroy']);

        Route::post('dashboard/attendances', [AttendanceController::class, 'store']);
        Route::match(['delete', 'post'], 'dashboard/attendances/{id}', [AttendanceController::class, 'destroy']);
    });
});

require __DIR__.'/settings.php';
