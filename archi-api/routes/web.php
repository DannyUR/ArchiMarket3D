<?php

use Illuminate\Support\Facades\Route;

// =============================================
// RUTAS DEL FRONTEND (React)
// =============================================
// Todas las rutas que NO empiecen con /api van al frontend
Route::get('/{any?}', function () {
    return File::get(public_path('index.html'));
})->where('any', '^(?!api).*$');

// =============================================
// RUTAS DE LA API (ya están en routes/api.php)
// =============================================
// No tocar nada de api aquí

Route::get('/test-mail', function () {
    try {
        Mail::raw('¡Configuración de correo exitosa!', function ($message) {
            $message->to('uscanga.04.07@gmail.com')
                    ->subject('Test ArchiMarket3D');
        });
        return '✅ Correo enviado correctamente! Revisa tu bandeja de entrada.';
    } catch (\Exception $e) {
        return '❌ Error: ' . $e->getMessage();
    }
});