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
        // Index for user_licenses performance
        Schema::table('user_licenses', function (Blueprint $table) {
            $table->index(['user_id', 'model_id', 'is_active'], 'idx_user_model_active');
            $table->index(['model_id', 'is_active'], 'idx_model_active');
        });

        // Index for shopping tables
        Schema::table('shopping_details', function (Blueprint $table) {
            $table->index(['model_id'], 'idx_shopping_details_model');
        });

        Schema::table('shopping', function (Blueprint $table) {
            $table->index(['user_id', 'status'], 'idx_shopping_user_status');
        });

        // Index for reviews performance
        Schema::table('reviews', function (Blueprint $table) {
            $table->index(['model_id', 'user_id'], 'idx_reviews_model_user');
            $table->index(['model_id'], 'idx_reviews_model');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_licenses', function (Blueprint $table) {
            $table->dropIndex('idx_user_model_active');
            $table->dropIndex('idx_model_active');
        });

        Schema::table('shopping_details', function (Blueprint $table) {
            $table->dropIndex('idx_shopping_details_model');
        });

        Schema::table('shopping', function (Blueprint $table) {
            $table->dropIndex('idx_shopping_user_status');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex('idx_reviews_model_user');
            $table->dropIndex('idx_reviews_model');
        });
    }
};
