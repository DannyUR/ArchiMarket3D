<?php
require __DIR__ . '/vendor/autoload.php';

use App\Models\Model3D;

// Buscar Quinual
$model = Model3D::where('name', 'Quinual')->first();

if ($model) {
    echo "=== MODELO QUINUAL (ID: {$model->id}) ===\n";
    echo "Sketchfab ID: " . ($model->sketchfab_id ? $model->sketchfab_id : "NULL") . "\n";
    echo "Embed URL: " . ($model->embed_url ? "✅ " . substr($model->embed_url, 0, 60) . "..." : "❌ NULL") . "\n";
    echo "Archivos descargados: " . $model->files()->where('file_type', 'download')->count() . "\n";
} else {
    echo "❌ Modelo Quinual no encontrado\n";
}
?>
