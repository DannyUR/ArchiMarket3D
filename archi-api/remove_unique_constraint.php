<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "\n=== REMOVIENDO CONSTRAINT UNIQUE ===\n";

try {
    // Primero, remover el constraint UNIQUE directamente
    DB::statement("ALTER TABLE user_licenses DROP INDEX `unique_user_model`");
    echo "✅ Constraint UNIQUE removido\n";
    
} catch (Exception $e) {
    echo "Intento alternativo: " . $e->getMessage() . "\n";
    
    // Si falla, intentar remover la foreign key primero
    try {
        DB::statement("ALTER TABLE user_licenses DROP FOREIGN KEY fk_user_licenses_shopping");
    } catch (Exception $e2) {
        echo "No hay FK fk_user_licenses_shopping\n";
    }
    
    try {
        DB::statement("ALTER TABLE user_licenses DROP INDEX `unique_user_model`");
        echo "✅ Constraint UNIQUE removido\n";
    } catch (Exception $e3) {
        echo "Error: " . $e3->getMessage() . "\n";
    }
}

echo "\n";
