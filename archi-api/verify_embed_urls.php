<?php
// Script para verificar el estado de embed_url en la BD
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';

use App\Models\Model3D;
use Illuminate\Support\Facades\DB;

// Verificar si la tabla tiene datos
$models = \DB::table('models')
    ->select('id', 'name', 'sketchfab_id', 'embed_url')
    ->limit(5)
    ->get();

echo "\n=== PRIMEROS 5 MODELOS ===\n";
foreach ($models as $model) {
    echo "ID: {$model->id} | Nombre: {$model->name}\n";
    echo "  sketchfab_id: " . ($model->sketchfab_id ?? 'NULL') . "\n";
    echo "  embed_url: " . ($model->embed_url ?? 'NULL') . "\n";
    echo "\n";
}

// Contar cuántos tienen embed_url
$withEmbed = \DB::table('models')->whereNotNull('embed_url')->count();
$withoutEmbed = \DB::table('models')->whereNull('embed_url')->count();

echo "=== ESTADÍSTICAS ===\n";
echo "Modelos CON embed_url: $withEmbed\n";
echo "Modelos SIN embed_url: $withoutEmbed\n";
echo "Total: " . ($withEmbed + $withoutEmbed) . "\n";
