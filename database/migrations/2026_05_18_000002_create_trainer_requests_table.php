<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trainer_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('requested_trainer_id');
            $table->string('requested_trainer');
            $table->unsignedInteger('assigned_trainer_id')->nullable();
            $table->string('assigned_trainer')->nullable();
            $table->string('status')->default('Pending');
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trainer_requests');
    }
};
