// database/migrations/2024_01_01_000001_create_user_stats_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('xp')->default(0);
            $table->integer('level')->default(1);
            $table->integer('total_purchases')->default(0);
            $table->integer('total_reviews')->default(0);
            $table->integer('total_likes_received')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_stats');
    }
};