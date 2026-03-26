<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

// Check raw database content
$files = DB::table('model_files')
    ->where('file_type', 'download')
    ->where('origin', 'sketchfab')
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get();

echo "\n=== Raw Database Records ===\n";
echo "Total records: " . count($files) . "\n\n";

foreach ($files as $file) {
    echo "Model ID: {$file->model_id}\n";
    echo "  Format: {$file->format}\n";
    echo "  Size Bytes: {$file->size_bytes}\n";
    echo "  Original Name: {$file->original_name}\n";
    echo "  File URL: {$file->file_url}\n";
    echo "  Created: {$file->created_at}\n\n";
}

// Check for null values
$nullCheck = DB::table('model_files')
    ->where('file_type', 'download')
    ->where('origin', 'sketchfab')
    ->whereNull('size_bytes')
    ->count();

echo "Records with NULL size_bytes: " . $nullCheck . "\n";

// Check for false entries
$falseCheck = DB::table('model_files')
    ->where('file_type', 'download')
    ->where('origin', 'sketchfab')
    ->where('size_bytes', 0)
    ->count();

echo "Records with size_bytes = 0: " . $falseCheck . "\n";
