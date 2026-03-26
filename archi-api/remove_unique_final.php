<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "\n=== REMOVIENDO CONSTRAINT UNIQUE DE user_licenses ===\n";

try {
    // Primero, vamos a ver las keys existentes
    $keys = DB::select("SHOW KEYS FROM user_licenses WHERE Key_name = 'unique_user_model'");
    
    if (count($keys) > 0) {
        echo "Encontrado constraint: unique_user_model\n";
        
        // Remover el índice/constraint
        DB::statement("ALTER TABLE user_licenses DROP KEY unique_user_model");
        echo "✅ Constraint UNIQUE removido correctamente\n";
    } else {
        echo "El constraint unique_user_model no existe\n";
    }
    
    // Verificar que fue removido
    $keysAfter = DB::select("SHOW KEYS FROM user_licenses WHERE Key_name = 'unique_user_model'");
    if (count($keysAfter) === 0) {
        echo "✅ Verificación: El constraint ha sido completamente removido\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== MOSTRANDO ÍNDICES ACTUALES ===\n";
$allKeys = DB::select("SHOW KEYS FROM user_licenses");
foreach ($allKeys as $key) {
    echo "  - {$key->Key_name} ({$key->Column_name})\n";
}

echo "\n";
