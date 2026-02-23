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
            $response = Http::get($this->baseUrl . '/models', [
                'q' => $query,
                'categories' => 'architecture',
                'downloadable' => 'true',
                'sort_by' => '-publishedAt',
                'limit' => $limit
            ]);

            if ($response->successful()) {
                return $response->json()['results'] ?? [];
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
            $response = Http::get($this->baseUrl . "/models/{$modelId}");

            if ($response->successful()) {
                return $response->json();
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Error obteniendo detalles: ' . $e->getMessage());
            return null;
        }
    }
}