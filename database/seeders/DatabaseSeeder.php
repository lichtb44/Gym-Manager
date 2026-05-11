<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Plan;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            MemberProfileSeeder::class,
        ]);

        // Create sample plans if they don't exist
        Plan::firstOrCreate(
            ['name' => 'Basic'],
            [
                'duration' => '1 Month',
                'price' => 29.99,
                'description' => 'Access to gym equipment during off-peak hours.',
                'status' => 'Active',
            ]
        );

        Plan::firstOrCreate(
            ['name' => 'Standard'],
            [
                'duration' => '1 Month',
                'price' => 49.99,
                'description' => 'Access to gym equipment and group classes.',
                'status' => 'Active',
            ]
        );

        Plan::firstOrCreate(
            ['name' => 'Premium'],
            [
                'duration' => '1 Month',
                'price' => 79.99,
                'description' => 'Full access to all facilities and classes.',
                'status' => 'Active',
            ]
        );
    }
}
