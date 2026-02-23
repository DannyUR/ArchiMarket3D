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
            $table->integer('polygon_count')->nullable()->after('size_mb');
            $table->integer('material_count')->nullable()->after('polygon_count');
            $table->boolean('has_animations')->default(false)->after('material_count');
            $table->boolean('has_rigging')->default(false)->after('has_animations');
            $table->json('technical_specs')->nullable()->after('has_rigging');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('models', function (Blueprint $table) {
            $table->dropColumn([
                'polygon_count',
                'material_count',
                'has_animations',
                'has_rigging',
                'technical_specs'
            ]);
        });
    }
};