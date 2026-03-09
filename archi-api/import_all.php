<?php

echo "╔════════════════════════════════════════════╗\n";
echo "║    IMPORTADOR MASIVO DE CATEGORÍAS         ║\n";
echo "╚════════════════════════════════════════════╝\n\n";

// Definir todas las búsquedas por categoría
$busquedas = [
    // ============================================
    // ESTRUCTURALES
    // ============================================
    'Estructuras de Acero' => [
        'steel structure',
        'steel beam',
        'steel column',
        'steel frame',
        'steel truss',
    ],
    
    'Estructuras de Concreto' => [
        'concrete structure',
        'reinforced concrete',
        'concrete beam',
        'concrete column',
    ],
    
    'Cimentaciones' => [
        'concrete foundation',
        'foundation',
        'pile foundation',
    ],

    // ============================================
    // INSTALACIONES (MEP)
    // ============================================
    'Fontanería y Tuberías' => [
        'plumbing pipes',
        'pipe fittings',
        'valve',
        'water pipe',
    ],
    
    'Sistemas Eléctricos' => [
        'electrical panel',
        'circuit breaker',
        'wiring',
        'transformer',
    ],
    
    'HVAC (Climatización)' => [
        'hvac duct',
        'air conditioning',
        'ventilation',
        'chiller',
    ],
    
    'Protección Contra Incendios' => [
        'sprinkler',
        'fire extinguisher',
        'fire alarm',
    ],

    // ============================================
    // ARQUITECTURA
    // ============================================
    'Arquitectura Residencial' => [
        'modern house',
        'villa',
        'tiny house',
        'home design',
    ],
    
    'Arquitectura Comercial' => [
        'commercial building',
        'office building',
        'shopping center',
    ],
    
    'Fachadas y Cerramientos' => [
        'building facade',
        'curtain wall',
        'cladding',
    ],
    
    'Cubiertas y Azoteas' => [
        'roof design',
        'flat roof',
        'roof truss',
    ],

    // ============================================
    // MOBILIARIO
    // ============================================
    'Mobiliario de Oficina' => [
        'office chair',
        'office desk',
        'conference table',
        'filing cabinet',
    ],
    
    'Mobiliario Residencial' => [
        'sofa',
        'dining table',
        'bed',
        'wardrobe',
    ],
    
    'Mobiliario Urbano' => [
        'street furniture',
        'park bench',
        'bus stop',
        'public seating',
    ],

    // ============================================
    // MAQUINARIA
    // ============================================
    'Equipo de Construcción' => [
        'excavator',
        'bulldozer',
        'backhoe',
        'loader',
    ],
    
    'Equipo Pesado' => [
        'crane',
        'dump truck',
        'forklift',
        'industrial equipment',
    ],

    // ============================================
    // URBANISMO
    // ============================================
    'Infraestructura Vial' => [
        'bridge',
        'highway',
        'road',
        'pavement',
        'street light',
    ],
    
    'Espacios Públicos' => [
        'plaza',
        'park',
        'public square',
        'fountain',
    ],
    
    'Paisajismo' => [
        'garden',
        'tree',
        'plant',
        'landscape',
    ],
    
    'Redes de Servicio' => [
        'utility trench',
        'cable trench',
        'underground utilities',
        'pipe trench',
        'manhole',
    ],
];

$totalImportados = 0;
$categoriasProcesadas = 0;

foreach ($busquedas as $categoria => $terminos) {
    echo "\n🎯 CATEGORÍA: " . $categoria . "\n";
    echo str_repeat("─", 60) . "\n";
    
    $importadosCategoria = 0;
    
    foreach ($terminos as $termino) {
        echo "   🔍 Buscando: \"{$termino}\"... ";
        
        // Ejecutar el comando de importación y mostrar salida completa
        $output = shell_exec("php artisan sketchfab:import \"{$termino}\" --limit=5 2>&1");
        
        // Contar modelos importados de forma manual
        $lines = explode("\n", $output);
        $count = 0;
        foreach ($lines as $line) {
            if (strpos($line, '✅ Modelo importado:') !== false) {
                $count++;
            }
        }
        
        if ($count > 0) {
            $importadosCategoria += $count;
            $totalImportados += $count;
            echo "✅ (+{$count})\n";
            
            // Mostrar los nombres de los modelos importados
            foreach ($lines as $line) {
                if (strpos($line, '✅ Modelo importado:') !== false) {
                    echo "      " . trim($line) . "\n";
                }
            }
        } else {
            echo "⚠️  0\n";
        }
        
        // Pequeña pausa para no saturar la API
        sleep(2);
    }
    
    echo "   📊 Total para {$categoria}: {$importadosCategoria} modelos\n";
    $categoriasProcesadas++;
    
    // Pausa entre categorías
    sleep(3);
}

echo "\n" . str_repeat("═", 60) . "\n";
echo "✅ IMPORTACIÓN COMPLETADA\n";
echo "📊 Total de modelos importados: {$totalImportados}\n";
echo "📊 Categorías procesadas: {$categoriasProcesadas}\n";
echo str_repeat("═", 60) . "\n";