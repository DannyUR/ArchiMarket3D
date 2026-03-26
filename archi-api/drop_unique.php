<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "\n=== REMOVIENDO CONSTRAINT UNIQUE ===\n";

try {
    DB::statement("ALTER TABLE user_licenses DROP KEY unique_user_model");
    echo "✅ Constraint UNIQUE removido correctamente\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n";
