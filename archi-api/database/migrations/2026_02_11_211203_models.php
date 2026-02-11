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
        Schema::create('models', function(Blueprint $table){
            $table->id();
            $table->string('name');
            $table->string('description');
            $table->decimal('price');
            $table->enum('format',['.DWG', '.DXF', '.RVT', '.SKP', '.3DS', '.OBJ', '.FBX', '.IFC', '.DAE', '.GLTF', '.GLB', '.STL', '.3DM', '.PLN', '.3MF', '.BLEND'])->default('.blend');
            $table->decimal('size_mb');
            $table->foreignId('categories_id')->constrained()->onDelete('cascade');
            $table->date('publication_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
