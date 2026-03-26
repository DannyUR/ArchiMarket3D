<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Model3D;

// Verificar formatos disponibles
$model = Model3D::find(3);
if ($model && $model->metadata) {
    $urls = $model->metadata['download_urls'] ?? [];
    echo "Modelo 3 - Formatos disponibles: " . implode(', ', array_keys($urls)) . "\n";
    
    // Mostrar URL de uno de ellos
    foreach ($urls as $format => $url) {
        echo "  $format: " . (is_array($url) ? $url['url'] ?? 'NO' : (is_string($url) ? 'SÍ' : 'ARRAY')) . "\n";
    }
}

// Estadísticas de formatos en metadata
echo "\n=== FORMATOS EN METADATA (Primeros 20 modelos) ===\n";
$models = Model3D::whereNotNull('metadata')->limit(20)->get();
$formats = [];
foreach ($models as $m) {
    $urls = $m->metadata['download_urls'] ?? [];
    foreach (array_keys($urls) as $f) {
        $formats[$f] = ($formats[$f] ?? 0) + 1;
    }
}

foreach ($formats as $format => $count) {
    echo "$format: $count modelos\n";
}
?>