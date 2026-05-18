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
        'assigned_trainer_id',
        'assigned_trainer',
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
}
