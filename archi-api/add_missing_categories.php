<?php
require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Categorías que debemos tener
$categoriesNeeded = [
    // Estructurales
    'Estructuras de Acero' => 'Estructuras metálicas, vigas, columnas y elementos portantes',
    'Estructuras de Concreto' => 'Losas, vigas y pilares de hormigón armado',
    'Cimentaciones' => 'Zapatas, pilotes y sistemas de cimentación',
    'Elementos Portantes' => 'Muros de carga, arcos y otros elementos estructurales',
    
    // Arquitectura
    'Arquitectura Residencial' => 'Casas, departamentos, oficinas y conjuntos habitacionales',
    'Arquitectura Comercial' => 'Edificios comerciales, centros comerciales y oficinas',
    'Fachadas y Cerramientos' => 'Sistemas de fachadas, muros cortina y cerramientos',
    'Cubiertas y Azoteas' => 'Sistemas de cobertura y azoteas',
    
    // Instalaciones MEP
    'Sistemas Eléctricos' => 'Instalaciones eléctricas, cableado y sistemas de distribución',
    'Fontanería y Tuberías' => 'Sistemas de agua, desagüe y tuberías',
    'HVAC (Climatización)' => 'Sistemas de calefacción, ventilación y aire acondicionado',
    'Protección Contra Incendios' => 'Sistemas de riego, detección y protección contra incendios',
    
    // Mobiliario
    'Mobiliario de Oficina' => 'Escritorios, sillas, armarios y equipamiento de oficina',
    'Mobiliario Residencial' => 'Sofás, camas, mesas y muebles para el hogar',
    'Mobiliario Urbano' => 'Bancos, luminarias, papeleras y equipamiento urbano',
    'Equipamiento' => 'Máquinas expendedoras, señalética y equipos varios',
    
    // Maquinaria
    'Equipo Pesado' => 'Grúas, excavadoras, montacargas y equipamiento pesado',
    'Maquinaria Industrial' => 'Maquinaria para procesos industriales y manufactura',
    'Equipo de Construcción' => 'Andamios, hormigoneras y equipos de construcción',
    
    // Urbanismo
    'Infraestructura Vial' => 'Calles, carreteras, puentes y estructuras de transporte',
    'Espacios Públicos' => 'Parques, plazas y espacios comunitarios',
    'Paisajismo' => 'Elementos paisajísticos, vegetación y ornamentación',
    'Redes de Servicio' => 'Tuberías subterráneas, ductos y redes de servicios'
];

// Obtener las categorías existentes
$existing = \App\Models\Category::pluck('name')->toArray();
$added = 0;

foreach($categoriesNeeded as $name => $description) {
    if (!in_array($name, $existing)) {
        \App\Models\Category::create([
            'name' => $name,
            'description' => $description
        ]);
        $added++;
        echo "✅ Agregada: $name\n";
    }
}

echo "\n✅ Total categorías agregadas: $added\n";

// Mostrar resumen final
$categories = \App\Models\Category::all();
echo "✅ Total categorías en BD: " . count($categories) . "\n\n";

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
    if (str_contains($name, 'estructura') || str_contains($name, 'acero') || str_contains($name, 'concreto') || str_contains($name, 'cimentación') || str_contains($name, 'portante')) {
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
        sort($items);
        echo "⭐ $group (" . count($items) . ")\n";
        foreach($items as $item) {
            echo "  ✓ $item\n";
        }
        echo "\n";
    }
}
?>
