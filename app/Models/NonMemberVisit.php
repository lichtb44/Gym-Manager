<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NonMemberVisit extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'purpose',
        'logged_by',
        'notes',
        'entered_at',
    ];

    protected $casts = [
        'entered_at' => 'datetime',
    ];
}
