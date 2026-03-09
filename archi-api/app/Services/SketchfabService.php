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
            ])->get($this->baseUrl . '/search', [  // ← CAMBIADO: /search en lugar de /models
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
}