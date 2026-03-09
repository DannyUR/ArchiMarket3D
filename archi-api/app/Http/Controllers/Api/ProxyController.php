<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProxyController extends Controller
{
    public function image(Request $request)
    {
        $url = $request->query('url');
        
        Log::info('📸 Proxy solicitado para: ' . $url);
        
        if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
            Log::error('URL inválida: ' . $url);
            return $this->defaultImage('URL inválida');
        }

        // Solo permitir URLs de Sketchfab
        if (!str_contains($url, 'sketchfab.com')) {
            Log::error('URL no permitida: ' . $url);
            return $this->defaultImage('URL no permitida');
        }

        // Intentar diferentes resoluciones
        $urlsToTry = $this->generateUrls($url);
        
        foreach ($urlsToTry as $tryUrl) {
            $result = $this->tryLoadImage($tryUrl);
            if ($result) {
                return $result;
            }
        }

        Log::error('No se pudo cargar la imagen después de intentar todas las URLs');
        return $this->defaultImage('No disponible');
    }

    private function tryLoadImage($url)
    {
        try {
            $cacheKey = 'proxy_image_' . md5($url);
            
            return Cache::remember($cacheKey, 3600, function() use ($url) {
                Log::info('Intentando cargar: ' . $url);
                
                $response = Http::withOptions([
                    'verify' => false,
                    'timeout' => 10,
                ])->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept' => 'image/webp,image/apng,image/*,*/*;q=0.8',
                    'Accept-Language' => 'es-ES,es;q=0.9,en;q=0.8',
                    'Referer' => 'https://sketchfab.com/',
                    'Origin' => 'https://sketchfab.com',
                    'Sec-Fetch-Site' => 'same-site',
                    'Sec-Fetch-Mode' => 'no-cors',
                    'Sec-Fetch-Dest' => 'image',
                ])->get($url);

                if ($response->successful()) {
                    $contentType = $response->header('Content-Type');
                    
                    // Verificar que realmente es una imagen
                    if (str_contains($contentType, 'image/')) {
                        Log::info('✅ Imagen cargada exitosamente: ' . $url);
                        
                        return response($response->body(), 200)
                            ->header('Content-Type', $contentType)
                            ->header('Cache-Control', 'public, max-age=86400')
                            ->header('Access-Control-Allow-Origin', '*');
                    }
                }
                
                Log::warning('⚠️ Respuesta no válida para: ' . $url);
                return null;
            });
            
        } catch (\Exception $e) {
            Log::error('Error cargando ' . $url . ': ' . $e->getMessage());
            return null;
        }
    }

    private function generateUrls($originalUrl)
    {
        $urls = [$originalUrl];
        
        // Extraer el ID del modelo de la URL
        if (preg_match('/models\/([a-f0-9]+)/', $originalUrl, $matches)) {
            $modelId = $matches[1];
            
            // Probar diferentes resoluciones y formatos
            $variations = [
                "https://media.sketchfab.com/models/{$modelId}/thumbnails/best.jpg",
                "https://media.sketchfab.com/models/{$modelId}/thumbnails/800x600.jpg",
                "https://media.sketchfab.com/models/{$modelId}/thumbnails/640x480.jpg",
                "https://media.sketchfab.com/models/{$modelId}/thumbnails/512x512.jpg",
                "https://media.sketchfab.com/models/{$modelId}/thumbnails/256x256.jpg",
                "https://media.sketchfab.com/models/{$modelId}/thumbnails/og.jpg",
                "https://media.sketchfab.com/models/{$modelId}/thumbnails/thumbnail.png",
                "https://media.sketchfab.com/models/{$modelId}/thumbnails/360x360.jpg",
            ];
            
            $urls = array_merge($urls, $variations);
        }
        
        return array_unique($urls);
    }

    private function defaultImage($reason = '')
    {
        Log::info('Usando imagen por defecto. Razón: ' . $reason);
        
        // Crear un SVG más atractivo con el texto "3D Model"
        $svg = '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.1" />
                    <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0.05" />
                </linearGradient>
            </defs>
            <rect width="400" height="300" fill="url(#grad)"/>
            <rect x="100" y="70" width="200" height="150" fill="#3b82f6" opacity="0.2" rx="10"/>
            <circle cx="200" cy="120" r="30" fill="#3b82f6" opacity="0.3"/>
            <rect x="150" y="160" width="100" height="40" fill="#3b82f6" opacity="0.3" rx="5"/>
            <text x="200" y="250" font-family="Arial, sans-serif" font-size="24" fill="#3b82f6" text-anchor="middle" font-weight="bold">3D MODEL</text>
            <text x="200" y="280" font-family="Arial, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">Vista previa no disponible</text>
        </svg>';

        return response($svg, 200)
            ->header('Content-Type', 'image/svg+xml')
            ->header('Cache-Control', 'public, max-age=3600')
            ->header('Access-Control-Allow-Origin', '*');
    }
}