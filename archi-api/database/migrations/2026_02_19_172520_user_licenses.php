<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_licenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('model_id')->constrained('models')->onDelete('cascade');
            $table->foreignId('shopping_id')->constrained('shopping')->onDelete('cascade');
            $table->enum('license_type', ['personal', 'business', 'unlimited']);
            $table->decimal('price_paid', 10, 2);
            $table->date('expires_at')->nullable(); // Si las licencias expiran
            $table->boolean('is_active')->default(false);
            $table->timestamps();
            
            // Un usuario solo puede tener una licencia activa por modelo
            $table->unique(['user_id', 'model_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_licenses');
    }
};