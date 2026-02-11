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
        Schema::create('mixed_reality', function(Blueprint $table){
            $table->id();
            $table->foreignId('models_id')->constrained()->onDelete('cascade');
            $table->boolean('compatible');
            $table->enum('format',['HoloLens', 'ARCore', 'ARKit', 'WebXR', 'Unity', 'Unreal Engine', 'Vuforia', 'Meta Quest', '8th Wall', 'Spark AR', 'Blender', 'Amazon Sumerian', 'Wikitude', 'ZapWorks', 'Niantic Lightship', 'MRTK', 'A-Frame', 'Three.js'])->default('HoloLens');
            $table->string('notes');
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
