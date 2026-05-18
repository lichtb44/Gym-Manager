<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trainer_ratings', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('trainer_id');
            $table->unsignedBigInteger('member_id');
            $table->integer('rating'); // 1-5 stars
            $table->text('review')->nullable();
            $table->timestamps();

            $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');
            $table->unique(['trainer_id', 'member_id']); // One rating per member per trainer
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainer_ratings');
    }
};
