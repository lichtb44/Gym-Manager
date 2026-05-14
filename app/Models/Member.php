<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'plan',
        'plan_started_at',
        'pending_plan',
        'plan_status',
        'status',
        'join_date',
    ];

    protected $casts = [
        'join_date' => 'date',
        'plan_started_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
