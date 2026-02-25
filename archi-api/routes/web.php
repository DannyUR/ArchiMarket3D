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