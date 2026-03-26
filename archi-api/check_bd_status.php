<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Model3D;
use App\Models\Category;

echo "\n=== 📊 ESTADO ACTUAL DE BD ===\n";

// Categorías disponibles
$categories = Category::all();
echo "\n📁 Categorías en BD: " . count($categories) . "\n";
foreach ($categories as $cat) {
    echo "  - ID {$cat->id}: {$cat->name}\n";
}

// Modelos existentes
$totalModels = Model3D::count();
echo "\n📦 Total modelos: {$totalModels}\n";

// Modelos por categoría
$modelsByCategory = Model3D::selectRaw('category_id, COUNT(*) as count')
    ->groupBy('category_id')
    ->with('category')
    ->get();

if ($modelsByCategory->count() > 0) {
    echo "\nModelos por categoría:\n";
    foreach ($modelsByCategory as $group) {
        $catName = $group->category?->name ?? 'Sin categoría';
        echo "  - {$catName}: {$group->count}\n";
    }
}

// Modelos con Sketchfab ID
$withSketchfabId = Model3D::whereNotNull('sketchfab_id')->count();
$withoutSketchfabId = $totalModels - $withSketchfabId;

echo "\n🔗 Sketchfab Integration:\n";
echo "  - Con Sketchfab ID: {$withSketchfabId}\n";
echo "  - Sin Sketchfab ID: {$withoutSketchfabId}\n";

// Modelos con archivos descargables
$withDownloads = Model3D::whereHas('files', function($q) {
    $q->where('file_type', 'download');
})->count();

echo "\n📥 Descargas:\n";
echo "  - Con archivos descargables: {$withDownloads}\n";
