<?php

namespace App\Console\Commands;

use App\Models\Model3D;
use App\Models\ModelFile;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class DownloadMultipleFormats extends Command
{
    protected $signature = 'models:download-multi-formats {--formats=glb,gltf,obj} {--limit=50}';
    protected $description = 'Descarga múltiples formatos de modelos en paralelo';

    public function handle()
    {
        $formats = explode(',', str_replace(' ', '', $this->option('formats')));
        $limit = (int)$this->option('limit');
        
        $this->info('🔄 Descargando múltiples formatos: ' . implode(', ', $formats));
        
        // Buscar modelos sin descargas
        $models = Model3D::whereNotNull('sketchfab_id')
            ->whereDoesntHave('files', function($q) {
                $q->where('file_type', 'download');
            })
            ->limit($limit)
            ->get();

        if ($models->isEmpty()) {
            $this->warn('⚠️ Todos los modelos ya tienen descargas');
            return 0;
        }

        $this->info("📊 Procesando {$models->count()} modelos");
        
        $bar = $this->output->createProgressBar($models->count());
        $downloaded = 0;

        foreach ($models as $model) {
            try {
                $metadata = json_decode(json_encode($model->metadata), true) ?? [];
                $urls = $metadata['download_urls'] ?? [];
                
                // Intentar descargar en todos los formatos solicitados
                foreach ($formats as $format) {
                    $format = strtolower(trim($format));
                    
                    if (!isset($urls[$format])) {
                        continue; // Formato no disponible para este modelo
                    }
                    
                    try {
                        $response = Http::timeout(120)->get($urls[$format]);
                        
                        if (!$response->successful()) {
                            continue;
                        }
                        
                        // Guardar archivo
                        $safeFileName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $model->name);
                        $fileName = 'models/' . $model->id . '/' . $safeFileName . '.' . $format;
                        
                        Storage::disk('public')->put($fileName, $response->body());
                        
                        // Registrar en BD
                        ModelFile::updateOrCreate(
                            [
                                'model_id' => $model->id,
                                'format' => strtoupper($format),
                                'file_type' => 'download'
                            ],
                            [
                                'file_url' => '/storage/' . $fileName,
                                'original_name' => basename($fileName),
                                'size_bytes' => strlen($response->body())
                            ]
                        );
                        
                        $downloaded++;
                        
                    } catch (\Exception $e) {
                        // Continuar con siguiente formato
                    }
                    
                    sleep(1); // Rate limit
                }
                
            } catch (\Exception $e) {
                // Continuar con siguiente modelo
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info("✅ Archivos descargados: {$downloaded}");
        
        return 0;
    }
}
