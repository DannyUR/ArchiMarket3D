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
            $table->foreignId('model_id') ->unique()->constrained()->onDelete('cascade');
            $table->boolean('compatible')->default(true);
            $table->enum('platform', ['HoloLens','ARCore','ARKit','WebXR','Unity','Unreal','MetaQuest']);
            $table->text('notes')->nullable();
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
