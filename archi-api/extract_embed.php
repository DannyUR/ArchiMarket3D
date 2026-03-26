<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Intentar directamente con DB
try {
    \Illuminate\Support\Facades\DB::connection()->getPdo();
    echo "✅ Conexión MySQL OK\n";
} catch (\Exception $e) {
    echo "❌ Error de conexión: " . $e->getMessage() . "\n";
    exit(1);
}

// Extraer embed_url
$models = \App\Models\Model3D::all();
$updated = 0;
$total = $models->count();

echo "📊 Procesando $total modelos...\n";

foreach ($models as $i => $model) {
    if ($model->embed_url) {
        continue;
    }

    // Decodificar metadata manualmente
    $metadata = $model->metadata;
    if (is_string($metadata)) {
        $metadata = json_decode($metadata, true);
    }

    // Extraer embed_url del metadata
    if (is_array($metadata) && isset($metadata['embed_url'])) {
        $url = $metadata['embed_url'];
        $url = str_replace('\\/', '/', $url);
        
        // Actualizar en BD
        \Illuminate\Support\Facades\DB::table('models')
            ->where('id', $model->id)
            ->update(['embed_url' => $url]);
        
        $updated++;
        
        if ($updated % 10 == 0) {
            echo "  ✓ $updated modelos...\n";
        }
    }
    
    echo "\r  Procesando: " . ($i + 1) . "/$total";
}

echo "\n\n✅ Completado: $updated modelos actualizados\n";
