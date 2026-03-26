<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "\n=== REMOVIENDO FOREIGN KEY Y CONSTRAINT UNIQUE ===\n";

try {
    // 1. Remover la foreign key fk_user_licenses_shopping
    echo "1. Removiendo foreign key fk_user_licenses_shopping...\n";
    DB::statement("ALTER TABLE user_licenses DROP FOREIGN KEY fk_user_licenses_shopping");
    echo "   ✅ Foreign key removida\n";
} catch (Exception $e) {
    echo "   No se encontró FK o ya fue removida: " . $e->getMessage() . "\n";
}

try {
    // 2. Ahora remover el constraint unique
    echo "2. Removiendo constraint UNIQUE unique_user_model...\n";
    DB::statement("ALTER TABLE user_licenses DROP KEY unique_user_model");
    echo "   ✅ Constraint UNIQUE removido\n";
} catch (Exception $e) {
    echo "   Error: " . $e->getMessage() . "\n";
}

try {
    // 3. Volver a agregar la FK sin el constraint unique
    echo "3. Re-agregando foreign key fk_user_licenses_shopping...\n";
    DB::statement("ALTER TABLE user_licenses ADD CONSTRAINT fk_user_licenses_shopping FOREIGN KEY (shopping_id) REFERENCES shopping(id) ON DELETE CASCADE");
    echo "   ✅ Foreign key re-agregada\n";
} catch (Exception $e) {
    echo "   Error: " . $e->getMessage() . "\n";
}

echo "\n=== ÍNDICES FINALES ===\n";
$allKeys = DB::select("SHOW KEYS FROM user_licenses");
foreach ($allKeys as $key) {
    echo "  - {$key->Key_name} ({$key->Column_name})\n";
}

echo "\n";
