<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Model3D;
use App\Models\ModelFile;

echo "\n=== 🔍 BÚSQUEDA DEL MODELO QUINUAL ===\n";

// Buscar por nombre exacto
$model = Model3D::where('name', 'like', '%Quinual%')
    ->orWhere('name', 'like', '%QUINUAL%')
    ->first();

if (!$model) {
    echo "❌ No se encontró modelo con nombre 'Quinual'\n";
    echo "\nBuscando todos los modelos que contengan 'Quin':\n";
    $models = Model3D::where('name', 'like', '%Quin%')->get();
    foreach ($models as $m) {
        echo "  - ID: {$m->id}, Nombre: {$m->name}\n";
    }
    echo "\nTotal de modelos en BD: " . Model3D::count() . "\n";
    exit(1);
}

echo "\n✅ MODELO ENCONTRADO\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

echo "\n📋 INFORMACIÓN DEL MODELO:\n";
echo "  ID: {$model->id}\n";
echo "  Nombre: {$model->name}\n";
echo "  Descripción: {$model->description}\n";
echo "  Estado en BD: {$model->status}\n";
echo "  Sketchfab ID: {$model->sketchfab_id}\n";
echo "  Categoría ID: {$model->category_id}\n";
echo "  Rango de descarga: " . ($model->id >= 1 && $model->id <= 75 ? "✅ SÍ (1-75)" : "❌ NO") . "\n";

echo "\n🔗 INFORMACIÓN SKETCHFAB:\n";
echo "  embed_url: {$model->embed_url}\n";

echo "\n📦 INFORMACIÓN DE ARCHIVOS:\n";
$files = $model->files()->get();
echo "  Total de archivos registrados BD: " . count($files) . "\n";

if ($files->count() > 0) {
    foreach ($files as $file) {
        echo "\n  Archivo:\n";
        echo "    - ID: {$file->id}\n";
        echo "    - Tipo: {$file->file_type}\n";
        echo "    - Origen: {$file->origin}\n";
        echo "    - Formato: {$file->format}\n";
        echo "    - Tamaño (bytes): {$file->size_bytes}\n";
        echo "    - Tamaño (MB): " . ($file->size_bytes ? round($file->size_bytes / 1024 / 1024, 2) : '0') . " MB\n";
        echo "    - URL archivo: {$file->file_url}\n";
        echo "    - Nombre original: {$file->original_name}\n";
    }
} else {
    echo "  ⚠️ No hay archivos registrados en la BD\n";
}

// Verificar archivos en el sistema de archivos
echo "\n💾 VERIFICACIÓN DE ARCHIVOS EN SISTEMA:\n";
$modelPath = storage_path("app/public/models/{$model->id}");
if (is_dir($modelPath)) {
    $glbFiles = glob("{$modelPath}/*.glb");
    $objFiles = glob("{$modelPath}/*.obj");
    $fbxFiles = glob("{$modelPath}/*.fbx");
    
    echo "  Carpeta modelo: {$modelPath} ✅\n";
    echo "  Archivos GLB: " . count($glbFiles) . "\n";
    foreach ($glbFiles as $file) {
        $size = filesize($file);
        echo "    - " . basename($file) . " (" . round($size / 1024 / 1024, 2) . " MB)\n";
    }
    if (count($objFiles) > 0) {
        echo "  Archivos OBJ: " . count($objFiles) . "\n";
        foreach ($objFiles as $file) {
            $size = filesize($file);
            echo "    - " . basename($file) . " (" . round($size / 1024 / 1024, 2) . " MB)\n";
        }
    }
    if (count($fbxFiles) > 0) {
        echo "  Archivos FBX: " . count($fbxFiles) . "\n";
        foreach ($fbxFiles as $file) {
            $size = filesize($file);
            echo "    - " . basename($file) . " (" . round($size / 1024 / 1024, 2) . " MB)\n";
        }
    }
} else {
    echo "  ❌ Carpeta de modelo NO existe: {$modelPath}\n";
}

echo "\n📊 METADATA:\n";
$metadata = $model->metadata;
if ($metadata) {
    echo json_encode($metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
} else {
    echo "  Sin metadatos\n";
}

echo "\n📅 TIMESTAMPS:\n";
echo "  Creado: {$model->created_at}\n";
echo "  Actualizado: {$model->updated_at}\n";

echo "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "\n✅ BÚSQUEDA COMPLETADA\n\n";
