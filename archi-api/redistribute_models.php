<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Model3D;
use App\Models\Category;

echo "\n📊 REDISTRIBUTOR DE MODELOS POR CATEGORÍA\n";
echo str_repeat("=", 70) . "\n\n";

// Obtener modelos sin categoría específica en Arq. Residencial
$models = Model3D::where('category_id', 7)->get();
$totalModelos = count($models);

echo "📌 Tenemos $totalModelos modelos en Arquitectura Residencial\n";
echo "Vamos a distribuirlos entre:\n";
echo "   - 8: Arquitectura Comercial\n";
echo "   - 15: Mobiliario de Oficina\n";
echo "   - 16: Mobiliario Residencial\n";
echo "   - 19: Equipo Pesado\n";
echo "   - 20: Maquinaria Industrial\n";
echo "   - 24: Paisajismo\n\n";

$categorias = [
    8 => 'Arquitectura Comercial',
    15 => 'Mobiliario de Oficina',
    16 => 'Mobiliario Residencial',
    19 => 'Equipo Pesado',
    20 => 'Maquinaria Industrial',
    24 => 'Paisajismo'
];

$modelsPerCategory = ceil($totalModelos / count($categorias));
$contador = 0;
$cambios = 0;

foreach ($categorias as $catId => $catName) {
    $start = $contador;
    $end = min($contador + $modelsPerCategory, $totalModelos);
    $amount = $end - $start;
    
    // Obtener modelos para esta categoría
    $modelsToMove = $models->slice($start, $amount);
    
    foreach ($modelsToMove as $model) {
        $model->update(['category_id' => $catId]);
        $cambios++;
    }
    
    echo "✅ Movidos " . count($modelsToMove) . " modelos a $catName (ID: $catId)\n";
    
    $contador = $end;
}

echo "\n" . str_repeat("=", 70) . "\n";
echo "✅ REDISTRIBUCIÓN COMPLETADA\n";
echo "   Total modelos movidos: $cambios\n\n";

// Mostrar nueva distribución
echo "📊 NUEVA DISTRIBUCIÓN:\n";
foreach ([7, 8, 15, 16, 19, 20, 24] as $id) {
    $cat = Category::find($id);
    $count = Model3D::where('category_id', $id)->count();
    $bar = str_repeat('█', $count);
    printf("   %d: %-35s | %d %s\n", $id, $cat->name, $count, $bar);
}

echo "\n";
?>
