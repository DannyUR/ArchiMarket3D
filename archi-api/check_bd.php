<?php
// Cargar Laravel
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';

// Ejecutar comandos artisan necesarios
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Ahora sí, podemos usar DB
use Illuminate\Support\Facades\DB;

$models = DB::table('models')->select('id', 'name', 'sketchfab_id', 'embed_url')->limit(5)->get();

echo "\n=== PRIMEROS 5 MODELOS ===\n";
foreach ($models as $model) {
    echo "ID: {$model->id} | {$model->name}\n";
    echo "  sketchfab_id: " . ($model->sketchfab_id ?? 'NULL') . "\n";
    echo "  embed_url: " . ($model->embed_url ?? 'NULL') . "\n\n";
}

$withEmbed = DB::table('models')->whereNotNull('embed_url')->count();
$all = DB::table('models')->count();

echo "=== ESTADÍSTICAS ===\n";
echo "CON embed_url: $withEmbed\n";
echo "TOTAL: $all\n";
