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
        Schema::table('reviews', function (Blueprint $table) {
            // Agregar columna para registrar quién eliminó
            if (!Schema::hasColumn('reviews', 'deleted_by')) {
                $table->unsignedBigInteger('deleted_by')->nullable();
                $table->foreign('deleted_by')->references('id')->on('users')->nullOnDelete();
            }
            
            // Agregar razón de eliminación
            if (!Schema::hasColumn('reviews', 'deletion_reason')) {
                $table->text('deletion_reason')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\User::class, 'deleted_by');
            $table->dropColumn(['deleted_at', 'deleted_by', 'deletion_reason']);
        });
    }
};
