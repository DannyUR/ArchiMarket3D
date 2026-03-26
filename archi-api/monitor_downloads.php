<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Model3D;
use App\Models\ModelFile;

while(true) {
    // Estadísticas generales
    $totalModels = Model3D::count();
    $modelsWithDownloads = Model3D::whereHas('files', function($q) {
        $q->where('file_type', 'download');
    })->count();

    $totalDownloadSize = ModelFile::where('file_type', 'download')
        ->sum('size_bytes');

    $totalSizeGB = round($totalDownloadSize / 1024 / 1024 / 1024, 2);
    $percentage = round(($modelsWithDownloads / $totalModels) * 100, 1);

    echo "\033[2J\033[H"; // Limpiar pantalla
    echo "\n=== 📊 MONITOREO DE DESCARGAS (Live) ===\n";
    echo "Timestamp: " . date('Y-m-d H:i:s') . "\n\n";
    
    echo "📦 Modelos:\n";
    echo "  Total: {$totalModels}\n";
    echo "  Con descargas: {$modelsWithDownloads} ({$percentage}%)\n";
    echo "  Sin descargas: " . ($totalModels - $modelsWithDownloads) . "\n\n";
    
    echo "💾 Almacenamiento:\n";
    echo "  Total: {$totalSizeGB} GB\n";
    echo "  Promedio: " . round($totalDownloadSize / $modelsWithDownloads / 1024 / 1024, 2) . " MB/archivo\n\n";

    // Últimos 5 modelos descargados
    $recent = ModelFile::where('file_type', 'download')
        ->where('size_bytes', '>', 0)
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get(['model_id', 'format', 'size_bytes', 'created_at']);

    echo "📥 Últimas descargas:\n";
    foreach ($recent as $file) {
        $mb = round($file->size_bytes / 1024 / 1024, 2);
        echo "  ID {$file->model_id}: {$file->format} ({$mb} MB)\n";
    }

    echo "\n⏳ Refrescando en 10 segundos...\n";
    sleep(10);
}
