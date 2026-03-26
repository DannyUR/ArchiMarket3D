<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/bootstrap/app.php';

use App\Models\Model3D;

$models = Model3D::select('id', 'name', 'embed_url', 'sketchfab_url', 'metadata')->limit(3)->get();

foreach ($models as $model) {
    echo "=== Modelo: {$model->name} (ID: {$model->id}) ===\n";
    echo "embed_url: " . ($model->embed_url ?? 'NULL') . "\n";
    echo "sketchfab_url: " . ($model->sketchfab_url ?? 'NULL') . "\n";
    echo "metadata: " . json_encode($model->metadata) . "\n";
    echo "\n";
}
