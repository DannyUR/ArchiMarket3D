<?php
$host = '127.0.0.1';
$db = 'archimarket3d';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Total modelos
    $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM models");
    $totalModels = $stmt->fetch(PDO::FETCH_ASSOC)['cnt'];
    
    // Modelos CON descargas
    $stmt = $pdo->query("
        SELECT COUNT(DISTINCT model_id) as cnt 
        FROM model_files 
        WHERE file_type = 'download'
    ");
    $modelsWithDown = $stmt->fetch(PDO::FETCH_ASSOC)['cnt'];
    
    // Total archivos
    $stmt = $pdo->query("
        SELECT COUNT(*) as cnt 
        FROM model_files 
        WHERE file_type = 'download'
    ");
    $totalFiles = $stmt->fetch(PDO::FETCH_ASSOC)['cnt'];
    
    // Por formato
    $stmt = $pdo->query("
        SELECT format, COUNT(*) as cnt 
        FROM model_files 
        WHERE file_type = 'download'
        GROUP BY format ORDER BY cnt DESC
    ");
    $byFormat = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📊 === ESTADO ACTUAL ===\n\n";
    echo "Total modelos en BD: $totalModels\n";
    echo "✅ Modelos CON descargas: $modelsWithDown\n";
    echo "❌ Modelos SIN descargas: " . ($totalModels - $modelsWithDown) . "\n";
    echo "Total archivos registrados: $totalFiles\n\n";
    
    echo "Distribución por formato:\n";
    foreach ($byFormat as $row) {
        echo "  ✓ {$row['format']}: {$row['cnt']}\n";
    }
    
    // Modelos sin descarga
    echo "\n❌ === PRIMEROS 15 MODELOS SIN DESCARGA ===\n";
    $stmt = $pdo->prepare("
        SELECT id, name, category_id
        FROM models 
        WHERE id NOT IN (
            SELECT DISTINCT model_id FROM model_files WHERE file_type = 'download'
        )
        ORDER BY id
        LIMIT 15
    ");
    $stmt->execute();
    $noDown = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($noDown as $row) {
        echo "  [{$row['id']}] {$row['name']}\n";
    }
    
    echo "\n✅ === PRIMEROS 15 MODELOS CON DESCARGA ===\n";
    $stmt = $pdo->prepare("
        SELECT DISTINCT m.id, m.name, GROUP_CONCAT(f.format) as formatos
        FROM models m
        JOIN model_files f ON m.id = f.model_id AND f.file_type = 'download'
        GROUP BY m.id
        ORDER BY m.id
        LIMIT 15
    ");
    $stmt->execute();
    $withDown = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($withDown as $row) {
        echo "  [{$row['id']}] {$row['name']} ({$row['formatos']})\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
