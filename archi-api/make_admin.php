<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Actualizar usuario a admin
use App\Models\User;

echo "=== ACTUALIZAR USUARIO A ADMIN ===\n\n";

// Actualizar ID 4 (Danny) a admin
$user = User::find(4);
if ($user) {
    $user->user_type = 'admin';
    $user->save();
    echo "✅ Usuario actualizado:\n";
    echo "   Nombre: " . $user->name . "\n";
    echo "   Email: " . $user->email . "\n";
    echo "   Tipo: " . $user->user_type . "\n";
} else {
    echo "❌ Usuario ID 4 no encontrado\n";
}

// Verificar otros admins
echo "\n=== ADMINS EN LA PLATAFORMA ===\n\n";
$admins = User::where('user_type', 'admin')->get();
foreach ($admins as $admin) {
    echo "- " . $admin->name . " (" . $admin->email . ")\n";
}
