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
        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'stripe_checkout_session_id')) {
                $table->string('stripe_checkout_session_id')->nullable()->after('status');
            }

            if (!Schema::hasColumn('payments', 'stripe_payment_intent_id')) {
                $table->string('stripe_payment_intent_id')->nullable()->after('stripe_checkout_session_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'stripe_payment_intent_id')) {
                $table->dropColumn('stripe_payment_intent_id');
            }

            if (Schema::hasColumn('payments', 'stripe_checkout_session_id')) {
                $table->dropColumn('stripe_checkout_session_id');
            }
        });
    }
};
