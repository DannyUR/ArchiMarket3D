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
                'author_bio'
            ]);
        });
    }
};
