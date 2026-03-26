<?php

namespace App\Console\Commands;

use App\Models\Model3D;
use App\Models\ModelFile;
use App\Services\SketchfabService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

class DownloadRealModels extends Command
{
    protected $signature = 'models:download-real';
    protected $description = 'Descarga los archivos 3D reales desde Sketchfab';

    protected $sketchfabService;

    public function __construct(SketchfabService $sketchfabService)
    {
        parent::__construct();
        $this->sketchfabService = $sketchfabService;
    }

    public function handle()
    {
        $this->info('🔄 Iniciando descarga de modelos reales desde Sketchfab...');
        
        // Modelos que tienen sketchfab_id pero no tienen archivos reales
        $models = Model3D::whereNotNull('sketchfab_id')
            ->whereDoesntHave('files', function($q) {
                $q->where('file_type', 'download');
            })
            ->get();

        if ($models->isEmpty()) {
            $this->info('✅ Todos los modelos ya tienen archivos descargados');
            return 0;
        }

        $this->info("📊 Se encontraron {$models->count()} modelos para descargar");
        
        $bar = $this->output->createProgressBar($models->count());
        
        foreach ($models as $model) {
            $this->newLine();
            $this->info("📦 Procesando: {$model->name} (ID: {$model->id})");
            
            try {
                // Obtener URLs de descarga
                $downloadInfo = $this->sketchfabService->getDownloadUrls($model->sketchfab_id);
                
                if (!$downloadInfo || !isset($downloadInfo['gltf'])) {
                    $this->warn("   ⚠️ No hay URLs de descarga disponibles");
                    $bar->advance();
                    continue;
                }

                // Intentar descargar varios formatos
                $formats = ['gltf', 'obj', 'fbx', 'usdz'];
                $downloaded = 0;

                foreach ($formats as $format) {
                    if (isset($downloadInfo[$format]['url'])) {
                        $this->line("   📥 Descargando formato: {$format}");
                        
                        $result = $this->sketchfabService->downloadModelFile($downloadInfo[$format]['url']);
                        
                        if ($result['success']) {
                            $fileName = 'models/' . $model->id . '/' . 
                                        $this->sanitizeFilename($model->name) . '.' . $format;
                            
                            Storage::disk('public')->put($fileName, $result['data']);
                            
                            ModelFile::updateOrCreate(
                                [
                                    'model_id' => $model->id,
                                    'format' => strtoupper($format),
                                    'file_type' => 'download'
                                ],
                                [
                                    'file_url' => '/storage/' . $fileName,
                                    'original_name' => basename($fileName),
                                    'size_bytes' => $result['size'] ?? strlen($result['data'])
                                ]
                            );
                            
                            $this->line("   ✅ {$format} descargado correctamente");
                            $downloaded++;
                        } else {
                            $this->warn("   ⚠️ Error descargando {$format}");
                        }
                        
                        // Pequeña pausa entre descargas
                        sleep(1);
                    }
                }

                if ($downloaded > 0) {
                    $this->info("   ✅ Modelo procesado: {$downloaded} archivos descargados");
                } else {
                    $this->warn("   ⚠️ No se pudo descargar ningún archivo");
                }

            } catch (\Exception $e) {
                $this->error("   ❌ Error: " . $e->getMessage());
            }
            
            $bar->advance();
            sleep(2); // Pausa entre modelos para no saturar la API
        }
        
        $bar->finish();
        $this->newLine(2);
        $this->info('✅ Descarga completada');
        
        return 0;
    }

    private function sanitizeFilename($name)
    {
        return preg_replace('/[^a-z0-9]+/i', '_', strtolower($name));
    }
}