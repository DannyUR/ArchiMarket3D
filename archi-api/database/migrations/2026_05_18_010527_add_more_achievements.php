<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Insertar logros adicionales (si no existen)
        $existingAchievements = DB::table('achievements')->pluck('name')->toArray();
        
        $newAchievements = [
            // Logros de compras adicionales
            ['name' => 'Aprendiz', 'description' => 'Realiza 3 compras', 'icon' => '📚', 'condition_type' => 'purchases', 'condition_value' => 3, 'xp_reward' => 50],
            ['name' => 'Comprador Frecuente', 'description' => 'Realiza 10 compras', 'icon' => '🛍️', 'condition_type' => 'purchases', 'condition_value' => 10, 'xp_reward' => 150],
            ['name' => 'Entusiasta', 'description' => 'Realiza 15 compras', 'icon' => '🎯', 'condition_type' => 'purchases', 'condition_value' => 15, 'xp_reward' => 150],
            ['name' => 'Experto', 'description' => 'Realiza 20 compras', 'icon' => '🏅', 'condition_type' => 'purchases', 'condition_value' => 20, 'xp_reward' => 200],
            ['name' => 'Coleccionista Experto', 'description' => 'Realiza 30 compras', 'icon' => '🏆', 'condition_type' => 'purchases', 'condition_value' => 30, 'xp_reward' => 250],
            ['name' => 'Maestro Coleccionista', 'description' => 'Realiza 50 compras', 'icon' => '👑', 'condition_type' => 'purchases', 'condition_value' => 50, 'xp_reward' => 500],
            ['name' => 'Leyenda', 'description' => 'Realiza 100 compras', 'icon' => '🌟', 'condition_type' => 'purchases', 'condition_value' => 100, 'xp_reward' => 1000],
            
            // Logros de reseñas adicionales
            ['name' => 'Opinador', 'description' => 'Escribe 3 reseñas', 'icon' => '💬', 'condition_type' => 'reviews', 'condition_value' => 3, 'xp_reward' => 40],
            ['name' => 'Reseñador', 'description' => 'Escribe 5 reseñas', 'icon' => '📝', 'condition_type' => 'reviews', 'condition_value' => 5, 'xp_reward' => 60],
            ['name' => 'Crítico Frecuente', 'description' => 'Escribe 10 reseñas', 'icon' => '✍️', 'condition_type' => 'reviews', 'condition_value' => 10, 'xp_reward' => 100],
            ['name' => 'Crítico Profesional', 'description' => 'Escribe 15 reseñas', 'icon' => '🎓', 'condition_type' => 'reviews', 'condition_value' => 15, 'xp_reward' => 120],
            ['name' => 'Crítico Experto', 'description' => 'Escribe 25 reseñas', 'icon' => '🏅', 'condition_type' => 'reviews', 'condition_value' => 25, 'xp_reward' => 200],
            ['name' => 'Crítico Master', 'description' => 'Escribe 50 reseñas', 'icon' => '👑', 'condition_type' => 'reviews', 'condition_value' => 50, 'xp_reward' => 400],
            
            // Logros de likes adicionales
            ['name' => 'Primer Like', 'description' => 'Recibe tu primer like', 'icon' => '👍', 'condition_type' => 'likes', 'condition_value' => 1, 'xp_reward' => 10],
            ['name' => 'Popular', 'description' => 'Recibe 5 likes', 'icon' => '😊', 'condition_type' => 'likes', 'condition_value' => 5, 'xp_reward' => 20],
            ['name' => 'Famoso', 'description' => 'Recibe 25 likes', 'icon' => '⭐', 'condition_type' => 'likes', 'condition_value' => 25, 'xp_reward' => 75],
            ['name' => 'Reconocido', 'description' => 'Recibe 50 likes', 'icon' => '🏆', 'condition_type' => 'likes', 'condition_value' => 50, 'xp_reward' => 100],
            ['name' => 'Influencer', 'description' => 'Recibe 75 likes', 'icon' => '📱', 'condition_type' => 'likes', 'condition_value' => 75, 'xp_reward' => 150],
            ['name' => 'Celebridad', 'description' => 'Recibe 100 likes', 'icon' => '🌟', 'condition_type' => 'likes', 'condition_value' => 100, 'xp_reward' => 200],
            ['name' => 'Super Star', 'description' => 'Recibe 250 likes', 'icon' => '✨', 'condition_type' => 'likes', 'condition_value' => 250, 'xp_reward' => 400],
            
            // Logros de nivel adicionales
            ['name' => 'Principiante', 'description' => 'Alcanza el nivel 2', 'icon' => '🌱', 'condition_type' => 'level', 'condition_value' => 2, 'xp_reward' => 20],
            ['name' => 'Aprendiz', 'description' => 'Alcanza el nivel 5', 'icon' => '📘', 'condition_type' => 'level', 'condition_value' => 5, 'xp_reward' => 50],
            ['name' => 'Experto', 'description' => 'Alcanza el nivel 15', 'icon' => '🎯', 'condition_type' => 'level', 'condition_value' => 15, 'xp_reward' => 150],
            ['name' => 'Dedicado', 'description' => 'Alcanza el nivel 20', 'icon' => '🔥', 'condition_type' => 'level', 'condition_value' => 20, 'xp_reward' => 200],
            ['name' => 'Veterano', 'description' => 'Alcanza el nivel 25', 'icon' => '⭐', 'condition_type' => 'level', 'condition_value' => 25, 'xp_reward' => 250],
            ['name' => 'Elite', 'description' => 'Alcanza el nivel 30', 'icon' => '💎', 'condition_type' => 'level', 'condition_value' => 30, 'xp_reward' => 300],
            ['name' => 'Leyenda', 'description' => 'Alcanza el nivel 40', 'icon' => '👑', 'condition_type' => 'level', 'condition_value' => 40, 'xp_reward' => 500],
            ['name' => 'Mítico', 'description' => 'Alcanza el nivel 50', 'icon' => '🌟', 'condition_type' => 'level', 'condition_value' => 50, 'xp_reward' => 800],
        ];
        
        foreach ($newAchievements as $achievement) {
            // Solo insertar si no existe
            if (!in_array($achievement['name'], $existingAchievements)) {
                DB::table('achievements')->insert($achievement);
            }
        }
    }

    public function down()
    {
        // Eliminar los logros agregados (opcional)
        DB::table('achievements')->whereIn('name', [
            'Aprendiz', 'Comprador Frecuente', 'Entusiasta', 'Experto', 
            'Coleccionista Experto', 'Maestro Coleccionista', 'Leyenda',
            'Opinador', 'Reseñador', 'Crítico Frecuente', 'Crítico Profesional',
            'Crítico Experto', 'Crítico Master',
            'Primer Like', 'Popular', 'Famoso', 'Reconocido', 'Influencer',
            'Celebridad', 'Super Star',
            'Principiante', 'Aprendiz', 'Experto', 'Dedicado', 'Veterano',
            'Elite', 'Leyenda', 'Mítico'
        ])->delete();
    }
};