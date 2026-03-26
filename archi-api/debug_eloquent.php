<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Usar el modelo Eloquent
$model = \App\Models\Model3D::find(1659);

echo "=== MODELO 1659 USANDO ELOQUENT ===\n";
echo "embed_url: " . ($model->embed_url ?? 'NULL') . "\n";
echo "metadata" . (is_array($model->metadata) ? ' (ARRAY)' : ' (STRING)') . "\n";

if (is_array($model->metadata)) {
    echo "Has embed_url: " . (isset($model->metadata['embed_url']) ? 'YES' : 'NO') . "\n";
    if (isset($model->metadata['embed_url'])) {
        echo "embed_url: {$model->metadata['embed_url']}\n";
    }
} else {
    echo "metadata value: " . substr($model->metadata, 0, 100) . "...\n";
}

echo "\n=== OTRO: Buscar modelos CON metadata embed_url ===\n";
$models = \App\Models\Model3D::all();
$count = 0;
foreach ($models as $m) {
    if (is_array($m->metadata) && isset($m->metadata['embed_url']) && !$m->embed_url) {
        $count++;
        echo "$count. {$m->id}: {$m->name}\n";
        if ($count >= 3) break;
    }
}
echo "Total encontrados: $count\n";
