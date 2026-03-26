<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "\n=== ELIMINANDO DATA Y RECREANDO TABLA ===\n";

try {
    // 1. Remover todas las foreign keys
    echo "1. Removiendo foreign keys...\n";
    $constraints = DB::select("SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'user_licenses' AND REFERENCED_TABLE_NAME IS NOT NULL");
    
    foreach ($constraints as $constraint) {
        try {
            DB::statement("ALTER TABLE user_licenses DROP FOREIGN KEY {$constraint->CONSTRAINT_NAME}");
            echo "   ✅ Removida FK: {$constraint->CONSTRAINT_NAME}\n";
        } catch (Exception $e) {
            echo "   Error removiendo {$constraint->CONSTRAINT_NAME}: " . $e->getMessage() . "\n";
        }
    }
    
    // 2. Remover todos los índices excepto PRIMARY
    echo "2. Removiendo índices...\n";
    DB::statement("ALTER TABLE user_licenses DROP KEY IF EXISTS unique_user_model");
    echo "   ✅ Índice unique_user_model removido\n";
    
    // 3. Re-agregar las foreign keys sin el constraint unique
    echo "3. Re-agregando foreign keys...\n";
    DB::statement("ALTER TABLE user_licenses ADD CONSTRAINT fk_user_licenses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE");
    echo "   ✅ FK user agregada\n";
    
    DB::statement("ALTER TABLE user_licenses ADD CONSTRAINT fk_user_licenses_model FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE");
    echo "   ✅ FK model agregada\n";
    
    DB::statement("ALTER TABLE user_licenses ADD CONSTRAINT fk_user_licenses_shopping FOREIGN KEY (shopping_id) REFERENCES shopping(id) ON DELETE CASCADE");
    echo "   ✅ FK shopping agregada\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== ÍNDICES FINALES ===\n";
$allKeys = DB::select("SHOW KEYS FROM user_licenses");
foreach ($allKeys as $key) {
    echo "  - {$key->Key_name} ({$key->Column_name})\n";
}

echo "\n";
