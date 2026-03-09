<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Category;
use App\Models\Model3D;

echo "\n🧹 ELIMINANDO CATEGORÍAS REDUNDANTES\n";
echo str_repeat("=", 100) . "\n\n";

// Las categorías que sobran son de los IDs 95-117 (tercera copia innecesaria)
$redundantIds = range(95, 117);
$mappingBack = array_combine($redundantIds, range(3, 25));

echo "Reasignando modelos de categorías redundantes...\n\n";

$totalReassigned = 0;

foreach ($redundantIds as $redundantId) {
    $targetId = $mappingBack[$redundantId];
    
    // Contar modelos en esta categoría redundante
    $modelCount = Model3D::where('category_id', $redundantId)->count();
    
    if ($modelCount > 0) {
        // Reasignar todos los modelos a la categoría principal
        Model3D::where('category_id', $redundantId)
            ->update(['category_id' => $targetId]);
        
        $totalReassigned += $modelCount;
        printf("✓ CAT %3d (redundante) → CAT %2d (principal): %2d modelos reasignados\n", 
            $redundantId, $targetId, $modelCount);
    } else {
        printf("→ CAT %3d: Sin modelos\n", $redundantId);
    }
}

echo "\n" . str_repeat("=", 100) . "\n";
echo "📊 Eliminando categorías redundantes de la base de datos...\n\n";

// Ahora eliminar las categorías redundantes de la tabla categories
$deletedCount = 0;
foreach ($redundantIds as $id) {
    $category = Category::find($id);
    if ($category) {
        $categoryName = $category->name;
        $category->delete();
        $deletedCount++;
        printf("✗ Eliminada: CAT %3d - %s\n", $id, $categoryName);
    }
}

echo "\n" . str_repeat("=", 100) . "\n";
echo "✅ LIMPIEZA COMPLETADA\n";
echo "   • Modelos reasignados: $totalReassigned\n";
echo "   • Categorías eliminadas: $deletedCount\n";
echo "   • Categorías restantes: " . Category::count() . "\n\n";

// Mostrar la nueva estructura
echo "📊 NUEVA ESTRUCTURA DE CATEGORÍAS\n";
echo str_repeat("-", 100) . "\n";

$categories = Category::orderBy('id')->get();
$grouped = $categories->groupBy('name');

foreach ($grouped as $name => $cats) {
    $ids = $cats->pluck('id')->implode(', ');
    printf("%s\n   IDs: %s\n", $name, $ids);
}

echo "\n" . str_repeat("=", 100) . "\n";
echo "✨ Sistema limpio con solo 2 niveles: Principales (3-25) + Subcategorías (72-94)\n";
echo str_repeat("=", 100) . "\n\n";
?>
