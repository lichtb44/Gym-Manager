<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainerRequest extends Model
{
    protected $fillable = [
        'member_id',
        'requested_trainer_id',
        'requested_trainer',
        'requested_trainer_user_id',
        'assigned_trainer_id',
        'assigned_trainer',
        'assigned_trainer_user_id',
        'status',
        'decided_at',
    ];

    protected $casts = [
        'decided_at' => 'datetime',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function requestedTrainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_trainer_user_id');
    }

    public function assignedTrainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_trainer_user_id');
    }
}
