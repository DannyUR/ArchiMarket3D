<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "\n=== 🔍 ANÁLISIS COMPLETO DEL MODELO QUINUAL ===\n\n";

// 1. Información de la tabla models
echo "1️⃣  TABLA MODELS (BD):\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

$modelData = DB::table('models')->where('name', 'like', '%Quinual%')->first();

if ($modelData) {
    $modelObj = json_decode(json_encode($modelData), true);
    foreach ($modelObj as $key => $value) {
        if (is_null($value)) {
            echo "  $key: NULL\n";
        } elseif (is_array($value)) {
            echo "  $key: [array]\n";
        } elseif (strlen($value) > 100) {
            echo "  $key: " . substr($value, 0, 100) . "...\n";
        } else {
            echo "  $key: $value\n";
        }
    }
}

// 2. Información de METADATOS
echo "\n2️⃣  METADATOS (JSON):\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
if ($modelData && $modelData->metadata) {
    $metadata = json_decode($modelData->metadata, true);
    echo json_encode($metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
}

// 3. Información de ARCHIVOS
echo "\n3️⃣  TABLA MODEL_FILES (Archivos descargables):\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

$files = DB::table('model_files')
    ->where('model_id', $modelData->id)
    ->get();

echo "Total de archivos: " . count($files) . "\n";

if (count($files) > 0) {
    foreach ($files as $file) {
        echo "\n  Archivo ID {$file->id}:\n";
        echo "    - file_type: {$file->file_type}\n";
        echo "    - format: {$file->format}\n";
        echo "    - origin: {$file->origin}\n";
        echo "    - size_bytes: {$file->size_bytes}\n";
        echo "    - size_mb: " . round($file->size_bytes / 1024 / 1024, 2) . " MB\n";
        echo "    - file_url: " . substr($file->file_url, 0, 100) . "...\n";
        echo "    - original_name: {$file->original_name}\n";
    }
} else {
    echo "  ⚠️ No hay archivos en model_files\n";
}

// 4. Información TÉCNICA
echo "\n4️⃣  INFORMACIÓN TÉCNICA:\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "  ID del modelo: {$modelData->id}\n";
echo "  Nombre: {$modelData->name}\n";
echo "  Sketchfab ID: {$modelData->sketchfab_id}\n";
echo "  Embed URL: " . ($modelData->embed_url ?? 'NO TIENE') . "\n";
echo "  Categoría ID: {$modelData->category_id}\n";
echo "  Estado: " . ($modelData->status ?? 'VACÍO') . "\n";
echo "  ¿En rango 1-75?: " . (($modelData->id >= 1 && $modelData->id <= 75) ? "✅ SÍ" : "❌ NO (ID {$modelData->id})") . "\n";

// 5. Verificar archivo en el sistema de archivos
echo "\n5️⃣  VERIFICACIÓN SISTEMA DE ARCHIVOS:\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
$pathPattern = storage_path("app/public/models/{$modelData->id}");
$glbFiles = glob("$pathPattern/*.glb");
$objFiles = glob("$pathPattern/*.obj");
echo "  Carpeta: {$pathPattern}\n";
echo "  GLB files: " . count($glbFiles) . "\n";
echo "  OBJ files: " . count($objFiles) . "\n";
if (count($glbFiles) > 0) {
    foreach ($glbFiles as $file) {
        echo "    ✓ " . basename($file) . " (" . round(filesize($file)/1024/1024, 2) . " MB)\n";
    }
}

// 6. ESQUEMA DE BD para entender la estructura
echo "\n6️⃣  ESQUEMA DE TABLA MODELS:\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
try {
    $columns = DB::select("DESCRIBE models");
    foreach ($columns as $col) {
        echo "  {$col->Field}: {$col->Type}" . ($col->Null === 'NO' ? ' NOT NULL' : '') . "\n";
    }
} catch (\Exception $e) {
    echo "  Error: " . $e->getMessage() . "\n";
}

echo "\n7️⃣  ESQUEMA DE TABLA MODEL_FILES:\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
try {
    $fileColumns = DB::select("DESCRIBE model_files");
    foreach ($fileColumns as $col) {
        echo "  {$col->Field}: {$col->Type}" . ($col->Null === 'NO' ? ' NOT NULL' : '') . "\n";
    }
} catch (\Exception $e) {
    echo "  Error: " . $e->getMessage() . "\n";
}

echo "\n✅ ANÁLISIS COMPLETADO\n\n";
