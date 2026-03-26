<?php

use Illuminate\Support\Facades\Route;

Route::get('/debug/whoami', function () {
    $user = auth('sanctum')->user();
    
    if (!$user) {
        return response()->json([
            'authenticated' => false,
            'message' => 'No user authenticated'
        ]);
    }
    
    return response()->json([
        'authenticated' => true,
        'user_id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'user_type' => $user->user_type,
        'is_admin' => $user->user_type === 'admin'
    ]);
});
