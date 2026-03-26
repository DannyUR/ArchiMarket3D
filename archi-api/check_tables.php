<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "\n=== VERIFICACIÓN DE TABLAS ===\n";

$tables = [
    'user_licenses',
    'shopping',
    'models',
    'users',
    'shopping_details'
];

foreach ($tables as $table) {
    $exists = Schema::hasTable($table);
    $status = $exists ? '✅ EXISTE' : '❌ NO EXISTE';
    echo "$status: $table\n";
}

echo "\n=== LISTAR TODAS LAS TABLAS EN LA BASE DE DATOS ===\n";
$allTables = DB::select('SHOW TABLES');
foreach ($allTables as $table) {
    $tableName = $table->{'Tables_in_archimarket3d'};
    echo "  - $tableName\n";
}

echo "\n";
