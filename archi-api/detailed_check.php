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

// Obtener archivos en disk para cada modelo 1-20
$modelsPath = __DIR__ . '/storage/app/public/models';

echo "📊 ANÁLISIS DETALLADO MODELOS 1-50\n";
echo "=====================================\n\n";

for ($i = 1; $i <= 50; $i++) {
    $modelPath = "$modelsPath/$i";
    
    // Archivos en disk
    $diskFiles = [];
    if (is_dir($modelPath)) {
        $glbFiles = glob("$modelPath/*.glb");
        $diskFiles = array_filter($glbFiles, fn($f) => filesize($f) > 1024 * 1024);
    }
    
    // Archivos en BD
    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM model_files WHERE model_id = ? AND format = 'GLB'");
    $stmt->execute([$i]);
    $dbCount = $stmt->fetch(PDO::FETCH_ASSOC)['cnt'];
    
    $status = '';
    if (!empty($diskFiles) && $dbCount > 0) {
        $status = '✅ OK';
    } elseif (!empty($diskFiles) && $dbCount === 0) {
        $status = '⚠️  Archivo en disk pero NO en BD';
    } elseif (empty($diskFiles) && $dbCount > 0) {
        $status = '⚠️  En BD pero NO en disk';
    } else {
        $status = '  (sin archivos)';
    }
    
    if (!empty($diskFiles) || $dbCount > 0) {
        echo "[$i] $status (Disk: " . count($diskFiles) . ", BD: $dbCount)\n";
    }
}
