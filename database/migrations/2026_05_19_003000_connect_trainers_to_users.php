<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'trainer_profile_id')) {
                $table->unsignedInteger('trainer_profile_id')->nullable()->unique()->after('role');
            }
        });

        if (Schema::hasTable('trainer_requests')) {
            Schema::table('trainer_requests', function (Blueprint $table) {
                if (!Schema::hasColumn('trainer_requests', 'requested_trainer_user_id')) {
                    $table->foreignId('requested_trainer_user_id')
                        ->nullable()
                        ->after('requested_trainer')
                        ->constrained('users')
                        ->nullOnDelete();
                }

                if (!Schema::hasColumn('trainer_requests', 'assigned_trainer_user_id')) {
                    $table->foreignId('assigned_trainer_user_id')
                        ->nullable()
                        ->after('assigned_trainer')
                        ->constrained('users')
                        ->nullOnDelete();
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('trainer_requests')) {
            Schema::table('trainer_requests', function (Blueprint $table) {
                if (Schema::hasColumn('trainer_requests', 'requested_trainer_user_id')) {
                    $table->dropConstrainedForeignId('requested_trainer_user_id');
                }

                if (Schema::hasColumn('trainer_requests', 'assigned_trainer_user_id')) {
                    $table->dropConstrainedForeignId('assigned_trainer_user_id');
                }
            });
        }

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'trainer_profile_id')) {
                $table->dropUnique(['trainer_profile_id']);
                $table->dropColumn('trainer_profile_id');
            }
        });
    }
};
