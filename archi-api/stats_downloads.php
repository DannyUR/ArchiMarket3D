<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Model3D;

// Estadísticas generales
$totalModels = Model3D::count();
$modelsWithDownloads = Model3D::whereHas('files', function($q) {
    $q->where('file_type', 'download');
})->count();

$totalDownloadFiles = \App\Models\ModelFile::where('file_type', 'download')
    ->where('size_bytes', '>', 0)
    ->count();

$totalDownloadSize = \App\Models\ModelFile::where('file_type', 'download')
    ->sum('size_bytes');

echo "\n=== 📊 ESTADÍSTICAS DE DESCARGAS ===\n";
echo "Total modelos en el sistema: {$totalModels}\n";
echo "Modelos con descargas: {$modelsWithDownloads}\n";
echo "Modelos sin descargas: " . ($totalModels - $modelsWithDownloads) . "\n\n";

echo "Total archivos descargables: {$totalDownloadFiles}\n";
echo "Tamaño total: " . round($totalDownloadSize / 1024 / 1024 / 1024, 2) . " GB\n";
echo "Tamaño promedio por archivo: " . round($totalDownloadSize / $totalDownloadFiles / 1024 / 1024, 2) . " MB\n";
