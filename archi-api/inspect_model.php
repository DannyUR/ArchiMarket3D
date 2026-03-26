<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$m = \Illuminate\Support\Facades\DB::table('models')
    ->select('*')
    ->limit(1)
    ->first();

if ($m) {
    echo "=== MODELO 1 ===\n";
    foreach ((array)$m as $key => $value) {
        $val = is_string($value) ? substr($value, 0, 80) : $value;
        echo "$key: $val\n";
    }
}
