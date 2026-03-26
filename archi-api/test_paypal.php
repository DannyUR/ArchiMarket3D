<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

try {
    echo "1. Verificando PayPalService...\n";
    $reflector = new ReflectionClass('App\\Services\\PayPalService');
    echo "✅ PayPalService encontrado en: " . $reflector->getFileName() . "\n";
    
    echo "\n2. Verificando ShoppingController...\n";
    $controllerReflector = new ReflectionClass('App\\Http\\Controllers\\Api\\ShoppingController');
    echo "✅ ShoppingController encontrado en: " . $controllerReflector->getFileName() . "\n";
    
    echo "\n3. Verificando imports del controlador...\n";
    $controllerFile = $controllerReflector->getFileName();
    $content = file_get_contents($controllerFile);
    preg_match_all('/^use\s+(.+);/m', $content, $matches);
    foreach ($matches[1] as $use) {
        if (strpos($use, 'PayPal') !== false) {
            echo "✅ Import encontrado: " . $use . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}