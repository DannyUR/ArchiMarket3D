// database/migrations/2024_01_01_000002_create_achievements_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description');
            $table->string('icon');
            $table->string('condition_type'); // 'purchases', 'reviews', 'likes', 'level'
            $table->integer('condition_value');
            $table->integer('xp_reward')->default(0);
            $table->timestamps();
        });

        // Insertar logros básicos
        DB::table('achievements')->insert([
            ['name' => 'Primera Compra', 'description' => 'Realiza tu primera compra', 'icon' => '🛒', 'condition_type' => 'purchases', 'condition_value' => 1, 'xp_reward' => 50],
            ['name' => 'Coleccionista', 'description' => 'Realiza 5 compras', 'icon' => '📦', 'condition_type' => 'purchases', 'condition_value' => 5, 'xp_reward' => 100],
            ['name' => 'Crítico', 'description' => 'Escribe tu primera reseña', 'icon' => '⭐', 'condition_type' => 'reviews', 'condition_value' => 1, 'xp_reward' => 20],
            ['name' => 'Influyente', 'description' => 'Recibe 10 likes en tus reseñas', 'icon' => '❤️', 'condition_type' => 'likes', 'condition_value' => 10, 'xp_reward' => 50],
            ['name' => 'Maestro', 'description' => 'Alcanza el nivel 10', 'icon' => '🏆', 'condition_type' => 'level', 'condition_value' => 10, 'xp_reward' => 200],
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('achievements');
    }
};