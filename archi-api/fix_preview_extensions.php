<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use Illuminate\Support\Facades\DB;

echo "=== CORRIGIENDO EXTENSIONES DE PREVIEW ===\n\n";

// 1. Cambiar .jpg a .svg (porque los archivos son .svg)
$actualizados = DB::statement("
    UPDATE model_files 
    SET file_url = REPLACE(file_url, '.jpg', '.svg') 
    WHERE file_type = 'preview' 
    AND file_url LIKE '%.jpg'
");

echo "✅ Registros actualizados de .jpg a .svg: " . $actualizados . "\n";

// 2. Verificar resultados
$totalSvg = DB::table('model_files')
    ->where('file_type', 'preview')
    ->where('file_url', 'like', '%.svg')
    ->count();

$totalJpg = DB::table('model_files')
    ->where('file_type', 'preview')
    ->where('file_url', 'like', '%.jpg')
    ->count();

echo "\n📊 ESTADO ACTUAL:\n";
echo "   Archivos .svg: $totalSvg\n";
echo "   Archivos .jpg: $totalJpg\n";

if ($totalJpg > 0) {
    echo "⚠️  Aún quedan $totalJpg registros con .jpg que deberían ser .svg\n";
} else {
    echo "✅ Todos los registros tienen la extensión correcta (.svg)\n";
}