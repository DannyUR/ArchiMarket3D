<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    protected $table = 'achievements';
    
    protected $fillable = [
        'name',
        'description',
        'icon',
        'condition_type',
        'condition_value',
        'xp_reward'
    ];

    protected $casts = [
        'condition_value' => 'integer',
        'xp_reward' => 'integer'
    ];

    /**
     * Relación con usuarios que han desbloqueado este logro
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_achievements')
                    ->withPivot('unlocked_at')
                    ->withTimestamps();
    }

    /**
     * Verificar si un usuario ha desbloqueado este logro
     */
    public function isUnlockedBy(User $user): bool
    {
        return $this->users()->where('user_id', $user->id)->exists();
    }
}