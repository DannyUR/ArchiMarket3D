<?php
require_once __DIR__ . '/bootstrap/app.php';

use App\Models\Model3D;
use App\Models\ModelFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

// Buscar modelo 213 específicamente
$model = Model3D::find(213);

if (!$model) {
    die("❌ Modelo 213 no encontrado\n");
}

echo "📦 Procesando: {$model->name} (ID: {$model->id})\n";

if (!$model->sketchfab_id) {
    echo "⚠️ No tiene sketchfab_id\n";
    exit(1);
}

$metadata = $model->metadata ?? [];
$urls = $metadata['download_urls'] ?? [];

echo "URLs disponibles: " . implode(', ', array_keys($urls)) . "\n";

if (!isset($urls['glb'])) {
    echo "⚠️ No tiene URL para GLB\n";
    if (isset($urls['gltf'])) {
        echo "📥 Intentando descargar GLTF...\n";
        $url = $urls['gltf'];
        $format = 'gltf';
    } else {
        echo "❌ No hay URLs de descarga disponibles\n";
        exit(1);
    }
} else {
    $url = $urls['glb'];
    $format = 'glb';
}

try {
    echo "🔗 Descargando desde: " . substr($url, 0, 80) . "...\n";
    $response = Http::timeout(60)->get($url);
    
    if (!$response->successful()) {
        echo "❌ Error HTTP: " . $response->status() . "\n";
        exit(1);
    }
    
    $fileName = 'models/' . $model->id . '/' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $model->name) . '.' . $format;
    Storage::disk('public')->put($fileName, $response->body());
    
    ModelFile::updateOrCreate(
        [
            'model_id' => $model->id,
            'format' => strtoupper($format),
            'file_type' => 'download'
        ],
        [
            'file_url' => '/storage/' . $fileName,
            'original_name' => basename($fileName),
            'size_bytes' => strlen($response->body())
        ]
    );
    
    $sizeMB = strlen($response->body()) / (1024 * 1024);
    echo "✅ Descargado correctamente: " . number_format($sizeMB, 2) . " MB\n";
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
