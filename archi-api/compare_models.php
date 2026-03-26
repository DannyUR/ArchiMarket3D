<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Model3D;

echo "\n=== 📊 COMPARACIÓN: MODELO CON DESCARGAS vs SIN DESCARGAS ===\n\n";

// Buscar un modelo EN RANGO 1-75 que TENGA archivos descargables
echo "🔍 Buscando un modelo con ID 1-75 que TENGA descargas...\n";
$modelWithDownloads = Model3D::whereHas('files', function($q) {
    $q->where('file_type', 'download');
})
->whereBetween('id', [1, 75])
->first();

if ($modelWithDownloads) {
    echo "\n✅ MODELO CON DESCARGAS (ID: {$modelWithDownloads->id}):\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "  Nombre: {$modelWithDownloads->name}\n";
    echo "  ID: {$modelWithDownloads->id}\n";
    
    $files = $modelWithDownloads->files()->where('file_type', 'download')->get();
    echo "  Total archivos descargables: " . count($files) . "\n";
    
    foreach ($files as $f) {
        echo "    ✓ {$f->format} - " . round($f->size_bytes / 1024 / 1024, 2) . " MB\n";
    }
} else {
    echo "  ❌ No hay modelos con descargas en rango 1-75\n";
}

// Buscar un modelo EN RANGO 1-75 que NO TENGA archivos descargables
echo "\n🔍 Buscando un modelo con ID 1-75 que NO TENGA descargas...\n";
$modelWithoutDownloads = Model3D::whereDoesntHave('files', function($q) {
    $q->where('file_type', 'download');
})
->whereBetween('id', [1, 75])
->first();

if ($modelWithoutDownloads) {
    echo "\n❌ MODELO SIN DESCARGAS (ID: {$modelWithoutDownloads->id}):\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "  Nombre: {$modelWithoutDownloads->name}\n";
    echo "  ID: {$modelWithoutDownloads->id}\n";
    echo "  Embed URL: {$modelWithoutDownloads->embed_url}\n";
    
    $files = $modelWithoutDownloads->files()->get();
    echo "  Total archivos (todos tipos): " . count($files) . "\n";
    foreach ($files as $f) {
        echo "    - {$f->file_type}: {$f->format}\n";
    }
} else {
    echo "  ✅ Todos los modelos 1-75 tienen descargas\n";
}

// Estadísticas generales
echo "\n📊 ESTADÍSTICAS GENERALES:\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

$total = Model3D::count();
$inRange = Model3D::whereBetween('id', [1, 75])->count();
$withDownloads = Model3D::whereHas('files', function($q) {
    $q->where('file_type', 'download');
})->count();
$withDownloadsInRange = Model3D::whereHas('files', function($q) {
    $q->where('file_type', 'download');
})->whereBetween('id', [1, 75])->count();

echo "  Total modelos en BD: {$total}\n";
echo "  Modelos en rango 1-75: {$inRange}\n";
echo "  Modelos con archivos descargables: {$withDownloads}\n";
echo "  Modelos 1-75 CON descargas: {$withDownloadsInRange}\n";
echo "  Modelos 1-75 SIN descargas: " . ($inRange - $withDownloadsInRange) . "\n";

// Mostrar el endpoint de testeo
echo "\n🔗 ENDPOINTS API PARA TESTEAR:\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "  GET /api/models/213/download-info (Quinual - SIN descargas)\n";
if ($modelWithDownloads) {
    echo "  GET /api/models/{$modelWithDownloads->id}/download-info (CON descargas)\n";
}
if ($modelWithoutDownloads) {
    echo "  GET /api/models/{$modelWithoutDownloads->id}/download-info (SIN descargas)\n";
}

echo "\n✅ ANÁLISIS COMPLETADO\n\n";
