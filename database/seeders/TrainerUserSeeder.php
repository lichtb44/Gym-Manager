<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TrainerUserSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->trainers() as $trainer) {
            User::updateOrCreate(
                ['email' => $trainer['email']],
                [
                    'name' => $trainer['name'],
                    'password' => Hash::make('password'),
                    'role' => 'trainer',
                    'trainer_profile_id' => $trainer['profile_id'],
                    'email_verified_at' => now(),
                ],
            );
        }
    }

    /**
     * @return array<int, array{name: string, email: string, profile_id: int}>
     */
    private function trainers(): array
    {
        return [
            ['profile_id' => 1, 'name' => 'John Cena', 'email' => 'john.cena@gymfit.test'],
            ['profile_id' => 2, 'name' => 'The Rock', 'email' => 'the.rock@gymfit.test'],
            ['profile_id' => 3, 'name' => 'Arnold Schwarzenegger', 'email' => 'arnold.schwarzenegger@gymfit.test'],
            ['profile_id' => 4, 'name' => 'Sylvester Gardenzio Stallone', 'email' => 'sylvester.stallone@gymfit.test'],
            ['profile_id' => 5, 'name' => 'Ma Dong-seok', 'email' => 'ma.dong-seok@gymfit.test'],
        ];
    }
}
