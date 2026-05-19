<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $now = now();

        DB::table('users')->updateOrInsert(
            ['email' => 'admin1@gmail.com'],
            [
                'name' => 'admin',
                'role' => 'admin',
                'email_verified_at' => $now,
                'password' => Hash::make('password'),
                'updated_at' => $now,
                'created_at' => $now,
            ]
        );

        foreach ($this->plans() as $plan) {
            DB::table('plans')->updateOrInsert(
                ['name' => $plan['name']],
                [
                    'duration' => $plan['duration'],
                    'price' => $plan['price'],
                    'description' => $plan['description'],
                    'status' => 'Active',
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }

    /**
     * @return array<int, array{name: string, duration: string, price: float, description: string}>
     */
    private function plans(): array
    {
        return [
            [
                'name' => 'Basic',
                'duration' => '1 Month',
                'price' => 29.99,
                'description' => 'Access to gym equipment during off-peak hours.',
            ],
            [
                'name' => 'Standard',
                'duration' => '1 Month',
                'price' => 49.99,
                'description' => 'Access to gym equipment and group classes.',
            ],
            [
                'name' => 'Premium',
                'duration' => '1 Month',
                'price' => 79.99,
                'description' => 'Full access to all facilities and classes.',
            ],
        ];
    }
};
