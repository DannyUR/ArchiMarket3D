<?php

use Illuminate\Support\Facades\Route;
use App\Models\Model3D;

Route::get('/test', function () {
    return Model3D::with([
        'category',
        'licenses',
        'mixedReality',
        'files',
        'reviews'
    ])->get();
});

