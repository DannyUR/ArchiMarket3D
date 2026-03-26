<?php

// Conectar BD con PDO
$host = '127.0.0.1';
$db = 'archimarket3d';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
} catch (PDOException $e) {
    die("❌ Error BD: " . $e->getMessage());
}

// Modelos que tienen descargas registradas
$stmt = $pdo->prepare("
    SELECT DISTINCT model_id 
    FROM model_files 
    WHERE format = 'GLB' AND file_type = 'download'
    ORDER BY model_id
");
$stmt->execute();
$registeredModels = array_map(fn($row) => (int)$row['model_id'], $stmt->fetchAll(PDO::FETCH_ASSOC));

// Modelos que existen en BD
$stmt = $pdo->prepare("SELECT id FROM models ORDER BY id");
$stmt->execute();
$validModelIds = array_map(fn($row) => (int)$row['id'], $stmt->fetchAll(PDO::FETCH_ASSOC));

// Obtener archivos en disk para modelos válidos
$modelsPath = __DIR__ . '/storage/app/public/models';
$modelsWithFiles = [];

foreach ($validModelIds as $modelId) {
    $modelPath = "$modelsPath/$modelId";
    
    if (!is_dir($modelPath)) continue;
    
    $glbFiles = glob("$modelPath/*.glb");
    $validFiles = array_filter($glbFiles, fn($f) => filesize($f) > 1024 * 1024);
    
    if (!empty($validFiles)) {
        $modelsWithFiles[] = $modelId;
    }
}

// Modelos con archivos pero NO registrados
$missing = array_diff($modelsWithFiles, $registeredModels);

echo "📊 RESUMEN\n";
echo "================================\n";
echo "Modelos con archivos en disk: " . count($modelsWithFiles) . "\n";
echo "Modelos registrados en BD: " . count($registeredModels) . "\n";
echo "❌ Modelos SIN registrar: " . count($missing) . "\n\n";

if (!empty($missing)) {
    echo "❌ IDs SIN REGISTRAR:\n";
    echo implode(', ', array_slice($missing, 0, 50));
    if (count($missing) > 50) {
        echo "\n... y " . (count($missing) - 50) . " más\n";
    }
    echo "\n\n";
}

echo "✅ REGISTRADOS CORRECTAMENTE:\n";
$registeredCount = count($registeredModels);
echo implode(', ', array_slice($registeredModels, 0, 50));
if ($registeredCount > 50) {
    echo "\n... y " . ($registeredCount - 50) . " más\n";
}
