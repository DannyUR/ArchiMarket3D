<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== DEBUG USER LICENSES ===\n\n";

// Usuario 8, Modelo 1657
$userId = 8;
$modelId = 1657;

echo "Búsqueda: user_id = $userId, model_id = $modelId\n\n";

// 1. Ver todas las licencias del usuario 8
echo "1️⃣  TODAS las licencias del usuario $userId:\n";
$userLicenses = DB::table('user_licenses')
    ->where('user_id', $userId)
    ->get();

if ($userLicenses->count() > 0) {
    foreach ($userLicenses as $license) {
        echo "   - License ID: {$license->id}\n";
        echo "     Model ID: {$license->model_id}\n";
        echo "     is_active: {$license->is_active}\n";
        echo "     expires_at: {$license->expires_at}\n";
        echo "     license_type: {$license->license_type}\n";
        echo "\n";
    }
} else {
    echo "   ❌ El usuario $userId NO tiene ninguna licencia\n\n";
}

// 2. Ver la licencia específica para el modelo
echo "2️⃣  Licencia específica para modelo $modelId:\n";
$specificLicense = DB::table('user_licenses')
    ->where('user_id', $userId)
    ->where('model_id', $modelId)
    ->first();

if ($specificLicense) {
    echo "   ✅ ENCONTRADA\n";
    echo "   License ID: {$specificLicense->id}\n";
    echo "   is_active: {$specificLicense->is_active}\n";
    echo "   expires_at: {$specificLicense->expires_at}\n";
    echo "   license_type: {$specificLicense->license_type}\n";
} else {
    echo "   ❌ NO ENCONTRADA\n";
}

echo "\n3️⃣  Verificando si exists() devuelve el valor correcto:\n";
$exists = DB::table('user_licenses')
    ->where('user_id', $userId)
    ->where('model_id', $modelId)
    ->exists();
echo "   exists() result: " . ($exists ? 'TRUE' : 'FALSE') . "\n";

// 4. Ver información de compras del usuario
echo "\n4️⃣  Compras del usuario $userId para modelo $modelId:\n";
$purchases = DB::table('shopping_details')
    ->where('model_id', $modelId)
    ->join('shopping', 'shopping.id', '=', 'shopping_details.shopping_id')
    ->where('shopping.user_id', $userId)
    ->select('shopping_details.*', 'shopping.status', 'shopping.created_at')
    ->get();

if ($purchases->count() > 0) {
    foreach ($purchases as $purchase) {
        echo "   Shopping Detail ID: {$purchase->id}\n";
        echo "   Shopping Status: {$purchase->status}\n";
        echo "   Created: {$purchase->created_at}\n";
    }
} else {
    echo "   ❌ No hay compras registradas\n";
}

echo "\n=== FIN DEBUG ===\n";
?>
