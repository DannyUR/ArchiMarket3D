<?php

// Cargar el autoloader de Composer
require __DIR__ . '/vendor/autoload.php';

// Crear la aplicación
$app = require_once __DIR__ . '/bootstrap/app.php';

// Bootstrap the application
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Model3D;

echo "\n=== DIAGNÓSTICO DE CHECKOUT ===\n";
echo "\n1. Verificando modelos en la base de datos...\n";

$models = Model3D::select('id', 'name')->get();
if ($models->isEmpty()) {
    echo "❌ No hay modelos en la base de datos\n";
} else {
    echo "✅ Encontrados " . $models->count() . " modelos:\n";
    foreach ($models->take(5) as $model) {
        echo "   - ID: {$model->id}, Name: {$model->name}\n";
    }
    if ($models->count() > 5) {
        echo "   ... y " . ($models->count() - 5) . " más\n";
    }
}

echo "\n2. Verificando estructura de la tabla shopping...\n";
$shopTable = \Illuminate\Support\Facades\Schema::getColumns('shopping');
echo "✅ Columnas en tabla 'shopping':\n";
foreach ($shopTable as $column) {
    echo "   - {$column->getName()}\n";
}

echo "\n=== FIN DEL DIAGNÓSTICO ===\n";
