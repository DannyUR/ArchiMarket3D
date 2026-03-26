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

// Registros totales GLB
$stmt = $pdo->prepare("SELECT COUNT(*) as total FROM model_files WHERE format = 'GLB'");
$stmt->execute();
$totalRecords = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

// Modelos ÚNICOS con GLB
$stmt = $pdo->prepare("SELECT COUNT(DISTINCT model_id) as unique_models FROM model_files WHERE format = 'GLB'");
$stmt->execute();
$uniqueModels = $stmt->fetch(PDO::FETCH_ASSOC)['unique_models'];

// Modelos con registros duplicados
$stmt = $pdo->prepare("
    SELECT model_id, COUNT(*) as cnt FROM model_files 
    WHERE format = 'GLB' 
    GROUP BY model_id 
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
");
$stmt->execute();
$duplicates = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "📊 ESTADO ACTUAL\n";
echo "================================\n";
echo "Total registros GLB: $totalRecords\n";
echo "Modelos ÚNICOS: $uniqueModels\n";
echo "Registros duplicados esperados: " . ($totalRecords - $uniqueModels) . "\n";

if (!empty($duplicates)) {
    echo "\n⚠️  MODELOS CON DUPLICADOS:\n";
    foreach (array_slice($duplicates, 0, 10) as $dup) {
        echo "  - Modelo {$dup['model_id']}: {$dup['cnt']} registros\n";
    }
}
