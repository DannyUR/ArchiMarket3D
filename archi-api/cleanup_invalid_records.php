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

$modelsPath = __DIR__ . '/storage/app/public/models';
$deleted = 0;
$verified = 0;

echo "🔍 Verificando integridad de registros...\n\n";

// Obtener TODOS los registros de descargas
$stmt = $pdo->prepare("SELECT id, model_id, file_url FROM model_files WHERE file_type = 'download'");
$stmt->execute();
$files = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($files as $file) {
    $fileId = $file['id'];
    $modelId = $file['model_id'];
    $fileUrl = $file['file_url'];
    
    // Reconstruir la ruta en disk
    // file_url es: /storage/models/5/old_key.glb
    preg_match('/\/models\/(\d+)\/(.+)$/', $fileUrl, $matches);
    
    if (empty($matches)) {
        // URL inválida, eliminar
        $delStmt = $pdo->prepare("DELETE FROM model_files WHERE id = ?");
        $delStmt->execute([$fileId]);
        $deleted++;
        continue;
    }
    
    $diskPath = $modelsPath . '/' . $matches[1] . '/' . urldecode($matches[2]);
    
    if (!file_exists($diskPath) || filesize($diskPath) <= 1024 * 1024) {
        // Archivo no existe o es inválido, eliminar registro
        $delStmt = $pdo->prepare("DELETE FROM model_files WHERE id = ?");
        $delStmt->execute([$fileId]);
        $deleted++;
        echo "🗑️  Eliminado registro $fileId (Model $modelId, archivo no existe)\n";
    } else {
        $verified++;
    }
}

echo "\n📊 RESULTADO\n";
echo "=======================\n";
echo "Registros verificados: $verified\n";
echo "Registros eliminados: $deleted\n";
echo "\nTotal registros después: " . ($verified) . "\n";
