<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$model = \Illuminate\Support\Facades\DB::table('models')
    ->where('id', 1659)
    ->first();

echo "=== MODELO 1659 ===\n";
echo "embed_url: " . ($model->embed_url ?? 'NULL') . "\n";
echo "metadata type: " . gettype($model->metadata) . "\n";
echo "metadata: " . $model->metadata . "\n\n";

// Intentar decodificar
if ($model->metadata) {
    $decoded = json_decode($model->metadata, true);
    echo "decoded type: " . gettype($decoded) . "\n";
    if (is_array($decoded)) {
        echo "Has embed_url in metadata: " . (isset($decoded['embed_url']) ? 'YES' : 'NO') . "\n";
        if (isset($decoded['embed_url'])) {
            echo "embed_url value: {$decoded['embed_url']}\n";
        }
    } else {
        echo "Failed to decode as array\n";
    }
}
