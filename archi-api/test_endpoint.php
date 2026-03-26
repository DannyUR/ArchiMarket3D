<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ModelFile;
use App\Models\Model3D;

// Pick a model that has downloads
$models = Model3D::whereHas('files', function($q) {
    $q->where('file_type', 'download')->where('size_bytes', '>', 0);
})->limit(3)->get();

echo "\n=== Testing availableFormats Response ===\n\n";

foreach ($models as $model) {
    echo "Model: {$model->id} - {$model->name}\n";
    
    $files = $model->files()
        ->where('file_type', 'download')
        ->get(['id', 'file_url', 'format', 'size_bytes', 'created_at']);
    
    $formats = $files->map(function($file) {
        return [
            'id' => $file->id,
            'format' => $file->format ?? strtoupper(pathinfo($file->file_url, PATHINFO_EXTENSION)),
            'size_bytes' => $file->size_bytes ?? 0,
            'size_mb' => round(($file->size_bytes ?? 0) / 1024 / 1024, 2),
            'file_url' => $file->file_url,
            'created_at' => $file->created_at
        ];
    });
    
    echo "  Available formats:\n";
    foreach ($formats as $format) {
        echo "    - {$format['format']}: {$format['size_mb']} MB (id: {$format['id']})\n";
    }
    echo "\n";
}
