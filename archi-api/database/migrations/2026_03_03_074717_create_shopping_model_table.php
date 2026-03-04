<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shopping_model', function (Blueprint $table) {
            $table->id();
            // 👇 CORREGIDO: 'shopping' es el nombre de tu tabla
            $table->foreignId('shopping_id')->constrained('shopping')->onDelete('cascade');
            $table->foreignId('model_id')->constrained('models')->onDelete('cascade');
            $table->string('license_type')->default('personal');
            $table->decimal('unit_price', 10, 2);
            $table->integer('quantity')->default(1);
            $table->timestamps();
            
            $table->index(['shopping_id', 'model_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shopping_model');
    }
};