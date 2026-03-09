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
            // Author fields
            $table->string('author_name')->nullable()->after('sketchfab_id');
            $table->text('author_avatar')->nullable()->after('author_name');
            $table->text('author_bio')->nullable()->after('author_avatar');
            
            // Technical specifications
            $table->integer('polygon_count')->nullable()->after('author_bio');
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
                'author_name',
                'author_avatar',
                'author_bio',
                'polygon_count',
                'material_count',
                'has_animations',
                'has_rigging',
                'technical_specs'
            ]);
        });
    }
};
