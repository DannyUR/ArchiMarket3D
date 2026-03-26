<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;

echo "Columns in reviews table:\n";
$columns = Schema::getColumnListing('reviews');
echo json_encode($columns, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

// Check specific columns
echo "\n\nChecking for reply columns:\n";
echo "admin_reply exists: " . (in_array('admin_reply', $columns) ? 'YES' : 'NO') . "\n";
echo "replied_at exists: " . (in_array('replied_at', $columns) ? 'YES' : 'NO') . "\n";
echo "replied_by exists: " . (in_array('replied_by', $columns) ? 'YES' : 'NO') . "\n";
