<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Model3D;
use Illuminate\Support\Facades\Http;

class FetchSketchfabIds extends Command
{
    protected $signature = 'models:fetch-sketchfab-ids';
    protected $description = 'Buscar y actualizar sketchfab_id para cada modelo usando el nombre';

    public function handle()
    {
        $this->info('🔍 Iniciando búsqueda de modelos en Sketchfab...\n');
        
        $apiToken = config('services.sketchfab.api_key');
        if (!$apiToken) {
            $this->error('❌ SKETCHFAB_API_KEY no configurado');
            return 1;
        }

        // Obtener modelos sin sketchfab_id
        $models = Model3D::whereNull('sketchfab_id')
            ->limit(50)
            ->get();

        if ($models->isEmpty()) {
            $this->warn('✅ Todos los modelos tienen sketchfab_id');
            return 0;
        }

        $this->info("📦 Buscando {$models->count()} modelos...\n");
        $updated = 0;
        $failed = 0;

        foreach ($models as $model) {
            $this->line("📍 [{$model->id}] {$model->name}");
            
            try {
                // Buscar en Sketchfab por nombre
                $response = Http::withToken($apiToken)
                    ->timeout(10)
                    ->get("https://api.sketchfab.com/v3/search", [
                        'type' => 'models',
                        'q' => $model->name,
                        'count' => 5,
                        'sort_by' => '-relevance'
                    ]);

                if (!$response->successful()) {
                    $this->error("   ❌ Error de búsqueda");
                    $failed++;
                    continue;
                }

                $data = $response->json();
                $results = $data['results'] ?? [];

                if (empty($results)) {
                    $this->warn("   ⚠️  No encontrado en Sketchfab");
                    $failed++;
                    continue;
                }

                // Tomar el primer resultado (más relevante)
                $sketchfabModel = $results[0];
                $sketchfabId = $sketchfabModel['uid'] ?? null;
                $sketchfabName = $sketchfabModel['name'] ?? 'Unknown';

                if (!$sketchfabId) {
                    $this->warn("   ⚠️  No se pudo obtener UID");
                    $failed++;
                    continue;
                }

                // Actualizar modelo
                $model->update(['sketchfab_id' => $sketchfabId]);
                
                $this->info("   ✅ Encontrado: {$sketchfabName}");
                $this->info("   ID: {$sketchfabId}");
                $updated++;

                // Rate limiting: esperar un poco entre requests
                sleep(1);

            } catch (\Exception $e) {
                $this->error("   ❌ Error: {$e->getMessage()}");
                $failed++;
            }
        }

        $this->info("\n=== RESULTADO ===" );
        $this->info("✅ Actualizados: $updated");
        $this->info("❌ Fallidos: $failed");
        $this->info("📊 Total: {$models->count()}");

        return 0;
    }
}
