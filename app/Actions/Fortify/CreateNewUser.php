<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $isAdmin = strtolower($input['email']) === User::ADMIN_EMAIL;

        return User::create([
            'name' => $isAdmin ? 'admin' : $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role' => $isAdmin ? 'admin' : 'member',
        ]);
    }
}
