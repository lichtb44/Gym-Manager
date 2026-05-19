<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Plan::updateOrCreate(
            ['name' => 'Basic'],
            [
                'duration' => '1 Month',
                'price' => 29.99,
                'description' => 'Access to gym equipment during off-peak hours.',
                'status' => 'Active',
            ]
        );

        Plan::updateOrCreate(
            ['name' => 'Standard'],
            [
                'duration' => '1 Month',
                'price' => 49.99,
                'description' => 'Access to gym equipment and group classes.',
                'status' => 'Active',
            ]
        );

        Plan::updateOrCreate(
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
