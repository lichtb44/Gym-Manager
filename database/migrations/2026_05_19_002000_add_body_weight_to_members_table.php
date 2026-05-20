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
        if (Schema::hasColumn('members', 'body_weight_kg')) {
            return;
        }

        Schema::table('members', function (Blueprint $table) {
            $table->unsignedSmallInteger('body_weight_kg')->nullable()->after('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('members', 'body_weight_kg')) {
            return;
        }

        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn('body_weight_kg');
        });
    }
};
