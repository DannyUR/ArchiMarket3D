<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
        // database/migrations/xxxx_add_sketchfab_id_to_models_table.php
    public function up()
    {
        Schema::table('models', function (Blueprint $table) {
            $table->string('sketchfab_id')->nullable()->after('price');
        });
    }

    public function down()
    {
        Schema::table('models', function (Blueprint $table) {
            $table->dropColumn('sketchfab_id');
        });
    }
};
