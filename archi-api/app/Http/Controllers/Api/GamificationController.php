// app/Http/Controllers/API/GamificationController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GamificationService;
use Illuminate\Http\Request;

class GamificationController extends Controller
{
    public function getStats(Request $request)
    {
        $user = $request->user();
        $data = GamificationService::getUserGamificationData($user);
        
        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}