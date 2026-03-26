<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SketchfabService
{
    protected $apiKey;
    protected $baseUrl = 'https://api.sketchfab.com/v3';

    public function __construct()
    {
        $this->apiKey = config('services.sketchfab.api_key');
    }

    public function searchArchitecturalModels($query = 'architecture', $limit = 20)
    {
        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
            ])->get($this->baseUrl . '/search', [
                'type' => 'models',
                'q' => $query,
                'categories' => 'architecture',
                'downloadable' => 'true',
                'sort_by' => '-publishedAt',
                'count' => $limit
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['results'] ?? [];
            }

            Log::error('Sketchfab API error: ' . $response->body());
            return [];

        } catch (\Exception $e) {
            Log::error('Sketchfab exception: ' . $e->getMessage());
            return [];
        }
    }

    public function getModelDetails($modelId)
    {
        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
            ])->get($this->baseUrl . "/models/{$modelId}");

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Error obteniendo detalles: ' . $response->body());
            return null;

        } catch (\Exception $e) {
            Log::error('Error obteniendo detalles: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Obtener URLs de descarga para un modelo
     */
    public function getDownloadUrls($modelId)
    {
        try {
            $this->apiKey = config('services.sketchfab.api_key');
            Log::info('🔑 API Key (primeros 10): ' . substr($this->apiKey, 0, 10));
            
            $response = Http::withHeaders([
                'Authorization' => 'Token ' . $this->apiKey,
                'Accept' => 'application/json',
            ])->get($this->baseUrl . "/models/{$modelId}/download");

            Log::info('📡 Status: ' . $response->status());
            Log::info('📦 Body: ' . $response->body());

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Error obteniendo URLs de descarga: ' . $response->body());
            return null;

        } catch (\Exception $e) {
            Log::error('Error obteniendo URLs de descarga: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Descargar un archivo real de Sketchfab
     */
    public function downloadModelFile($downloadUrl)
    {
        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept' => '*/*',
            ])->timeout(60)->get($downloadUrl);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->body(),
                    'content_type' => $response->header('Content-Type'),
                    'size' => $response->header('Content-Length') ?? strlen($response->body())
                ];
            }

            Log::error('Error descargando archivo: ' . $response->body());
            return ['success' => false, 'error' => 'Error en descarga'];

        } catch (\Exception $e) {
            Log::error('Excepción descargando archivo: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}