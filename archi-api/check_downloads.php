<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ModelFile;

// Check the recently downloaded files
$files = ModelFile::where('format', 'glb')
    ->where('origin', 'sketchfab')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get(['model_id', 'format', 'size_bytes', 'original_name', 'created_at']);

echo "\n=== Recently Downloaded GLB Files ===\n";
echo str_pad('Model ID', 12) . str_pad('Format', 10) . str_pad('Size (MB)', 15) . str_pad('Name', 40) . "\n";
echo str_repeat('-', 77) . "\n";

foreach ($files as $file) {
    $sizeMB = round($file->size_bytes / (1024 * 1024), 2);
    echo str_pad($file->model_id, 12) . 
         str_pad($file->format, 10) . 
         str_pad($sizeMB . ' MB', 15) . 
         substr($file->original_name ?? 'N/A', 0, 40) . "\n";
}

// Check total stats
$stats = ModelFile::where('format', 'glb')
    ->where('size_bytes', '>', 0)
    ->selectRaw('COUNT(*) as count, SUM(size_bytes) as total')
    ->first();

echo "\n=== Stats ===\n";
echo "Total GLB files with content: " . $stats->count . "\n";
echo "Total size: " . round($stats->total / (1024 * 1024 * 1024), 2) . " GB\n";
