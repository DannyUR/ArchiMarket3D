<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('model_files', function (Blueprint $table) {
            $table->string('format', 10)->nullable()->after('file_type');
        });
    }

    public function down()
    {
        Schema::table('model_files', function (Blueprint $table) {
            $table->dropColumn('format');
        });
    }
};