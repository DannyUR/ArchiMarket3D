<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::capture();
$response = $kernel->handle($request);

// Consulta los usuarios
echo "--- VERIFICAR TIPOS DE USUARIO ---\n\n";

$users = \App\Models\User::select('id', 'name', 'email', 'user_type')->get();

foreach ($users as $user) {
    echo "ID: {$user->id}, Name: {$user->name}, Email: {$user->email}, Type: {$user->user_type}\n";
}
