<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Category;

echo "\n📝 RENOMBRANDO SUBCATEGORÍAS PARA DIFERENCIARLAS\n";
echo str_repeat("=", 100) . "\n\n";

// Mapeo de subcategorías con nombres diferenciados
$renames = [
    72 => 'Estructuras de Acero - Especializado',
    73 => 'Estructuras de Concreto - Especializado',
    74 => 'Cimentaciones - Especializado',
    75 => 'Elementos Portantes - Especializado',
    76 => 'Arquitectura Residencial - Especializado',
    77 => 'Arquitectura Comercial - Especializado',
    78 => 'Fachadas y Cerramientos - Especializado',
    79 => 'Cubiertas y Azoteas - Especializado',
    80 => 'Sistemas Eléctricos - Especializado',
    81 => 'Fontanería y Tuberías - Especializado',
    82 => 'HVAC (Climatización) - Especializado',
    83 => 'Protección Contra Incendios - Especializado',
    84 => 'Mobiliario de Oficina - Especializado',
    85 => 'Mobiliario Residencial - Especializado',
    86 => 'Mobiliario Urbano - Especializado',
    87 => 'Equipamiento - Especializado',
    88 => 'Equipo Pesado - Especializado',
    89 => 'Maquinaria Industrial - Especializado',
    90 => 'Equipo de Construcción - Especializado',
    91 => 'Infraestructura Vial - Especializado',
    92 => 'Espacios Públicos - Especializado',
    93 => 'Paisajismo - Especializado',
    94 => 'Redes de Servicio - Especializado',
];

$renamed = 0;
echo "Renombrando 23 subcategorías:\n\n";

foreach ($renames as $id => $newName) {
    $category = Category::find($id);
    if ($category) {
        $oldName = $category->name;
        $category->name = $newName;
        $category->save();
        $renamed++;
        printf("✓ CAT %2d: '%s' → '%s'\n", $id, $oldName, $newName);
    }
}

echo "\n" . str_repeat("=", 100) . "\n";
echo "✅ RENOMBRADO COMPLETADO\n";
echo "   • Subcategorías renombradas: $renamed\n\n";

// Mostrar la nueva estructura
echo "📊 NUEVA ESTRUCTURA (SIN DUPLICADOS EN NOMBRES)\n";
echo str_repeat("-", 100) . "\n";

$categories = Category::orderBy('id')->get();
$grouped = $categories->groupBy(function($cat) {
    return preg_replace('/ - Especializado$/', '', $cat->name);
});

foreach ($grouped as $baseName => $cats) {
    if ($cats->count() === 2) {
        $main = $cats->where('id', '<', 72)->first();
        $sub = $cats->where('id', '>=', 72)->first();
        printf("%-45s\n", $baseName);
        printf("   ├─ CAT %2d: %s\n", $main->id, $main->name);
        printf("   └─ CAT %2d: %s\n\n", $sub->id, $sub->name);
    }
}

echo str_repeat("=", 100) . "\n";
echo "✨ ¡Ahora cada categoría tiene un nombre único y diferenciado!\n";
echo str_repeat("=", 100) . "\n\n";
?>
