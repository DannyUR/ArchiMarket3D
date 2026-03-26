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
        Schema::table('model_files', function (Blueprint $table) {
            // Agregar campos si no existen
            if (!Schema::hasColumn('model_files', 'format')) {
                $table->string('format')->nullable()->after('file_type')->comment('Formato del archivo (GLB, OBJ, FBX, GLTF, etc)');
            }
            
            if (!Schema::hasColumn('model_files', 'size_bytes')) {
                $table->unsignedBigInteger('size_bytes')->nullable()->after('format')->comment('Tamaño del archivo en bytes');
            }

            if (!Schema::hasColumn('model_files', 'original_name')) {
                $table->string('original_name')->nullable()->after('size_bytes')->comment('Nombre original del archivo');
            }

            if (!Schema::hasColumn('model_files', 'origin')) {
                $table->string('origin')->nullable()->after('original_name')->comment('Origen del archivo (sketchfab, manual, etc)');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('model_files', function (Blueprint $table) {
            $table->dropColumnIfExists('format');
            $table->dropColumnIfExists('size_bytes');
            $table->dropColumnIfExists('original_name');
            $table->dropColumnIfExists('origin');
        });
    }
};
