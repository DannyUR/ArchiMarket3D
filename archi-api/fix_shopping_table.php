<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "\n=== ESTRUCTURA DE TABLA 'shopping' ===\n";

$columns = DB::select("DESCRIBE shopping");
echo "Columnas existentes:\n";
foreach ($columns as $col) {
    echo "  - {$col->Field} ({$col->Type})\n";
}

echo "\n=== AGREGANDO COLUMNAS FALTANTES ===\n";

// Verificar si existen las columnas necesarias
if (!Schema::hasColumn('shopping', 'status')) {
    echo "Agregando columna 'status'...\n";
    Schema::table('shopping', function ($table) {
        $table->enum('status', ['pending', 'completed', 'cancelled'])->default('pending')->after('total');
    });
    echo "✅ Columna 'status' agregada\n";
} else {
    echo "✅ Columna 'status' ya existe\n";
}

if (!Schema::hasColumn('shopping', 'payment_provider')) {
    echo "Agregando columna 'payment_provider'...\n";
    Schema::table('shopping', function ($table) {
        $table->string('payment_provider')->nullable()->after('status');
    });
    echo "✅ Columna 'payment_provider' agregada\n";
} else {
    echo "✅ Columna 'payment_provider' ya existe\n";
}

if (!Schema::hasColumn('shopping', 'payment_id')) {
    echo "Agregando columna 'payment_id'...\n";
    Schema::table('shopping', function ($table) {
        $table->string('payment_id')->nullable()->after('payment_provider');
    });
    echo "✅ Columna 'payment_id' agregada\n";
} else {
    echo "✅ Columna 'payment_id' ya existe\n";
}

echo "\n=== NUEVA ESTRUCTURA ===\n";
$columns = DB::select("DESCRIBE shopping");
foreach ($columns as $col) {
    echo "  - {$col->Field} ({$col->Type})\n";
}

echo "\n";
