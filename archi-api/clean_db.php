<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

// Delete all records with NULL size_bytes from recent downloads
$deleted = DB::table('model_files')
    ->where('file_type', 'download')
    ->where('origin', 'sketchfab')
    ->whereNull('size_bytes')
    ->delete();

echo "Deleted {$deleted} incomplete records\n";

// Show remaining records
$remaining = DB::table('model_files')
    ->where('file_type', 'download')
    ->where('origin', 'sketchfab')
    ->count();

echo "Remaining records: {$remaining}\n";
