<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user()) {
            return response()->json([
                'message' => 'No autenticado.'
            ], 401);
        }

        if ($request->user()->user_type !== 'admin') {
            return response()->json([
                'message' => 'No autorizado.'
            ], 403);
        }

        return $next($request);
    }
}
