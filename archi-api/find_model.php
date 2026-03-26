<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Buscar el modelo que vemos en la imagen: "Modelo Realidad Aumentada"
$model = \Illuminate\Support\Facades\DB::table('models')
    ->where('name', 'like', '%Realidad%')
    ->orWhere('name', 'like', '%Aumentada%')
    ->first();

if ($model) {
    echo "=== ENCONTRADO: {$model->name} ===\n";
    echo "ID: {$model->id}\n";
    echo "sketchfab_id: {$model->sketchfab_id}\n";
    echo "preview_url: {$model->preview_url}\n";
    echo "embed_url: {$model->embed_url}\n";
    echo "metadata: {$model->metadata}\n";
} else {
    echo "No encontrado modelo con 'Realidad' o 'Aumentada'\n";
    echo "\n=== PRIMEROS 3 NOMBRES ===\n";
    $models = \Illuminate\Support\Facades\DB::table('models')
        ->select('id', 'name')
        ->limit(3)
        ->get();
    foreach ($models as $m) {
        echo "{$m->id}: {$m->name}\n";
    }
}
