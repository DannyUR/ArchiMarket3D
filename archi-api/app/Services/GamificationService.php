<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserStats;
use App\Models\Achievement;
use Illuminate\Support\Facades\Log;

class GamificationService
{
    // Configuración de XP por acción
    const XP_COMPRA = 100;
    const XP_RESEÑA = 20;
    const XP_LIKE_RECIBIDO = 5;
    const XP_LOGRO_DESBLOQUEADO = 50;

    // Niveles con títulos
    const LEVEL_TITLES = [
        // Niveles 1-3: Novato
        1 => ['icon' => '🧱', 'title' => 'Novato'],
        2 => ['icon' => '🧱', 'title' => 'Novato'],
        3 => ['icon' => '🧱', 'title' => 'Novato'],
        
        // Niveles 4-7: Diseñador
        4 => ['icon' => '🏠', 'title' => 'Diseñador'],
        5 => ['icon' => '🏠', 'title' => 'Diseñador'],
        6 => ['icon' => '🏠', 'title' => 'Diseñador'],
        7 => ['icon' => '🏠', 'title' => 'Diseñador'],
        
        // Niveles 8-12: Arquitecto
        8 => ['icon' => '🏗️', 'title' => 'Arquitecto'],
        9 => ['icon' => '🏗️', 'title' => 'Arquitecto'],
        10 => ['icon' => '🏗️', 'title' => 'Arquitecto'],
        11 => ['icon' => '🏗️', 'title' => 'Arquitecto'],
        12 => ['icon' => '🏗️', 'title' => 'Arquitecto'],
        
        // Niveles 13-20: Maestro y superiores
        13 => ['icon' => '👑', 'title' => 'Maestro'],
        14 => ['icon' => '👑', 'title' => 'Gran Maestro'],
        15 => ['icon' => '👑', 'title' => 'Leyenda'],
        16 => ['icon' => '👑', 'title' => 'Mítico'],
        17 => ['icon' => '👑', 'title' => 'Épico'],
        18 => ['icon' => '👑', 'title' => 'Inmortal'],
        19 => ['icon' => '👑', 'title' => 'Trascendental'],
        20 => ['icon' => '👑', 'title' => 'Supremo'],
        
        // Niveles 21-30: Rangos superiores
        21 => ['icon' => '👑✨', 'title' => 'Arquitecto Supremo'],
        22 => ['icon' => '👑✨', 'title' => 'Visionario'],
        23 => ['icon' => '👑✨', 'title' => 'Creador'],
        24 => ['icon' => '👑✨', 'title' => 'Innovador'],
        25 => ['icon' => '👑✨', 'title' => 'Pionero'],
        26 => ['icon' => '👑✨', 'title' => 'Leyenda Viva'],
        27 => ['icon' => '👑✨', 'title' => 'Icono'],
        28 => ['icon' => '👑✨', 'title' => 'Mito'],
        29 => ['icon' => '👑✨', 'title' => 'Dios de la Arquitectura'],
        30 => ['icon' => '👑✨', 'title' => 'Inalcanzable'],
        
        // Niveles 31-40: Rangos exclusivos
        31 => ['icon' => '⭐👑⭐', 'title' => 'Celestial'],
        32 => ['icon' => '⭐👑⭐', 'title' => 'Divino'],
        33 => ['icon' => '⭐👑⭐', 'title' => 'Omnipotente'],
        34 => ['icon' => '⭐👑⭐', 'title' => 'Eterno'],
        35 => ['icon' => '⭐👑⭐', 'title' => 'Absoluto'],
        36 => ['icon' => '⭐👑⭐', 'title' => 'Infinito'],
        37 => ['icon' => '⭐👑⭐', 'title' => 'Trascendente'],
        38 => ['icon' => '⭐👑⭐', 'title' => 'Único'],
        39 => ['icon' => '⭐👑⭐', 'title' => 'Irreal'],
        40 => ['icon' => '⭐👑⭐', 'title' => 'Imposible'],
        
        // ✅ Niveles 41-50: Rangos legendarios (para el logro de nivel 50)
        41 => ['icon' => '🏆✨', 'title' => 'Leyenda Suprema'],
        42 => ['icon' => '🏆✨', 'title' => 'Inalcanzable'],
        43 => ['icon' => '🏆✨', 'title' => 'Omnipresente'],
        44 => ['icon' => '🏆✨', 'title' => 'Todopoderoso'],
        45 => ['icon' => '🏆✨', 'title' => 'Eterno'],
        46 => ['icon' => '🏆✨', 'title' => 'Infinito'],
        47 => ['icon' => '🏆✨', 'title' => 'Absoluto'],
        48 => ['icon' => '🏆✨', 'title' => 'Trascendental'],
        49 => ['icon' => '🏆✨', 'title' => 'Mítico Supremo'],
        50 => ['icon' => '🏆✨', 'title' => '⭐ LEYENDA DEFINITIVA ⭐'],
    ];

