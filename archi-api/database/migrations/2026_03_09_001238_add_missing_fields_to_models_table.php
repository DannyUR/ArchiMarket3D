<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('models', function (Blueprint $table) {
            // Añadir campos faltantes
            $table->string('preview_url')->nullable()->after('author_avatar');
            $table->string('embed_url')->nullable()->after('preview_url');
            $table->string('sketchfab_url')->nullable()->after('embed_url');
        });
    }

    public function down()
    {
        Schema::table('models', function (Blueprint $table) {
            $table->dropColumn(['preview_url', 'embed_url', 'sketchfab_url']);
        });
    }
};