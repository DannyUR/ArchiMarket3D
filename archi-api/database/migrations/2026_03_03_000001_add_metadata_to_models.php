<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('models', function (Blueprint $table) {
            // Agregar columna de metadatos como JSON
            $table->json('metadata')->nullable()->after('size_mb');
            // Agregar columna de tipo de categoría para mejor filtrado
            $table->string('category_type')->nullable()->after('category_id')->comment('Tipo principal: estructural, arquitectura, instalaciones, mobiliario, maquinaria, urbanismo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('models', function (Blueprint $table) {
            $table->dropColumn('metadata');
            $table->dropColumn('category_type');
        });
    }
};
