<?php
// Script sin autoload para evitar problemas
$dbPath = __DIR__ . '/database/database.sqlite';

if (!file_exists($dbPath)) {
    die("❌ BD no encontrada en: $dbPath\n");
}

try {
    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Contar modelos
    $stmt = $db->query("SELECT COUNT(*) as cnt FROM models");
    $totalModels = $stmt->fetch()[0];
    
    // Contar modelos con descargas
    $stmt = $db->query("
        SELECT COUNT(DISTINCT model_id) as cnt 
        FROM model_files 
        WHERE file_type = 'download'
    ");
    $modelsWithFiles = $stmt->fetch()[0];
    
    // Contar total de archivos
    $stmt = $db->query("
        SELECT COUNT(*) as cnt 
        FROM model_files 
        WHERE file_type = 'download'
    ");
    $totalFiles = $stmt->fetch()[0];
    
    // Por formato
    $stmt = $db->query("
        SELECT format, COUNT(*) as cnt 
        FROM model_files 
        WHERE file_type = 'download'
        GROUP BY format
    ");
    $byFormat = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "=== ESTADO ACTUAL DE BD ===\n";
    echo "Total modelos: $totalModels\n";
    echo "Modelos con descargas registradas: $modelsWithFiles\n";
    echo "Total archivos en BD: $totalFiles\n";
    echo "Modelos SIN descargas: " . ($totalModels - $modelsWithFiles) . "\n\n";
    
    echo "Distribución por formato:\n";
    foreach ($byFormat as $row) {
        echo "  {$row['format']}: {$row['cnt']}\n";
    }
    
    // Primeros modelos SIN descarga
    echo "\n=== PRIMEROS 10 MODELOS SIN DESCARGA ===\n";
    $stmt = $db->prepare("
        SELECT id, name 
        FROM models 
        WHERE id NOT IN (
            SELECT DISTINCT model_id FROM model_files WHERE file_type = 'download'
        )
        LIMIT 10
    ");
    $stmt->execute();
    $noDownload = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($noDownload as $row) {
        echo "  ID {$row['id']}: {$row['name']}\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
