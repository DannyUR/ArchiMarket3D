<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Model3D;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class GenerateModelPreviews extends Command
{
    protected $signature = 'models:generate-previews';
    protected $description = 'Generar previews PNG usando Sketchfab API';

    public function handle()
    {
        $this->info('🎨 Iniciando generación de previews...\n');
        
        // Obtener API token de Sketchfab
        $apiToken = config('services.sketchfab.api_key');
        if (!$apiToken) {
            $this->error('❌ Error: SKETCHFAB_API_KEY no configurado');
            $this->info('Configura tu token en .env:');
            $this->info('SKETCHFAB_API_KEY=tu_token_aqui');
            return 1;
        }

        // Obtener modelos que tengan sketchfab_id pero sin PNG
        $models = Model3D::whereNotNull('sketchfab_id')
            ->get();

        if ($models->isEmpty()) {
            $this->warn('ℹ️  No hay modelos para procesar');
            return 0;
        }

        $this->info("📦 Procesando {$models->count()} modelos...\n");

        foreach ($models as $model) {
            $this->line("📍 Modelo {$model->id}: {$model->name}");
            
            try {
                // Obtener información del modelo desde Sketchfab
                $response = Http::withToken($apiToken)
                    ->timeout(10)
                    ->get("https://api.sketchfab.com/v3/models/{$model->sketchfab_id}/");

                if (!$response->successful()) {
                    $this->error("   ❌ No se pudo acceder a Sketchfab");
                    continue;
                }

                $data = $response->json();

                // Obtener URL de preview
                $thumbnailUrl = null;
                if (isset($data['thumbnails']['images'])) {
                    // Obtener la imagen más grande disponible
                    $images = $data['thumbnails']['images'];
                    if (!empty($images)) {
                        // Tomar la última (usualmente la más grande)
                        $thumbnailUrl = end($images)['url'] ?? null;
                    }
                }

                if (!$thumbnailUrl) {
                    $this->warn("   ⚠️  No hay thumbnail disponible");
                    continue;
                }

                // Descargar la imagen
                $imageResponse = Http::timeout(15)->get($thumbnailUrl);
                if (!$imageResponse->successful()) {
                    $this->error("   ❌ Error descargando imagen");
                    continue;
                }

                // Guardar como PNG en storage
                $filename = "preview.png";
                $path = "models/{$model->id}";
                
                Storage::disk('public')->put(
                    "{$path}/{$filename}",
                    $imageResponse->body()
                );

                $this->line("   ✅ Preview descargado exitosamente");

            } catch (\Exception $e) {
                $this->error("   ❌ Error: " . $e->getMessage());
            }
        }

        $this->info("\n✨ ¡Proceso completado!");
        $this->info('💡 Ejecuta el comando regularmente para actualizar mas modelos');

        return 0;
    }
}
