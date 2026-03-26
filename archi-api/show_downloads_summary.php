<?php

use App\Models\Model3D;
use App\Models\ModelFile;

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$totalDownloads = ModelFile::where('file_type', 'download')->count();
$modelsWithDownloads = Model3D::whereHas('files', function($q) {
    $q->where('file_type', 'download');
})->count();

$totalSize = ModelFile::where('file_type', 'download')->sum('size_bytes');
$totalSizeGB = $totalSize / (1024 * 1024 * 1024);

$largest = ModelFile::where('file_type', 'download')
    ->with('model')
    ->orderBy('size_bytes', 'desc')
    ->first();

echo "=== RESUMEN DE DESCARGAS ===\n";
echo "Archivos registrados: {$totalDownloads}\n";
echo "Modelos con descargas: {$modelsWithDownloads}\n";
echo "Espacio total: " . number_format($totalSizeGB, 2) . " GB\n";

if ($largest) {
    $sizeMB = $largest->size_bytes / (1024 * 1024);
    echo "\nArchivo más grande:\n";
    echo "  {$largest->model->name}\n";
    echo "  Tamaño: " . number_format($sizeMB, 2) . " MB\n";
}

// Listar algunos modelos disponibles
echo "\n=== PRIMEROS 10 MODELOS CON DESCARGAS ===\n";
$samples = Model3D::whereHas('files', function($q) {
    $q->where('file_type', 'download');
})
->with('files')
->limit(10)
->get();

foreach ($samples as $i => $model) {
    $downloadCount = $model->files()->where('file_type', 'download')->count();
    echo ($i+1) . ". {$model->name} - {$downloadCount} archivo(s)\n";
}

echo "\n✅ Todos los modelos están listos para descargar en el navegador\n";
echo "📥 Abre el navegador y navega a: http://localhost:3000/modelos\n";
echo "🔍 Busca los modelos que aparecen arriba\n";
?>
