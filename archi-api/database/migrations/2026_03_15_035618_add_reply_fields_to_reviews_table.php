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
        // These fields are already added in 2026_02_22_203525_add_admin_fields_to_reviews_table
        // This migration is kept empty to maintain migration history
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op since the fields were added in a previous migration
    }
};
