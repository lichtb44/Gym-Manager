<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainerRating extends Model
{
    protected $table = 'trainer_ratings';

    protected $fillable = [
        'trainer_id',
        'member_id',
        'rating',
        'review',
        'status',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'member_id');
    }
}
