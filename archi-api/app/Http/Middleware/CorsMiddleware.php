<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:8080',
            'http://127.0.0.1:8080',
            'http://localhost:8081',
            'http://127.0.0.1:8081',
            'http://localhost:8083',
            'http://127.0.0.1:8083',
            'http://192.168.1.20:3000',
            'http://192.168.1.20:8081',
            'http://192.168.1.20:8082',
            'http://192.168.1.20:8083',
            'http://192.168.1.11:3000',
            'https://housewifely-quadrophonics-audrianna.ngrok-free.dev',
        ];

        $origin = $request->header('Origin');
        $isAllowed = in_array($origin, $allowedOrigins);

        // ✅ Manejar preflight OPTIONS
        if ($request->isMethod('OPTIONS')) {
            return response('', 204)
                ->header('Access-Control-Allow-Origin', $isAllowed ? $origin : 'null')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, ngrok-skip-browser-warning')
                ->header('Access-Control-Max-Age', '86400')
                ->header('Access-Control-Allow-Credentials', 'true');
        }

        $response = $next($request);

        if ($isAllowed) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, ngrok-skip-browser-warning');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }

        return $response;
    }
}