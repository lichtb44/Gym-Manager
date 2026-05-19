<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    public const DEFAULT_NAMES = ['Basic', 'Standard', 'Premium'];

    protected $fillable = [
        'name',
        'duration',
        'price',
        'description',
        'status',
    ];

    public function isDefault(): bool
    {
        return in_array($this->name, self::DEFAULT_NAMES, true);
    }
}
