<?php

namespace App\Console\Commands;

use App\Models\Model3D;
use App\Services\SketchfabService;
use Illuminate\Console\Command;

class FetchSketchfabDownloadUrls extends Command
{
    protected $signature = 'sketchfab:fetch-download-urls';
    protected $description = 'Obtiene las URLs de descarga de Sketchfab y actualiza el metadata';

    private $sketchfabService;

    public function __construct(SketchfabService $sketchfabService)
    {
        parent::__construct();
        $this->sketchfabService = $sketchfabService;
    }

    public function handle()
    {
        $this->info('🔄 Obteniendo URLs de descarga de Sketchfab...');
        
        $models = Model3D::whereNotNull('sketchfab_id')->get();
        $bar = $this->output->createProgressBar(count($models));
        
        $updated = 0;
        
        foreach ($models as $model) {
            $this->newLine();
            $this->line("📦 Procesando: {$model->name}");
            
            try {
                // Obtener detalles completos del modelo
                $details = $this->sketchfabService->getModelDetails($model->sketchfab_id);
                
                if (!$details) {
                    $this->warn("   ⚠️ No se pudieron obtener detalles");
                    $bar->advance();
                    continue;
                }

                // Obtener URLs de descarga
                $downloadUrls = $this->sketchfabService->getDownloadUrls($model->sketchfab_id);
                
                // Decodificar metadata actual
                $metadata = json_decode($model->metadata, true) ?? [];
                
                // Agregar archives al metadata
                $metadata['archives'] = $downloadUrls ?? [];
                
                // Si no hay downloadUrls pero hay archives en details, usarlos
                if (empty($metadata['archives']) && isset($details['archives'])) {
                    $metadata['archives'] = $details['archives'];
                }
                
                // Guardar metadata actualizada
                $model->metadata = json_encode($metadata);
                $model->save();
                
                if (!empty($metadata['archives'])) {
                    $this->info("   ✅ URLs obtenidas para " . count($metadata['archives']) . " formatos");
                    $updated++;
                } else {
                    $this->warn("   ⚠️ No hay URLs de descarga disponibles");
                }
                
            } catch (\Exception $e) {
                $this->error("   ❌ Error: " . $e->getMessage());
            }
            
            $bar->advance();
            sleep(1); // Pausa para no saturar la API
        }
        
        $bar->finish();
        $this->newLine(2);
        $this->info("✅ Proceso completado. {$updated} modelos actualizados.");
        
        return 0;
    }
}