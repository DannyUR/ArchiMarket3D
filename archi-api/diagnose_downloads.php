<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Model3D;
use App\Models\ModelFile;
use Illuminate\Support\Facades\DB;

// Buscar modelos sin archivos de descarga
$modelsWithoutDownloads = Model3D::doesntHave('files')
    ->orWhereDoesntHave('files', function($q) {
        $q->where('file_type', 'download');
    })
    ->limit(20)
    ->get(['id', 'name']);

echo "\n=== Modelos SIN descargas disponibles ===\n";
echo "Total: " . count($modelsWithoutDownloads) . "\n\n";

foreach ($modelsWithoutDownloads as $model) {
    $hasAnyFiles = $model->files()->exists();
    $fileCount = $model->files()->count();
    $downloadCount = $model->files()->where('file_type', 'download')->count();
    
    echo "{$model->id}: {$model->name}\n";
    echo "  - Total archivos: {$fileCount}\n";
    echo "  - Descargas: {$downloadCount}\n\n";
}

// Nombres de modelos conocidos de la imagen
$modelNames = ['Quinzal', 'Sauce', 'Tara', 'Modelo Realidade Aumentada', 'Arabe', '600pm Cabin'];

echo "\n=== Buscando modelos por nombre ===\n";
foreach ($modelNames as $name) {
    $model = Model3D::where('name', 'like', "%{$name}%")->first();
    if ($model) {
        $downloads = $model->files()
            ->where('file_type', 'download')
            ->count();
        echo "{$model->id}: {$model->name} - {$downloads} descargas\n";
    }
}

// Estadísticas generales
$totalModels = Model3D::count();
$modelsWithDownloads = Model3D::whereHas('files', function($q) {
    $q->where('file_type', 'download');
})->count();

echo "\n=== Estadísticas ===\n";
echo "Total modelos: {$totalModels}\n";
echo "Modelos con descargas: {$modelsWithDownloads}\n";
echo "Modelos sin descargas: " . ($totalModels - $modelsWithDownloads) . "\n";
