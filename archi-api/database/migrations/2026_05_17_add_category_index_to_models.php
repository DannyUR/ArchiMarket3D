<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * ⚡ Add index to models.category_id for faster category queries
     */
    public function up(): void
    {
        Schema::table('models', function (Blueprint $table) {
            // Ensure index exists for category_id queries
            $table->index(['category_id'], 'idx_models_category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('models', function (Blueprint $table) {
            $table->dropIndex('idx_models_category_id');
        });
    }
};
