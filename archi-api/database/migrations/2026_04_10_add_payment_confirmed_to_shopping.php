<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shopping', function (Blueprint $table) {
            $table->dateTime('payment_confirmed_at')->nullable()->after('payment_provider');
        });
    }

    public function down(): void
    {
        Schema::table('shopping', function (Blueprint $table) {
            $table->dropColumn('payment_confirmed_at');
        });
    }
};
