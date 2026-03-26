<?php

use App\Models\ModelFile;
use App\Models\Model3D;

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$files = ModelFile::where('file_type', 'download')
    ->with('model')
    ->orderBy('model_id')
    ->limit(50)
    ->get();

echo "=== ARCHIVOS DESCARGABLES DISPONIBLES ===\n";
echo "Total: " . ModelFile::where('file_type', 'download')->count() . "\n\n";

foreach ($files as $f) {
    $sizeMB = $f->size_bytes / (1024 * 1024);
    echo "Model {$f->model_id}: {$f->model->name}\n";
    echo "  Formato: {$f->format}\n";
    echo "  Tamaño: " . number_format($sizeMB, 2) . " MB\n";
    echo "  URL: {$f->file_url}\n";
    echo "  Archivo existe: " . (file_exists(public_path($f->file_url)) ? '✅' : '❌') . "\n\n";
}

echo "\n=== MODELOS SIN DESCARGAS ===\n";
$withoutDownloads = Model3D::whereDoesntHave('files', function($q) {
    $q->where('file_type', 'download');
})->limit(10)->pluck('name', 'id');

foreach ($withoutDownloads as $id => $name) {
    echo "  ID $id: $name\n";
}
?>
