<?php
require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Obtener todas las categorías
$allCategories = \App\Models\Category::all();
$grouped = [];

// Agrupar por nombre
foreach($allCategories as $cat) {
    $key = trim($cat->name);
    if (!isset($grouped[$key])) {
        $grouped[$key] = [];
    }
    $grouped[$key][] = $cat->id;
}

// Eliminar duplicados, mantener solo el primero
$deleted = 0;
foreach($grouped as $name => $ids) {
    if (count($ids) > 1) {
        // Mantener el primer ID, eliminar los demás
        $idsToDelete = array_slice($ids, 1);
        foreach($idsToDelete as $id) {
            \App\Models\Category::destroy($id);
            $deleted++;
        }
    }
}

echo "✅ Duplicados eliminados: $deleted\n\n";

// Verificar resultado final
$categories = \App\Models\Category::all();
echo "✅ Total categorías finales: " . count($categories) . "\n\n";

$groups = [
    'Estructurales' => [],
    'Arquitectura' => [],
    'Instalaciones' => [],
    'Mobiliario' => [],
    'Maquinaria' => [],
    'Urbanismo' => []
];

foreach($categories as $c) {
    $name = strtolower($c->name);
    if (str_contains($name, 'estructura') || str_contains($name, 'acero') || str_contains($name, 'concreto') || str_contains($name, 'cimentación')) {
        $groups['Estructurales'][] = $c->name;
    } elseif (str_contains($name, 'arquitectura') || str_contains($name, 'residencial') || str_contains($name, 'comercial') || str_contains($name, 'fachada') || str_contains($name, 'cubierta')) {
        $groups['Arquitectura'][] = $c->name;
    } elseif (str_contains($name, 'instalación') || str_contains($name, 'eléctrico') || str_contains($name, 'fontanería') || str_contains($name, 'hvac') || str_contains($name, 'incendio')) {
        $groups['Instalaciones'][] = $c->name;
    } elseif (str_contains($name, 'mobiliario') || str_contains($name, 'equipamiento')) {
        $groups['Mobiliario'][] = $c->name;
    } elseif (str_contains($name, 'maquinaria') || str_contains($name, 'equipo') || str_contains($name, 'industria')) {
        $groups['Maquinaria'][] = $c->name;
    } elseif (str_contains($name, 'urbanismo') || str_contains($name, 'infraestructura') || str_contains($name, 'vial') || str_contains($name, 'espacio') || str_contains($name, 'paisaje') || str_contains($name, 'red')) {
        $groups['Urbanismo'][] = $c->name;
    }
}

foreach($groups as $group => $items) {
    if (!empty($items)) {
        echo "⭐ $group (" . count($items) . ")\n";
        foreach($items as $item) {
            echo "  - $item\n";
        }
        echo "\n";
    }
}
?>
