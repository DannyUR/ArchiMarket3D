<?php
$host = '127.0.0.1';
$db = 'archimarket3d';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // PASO 1: Eliminar registros sin size_bytes
    echo "🗑️  Limpiando registros inválidos...\n";
    $stmt = $pdo->prepare("
        DELETE FROM model_files 
        WHERE file_type = 'download' AND (size_bytes = 0 OR size_bytes IS NULL)
    ");
    $deleted = $stmt->execute();
    $count = $stmt->rowCount();
    echo "   Eliminados: $count registros inválidos\n";
    
    // PASO 2: Eliminar duplicados (quedarse con el más grande)
    echo "🔄 Eliminando duplicados...\n";
    $stmt = $pdo->prepare("
        DELETE FROM model_files 
        WHERE id NOT IN (
            SELECT MAX(id) FROM model_files 
            WHERE file_type = 'download'
            GROUP BY model_id, format
        ) AND file_type = 'download'
    ");
    $stmt->execute();
    $count = $stmt->rowCount();
    echo "   Eliminados: $count duplicados\n";
    
    echo "\n✅ Base de datos limpiada\n";
    
    // PASO 3: Verificar estado después de limpieza
    echo "\n📊 Estado después de limpieza:\n";
    $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM model_files WHERE file_type = 'download'");
    $totalFiles = $stmt->fetch(PDO::FETCH_ASSOC)['cnt'];
    
    $stmt = $pdo->query("
        SELECT COUNT(DISTINCT model_id) as cnt 
        FROM model_files 
        WHERE file_type = 'download'
    ");
    $modelsWithDown = $stmt->fetch(PDO::FETCH_ASSOC)['cnt'];
    
    echo "  Total archivos: $totalFiles\n";
    echo "  Modelos con descarga: $modelsWithDown / 214\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
