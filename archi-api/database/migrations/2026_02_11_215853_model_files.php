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
        Schema::create('model_files', function(Blueprint $table){
            $table->id();
            $table->foreignId('models_id')->constrained()->onDelete('cascade');
            $table->string('url_file');
             $table->enum('file_type',['.DWG', '.DXF', '.RVT', '.SKP', '.3DS', '.OBJ', '.FBX', '.IFC', '.DAE', '.GLTF', '.GLB', '.STL', '.3DM', '.PLN', '.3MF', '.BLEND'])->default('.DWG');
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
