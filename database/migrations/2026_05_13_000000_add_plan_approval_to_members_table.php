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
        Schema::table('members', function (Blueprint $table) {
            if (!Schema::hasColumn('members', 'pending_plan')) {
                $table->string('pending_plan')->nullable()->after('plan');
            }

            if (!Schema::hasColumn('members', 'plan_status')) {
                $table->enum('plan_status', ['active', 'pending', 'rejected'])->default('active')->after('pending_plan');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            if (Schema::hasColumn('members', 'pending_plan')) {
                $table->dropColumn('pending_plan');
            }

            if (Schema::hasColumn('members', 'plan_status')) {
                $table->dropColumn('plan_status');
            }
        });
    }
};