    /**
     * Inicializar estadísticas para nuevo usuario
     */
    public static function initializeStats(User $user): UserStats
    {
        return UserStats::create([
            'user_id' => $user->id,
            'xp' => 0,
            'level' => 1,
            'total_purchases' => 0,
            'total_reviews' => 0,
            'total_likes_received' => 0,
        ]);
    }

    /**
     * Agregar XP y actualizar nivel (sin verificar logros para evitar bucles)
     */
    public static function addXP(User $user, int $amount, string $reason = null, bool $skipAchievements = false)
    {
        try {
            $stats = $user->stats;
            if (!$stats) {
                $stats = self::initializeStats($user);
            }

            $oldLevel = $stats->level;
            $stats->xp += $amount;
            
            // Calcular nuevo nivel
            $newLevel = UserStats::calculateLevel($stats->xp);
            
            if ($newLevel > $oldLevel) {
                $stats->level = $newLevel;
                Log::info('🎉 Usuario subió de nivel', [
                    'user_id' => $user->id,
                    'old_level' => $oldLevel,
                    'new_level' => $newLevel
                ]);
            }
            
            $stats->save();
            
            // ✅ Solo verificar logros si no se está en medio de otra verificación
            if (!$skipAchievements) {
                self::checkAchievements($user);
            }
            
            return $stats;
            
        } catch (\Exception $e) {
            Log::error('Error en addXP: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Registrar compra
     */
    public static function recordPurchase(User $user)
    {
        try {
            $stats = $user->stats;
            if (!$stats) {
                $stats = self::initializeStats($user);
            }
            
            $stats->total_purchases++;
            $stats->save();
            
            // Agregar XP por compra
            self::addXP($user, self::XP_COMPRA, 'Compra realizada', true);
            
            Log::info('💰 Compra registrada para gamificación', [
                'user_id' => $user->id,
                'total_purchases' => $stats->total_purchases
            ]);
            
            // ✅ Verificar logros después de todo
            self::checkAchievements($user);
            
        } catch (\Exception $e) {
            Log::error('Error en recordPurchase: ' . $e->getMessage());
        }
    }

    /**
     * Registrar reseña
     */
    public static function recordReview(User $user)
    {
        try {
            $stats = $user->stats;
            if (!$stats) {
                $stats = self::initializeStats($user);
            }
            
            $stats->total_reviews++;
            $stats->save();
            
            // Agregar XP por reseña
            self::addXP($user, self::XP_RESEÑA, 'Reseña publicada', true);
            
            Log::info('⭐ Reseña registrada para gamificación', [
                'user_id' => $user->id,
                'total_reviews' => $stats->total_reviews
            ]);
            
            self::checkAchievements($user);
            
        } catch (\Exception $e) {
            Log::error('Error en recordReview: ' . $e->getMessage());
        }
    }

    /**
     * Registrar like recibido
     */
    public static function recordLikeReceived(User $user)
    {
        try {
            $stats = $user->stats;
            if (!$stats) {
                $stats = self::initializeStats($user);
            }
            
            $stats->total_likes_received++;
            $stats->save();
            
            // Agregar XP por like
            self::addXP($user, self::XP_LIKE_RECIBIDO, 'Like recibido', true);
            
            Log::info('❤️ Like registrado para gamificación', [
                'user_id' => $user->id,
                'total_likes_received' => $stats->total_likes_received
            ]);
            
            self::checkAchievements($user);
            
        } catch (\Exception $e) {
            Log::error('Error en recordLikeReceived: ' . $e->getMessage());
        }
    }

    /**
     * Verificar y desbloquear logros (sin llamar a addXP para evitar bucles)
     */
    public static function checkAchievements(User $user)
    {
        try {
            $stats = $user->stats;
            if (!$stats) return;
            
            $achievements = Achievement::all();
            $unlockedIds = $user->achievements()->pluck('achievement_id')->toArray();
            $newlyUnlocked = false;
            
            foreach ($achievements as $achievement) {
                // Saltar si ya está desbloqueado
                if (in_array($achievement->id, $unlockedIds)) {
                    continue;
                }
                
                $unlocked = false;
                
                switch ($achievement->condition_type) {
                    case 'purchases':
                        $unlocked = $stats->total_purchases >= $achievement->condition_value;
                        break;
                    case 'reviews':
                        $unlocked = $stats->total_reviews >= $achievement->condition_value;
                        break;
                    case 'likes':
                        $unlocked = $stats->total_likes_received >= $achievement->condition_value;
                        break;
                    case 'level':
                        $unlocked = $stats->level >= $achievement->condition_value;
                        break;
                    default:
                        $unlocked = false;
                        break;
                }
                
                if ($unlocked) {
                    // Desbloquear logro
                    $user->achievements()->syncWithoutDetaching([
                        $achievement->id => ['unlocked_at' => now()]
                    ]);
                    $newlyUnlocked = true;
                    
                    Log::info('🏆 Logro desbloqueado', [
                        'user_id' => $user->id,
                        'achievement' => $achievement->name,
                        'xp_reward' => $achievement->xp_reward
                    ]);
                    
                    // Dar XP extra por logro (sin volver a verificar logros)
                    if ($achievement->xp_reward > 0) {
                        self::addXP($user, $achievement->xp_reward, "Logro: {$achievement->name}", true);
                    }
                }
            }
            
            // Si se desbloquearon nuevos logros, verificar nuevamente por si hay logros encadenados
            if ($newlyUnlocked) {
                self::checkAchievements($user);
            }
            
        } catch (\Exception $e) {
            Log::error('Error en checkAchievements: ' . $e->getMessage());
        }
    }

    /**
     * Obtener descuento por nivel
     */
    public static function getDiscount(User $user): float
    {
        try {
            $stats = $user->stats;
            if (!$stats) return 0;
            
            $level = $stats->level;
            
            if ($level >= 20) return 0.15; // 15%
            if ($level >= 10) return 0.10; // 10%
            if ($level >= 5) return 0.05;  // 5%
            
            return 0;
            
        } catch (\Exception $e) {
            Log::error('Error en getDiscount: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Obtener información completa del usuario
     */
    public static function getUserGamificationData(User $user): array
    {
        try {
            $stats = $user->stats;
            if (!$stats) {
                $stats = self::initializeStats($user);
            }
            
            $currentXP = $stats->xp;
            $currentLevel = $stats->level;
            
            $xpCurrentLevel = UserStats::xpNeededForLevel($currentLevel);
            $xpNextLevel = UserStats::xpNeededForLevel($currentLevel + 1);
            
            $progress = 0;
            if ($xpNextLevel > $xpCurrentLevel) {
                $progress = ($currentXP - $xpCurrentLevel) / ($xpNextLevel - $xpCurrentLevel);
                $progress = max(0, min(1, $progress));
            }
            
            // Obtener título del nivel
            $levelInfo = self::LEVEL_TITLES[$currentLevel] ?? [
                'icon' => '🏆',
                'title' => 'Nivel ' . $currentLevel
            ];
            
            // Obtener logros del usuario (ya desbloqueados)
            $unlockedAchievements = $user->achievements()->get()->map(function($a) {
                return [
                    'id' => $a->id,
                    'name' => $a->name,
                    'description' => $a->description,
                    'icon' => $a->icon,
                    'unlocked_at' => $a->pivot->unlocked_at,
                ];
            })->keyBy('id');
            
            // Incluir logros bloqueados
            $allAchievements = Achievement::all();
            $achievements = $allAchievements->map(function($achievement) use ($unlockedAchievements) {
                $unlocked = $unlockedAchievements->get($achievement->id);
                return [
                    'id' => $achievement->id,
                    'name' => $achievement->name,
                    'description' => $achievement->description,
                    'icon' => $achievement->icon,
                    'unlocked_at' => $unlocked ? $unlocked['unlocked_at'] : null,
                ];
            });
            
            return [
                'xp' => $currentXP,
                'level' => $currentLevel,
                'level_icon' => $levelInfo['icon'],
                'level_title' => $levelInfo['title'],
                'xp_current_level' => $xpCurrentLevel,
                'xp_next_level' => $xpNextLevel,
                'progress' => $progress * 100,
                'discount' => self::getDiscount($user),
                'total_purchases' => $stats->total_purchases,
                'total_reviews' => $stats->total_reviews,
                'total_likes_received' => $stats->total_likes_received,
                'achievements' => $achievements,
            ];
            
        } catch (\Exception $e) {
            Log::error('Error en getUserGamificationData: ' . $e->getMessage());
            
            return [
                'xp' => 0,
                'level' => 1,
                'level_icon' => '🧱',
                'level_title' => 'Novato',
                'xp_current_level' => 0,
                'xp_next_level' => 100,
                'progress' => 0,
                'discount' => 0,
                'total_purchases' => 0,
                'total_reviews' => 0,
                'total_likes_received' => 0,
                'achievements' => [],
            ];
        }
    }
}