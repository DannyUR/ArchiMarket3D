<?php
require_once __DIR__ . '/bootstrap/app.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Model3D;
use App\Models\ModelFile;

$downloadFiles = ModelFile::where('file_type', 'download')->count();
$modelsWithDownloads = Model3D::whereHas('files', function($q) {
    $q->where('file_type', 'download');
})->count();

echo "📥 Archivos descargados: {$downloadFiles}\n";
echo "📦 Modelos con descargas: {$modelsWithDownloads}\n";

$totalSize = ModelFile::where('file_type', 'download')->sum('size_bytes');
$sizeInMB = number_format($totalSize / (1024 * 1024), 2);
echo "💾 Espacio total: {$sizeInMB} MB\n";
