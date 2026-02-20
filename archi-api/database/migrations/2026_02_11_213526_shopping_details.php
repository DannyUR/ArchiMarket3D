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
        Schema::create('shopping_details', function(Blueprint $table){
            $table->id();
            $table->foreignId('shopping_id')->constrained('shopping')->onDelete('cascade');
            $table->foreignId('model_id')->constrained()->onDelete('cascade');
            $table->decimal('unit_price', 10, 2);
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
