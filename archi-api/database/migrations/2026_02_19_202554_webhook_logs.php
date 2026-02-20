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
        Schema::create('webhook_logs', function (Blueprint $table) {
            $table->id();
            $table->string('provider'); // 'stripe', 'paypal', 'mercadopago'
            $table->string('event_type'); // 'payment.succeeded', 'payment.failed'
            $table->text('payload'); // Todo lo que envió el webhook
            $table->string('status'); // 'received', 'processed', 'failed'
            $table->text('response')->nullable(); // Lo que respondió tu sistema
            $table->string('error_message')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();
            
            // Índices para búsquedas rápidas
            $table->index(['provider', 'status']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('webhook_logs');
    }
};
