<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserStats extends Model
{
    protected $table = 'user_stats';
    
    protected $fillable = [
        'user_id', 'xp', 'level', 
        'total_purchases', 'total_reviews', 'total_likes_received'
    ];

    protected $casts = [
        'xp' => 'integer',
        'level' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calcular XP necesario para alcanzar un nivel
     */
    public static function calculateLevel(int $xp): int
    {
        // Fórmula: cada 100 XP = 1 nivel
        // Nivel 1: 0-99 XP
        // Nivel 2: 100-199 XP
        // Nivel 3: 200-299 XP
        return floor($xp / 100) + 1;
    }

    public static function xpNeededForLevel(int $level): int
    {
        if ($level <= 1) return 0;
        // XP necesario para alcanzar el nivel = (nivel - 1) * 100
        return ($level - 1) * 100;
    }
}