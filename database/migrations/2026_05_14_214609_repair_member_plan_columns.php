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
        if (!Schema::hasColumn('members', 'plan_started_at')) {
            Schema::table('members', function (Blueprint $table) {
                $table->timestamp('plan_started_at')->nullable()->after('plan');
            });
        }

        if (!Schema::hasColumn('members', 'pending_plan')) {
            Schema::table('members', function (Blueprint $table) {
                $table->string('pending_plan')->nullable()->after('plan_started_at');
            });
        }

        if (!Schema::hasColumn('members', 'plan_status')) {
            Schema::table('members', function (Blueprint $table) {
                $table->string('plan_status')->default('active')->after('pending_plan');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            if (Schema::hasColumn('members', 'plan_status')) {
                $table->dropColumn('plan_status');
            }

            if (Schema::hasColumn('members', 'pending_plan')) {
                $table->dropColumn('pending_plan');
            }

            if (Schema::hasColumn('members', 'plan_started_at')) {
                $table->dropColumn('plan_started_at');
            }
        });
    }
};
