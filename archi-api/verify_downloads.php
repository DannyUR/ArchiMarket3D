<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Model3D;
use App\Models\ModelFile;

echo "=== ESTADO ACTUAL DE DESCARGAS ===\n\n";

// Estadísticas generales
$totalModels = Model3D::count();
$modelsWithDownloads = Model3D::whereHas('files', function($q) {
    $q->where('file_type', 'download');
})->count();

$totalFiles = ModelFile::where('file_type', 'download')->count();
$byFormat = ModelFile::where('file_type', 'download')
    ->groupBy('format')
    ->selectRaw('format, COUNT(*) as count')
    ->get();

echo "Total modelos en BD: {$totalModels}\n";
echo "Modelos CON descargas: {$modelsWithDownloads}\n";
echo "Modelos SIN descargas: " . ($totalModels - $modelsWithDownloads) . "\n";
echo "Total archivos descargables: {$totalFiles}\n\n";

echo "Distribución por formato:\n";
foreach ($byFormat as $f) {
    echo "  {$f->format}: {$f->count}\n";
}

echo "\n=== PRIMEROS 10 MODELOS - ESTADO ===\n";
$models = Model3D::with(['files' => function($q) {
    $q->where('file_type', 'download');
}])->limit(10)->get();

foreach ($models as $m) {
    $hasDownload = $m->files->count() > 0;
    $status = $hasDownload ? "✅" : "❌";
    $formato = $hasDownload ? $m->files->first()->format : "-";
    echo "$status Model {$m->id}: {$m->name} (Formato: {$formato})\n";
}

echo "\n=== MODELOS QUE SÍ TIENEN DESCARGA ===\n";
$withDownloads = Model3D::whereHas('files', function($q) {
    $q->where('file_type', 'download');
})->orderBy('id')->limit(20)->get();

foreach ($withDownloads as $m) {
    $formats = $m->files()->where('file_type', 'download')->pluck('format')->implode(', ');
    echo "  ID {$m->id}: {$m->name} ({$formats})\n";
}
?>
