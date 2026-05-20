<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('non_member_visits', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('purpose')->default('Walk-in workout');
            $table->string('logged_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('entered_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('non_member_visits');
    }
};
