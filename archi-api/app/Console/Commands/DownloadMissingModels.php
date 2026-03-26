<?php

namespace App\Console\Commands;

use App\Models\Model3D;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class DownloadMissingModels extends Command
{
    protected $signature = 'models:download-missing {--format=glb}';
    protected $description = 'Descarga modelos que tienen URLs pero no tienen archivos descargados';

    public function handle()
    {
        $format = $this->option('format');
        $this->info("🔄 Buscando modelos sin descargas pero con URLs en metadata...");
        
        // Modelos que tienen sketchfab_id pero NO tienen archivos descargados
        $modelsNeedingDownload = Model3D::whereNotNull('sketchfab_id')
            ->whereDoesntHave('files', function($q) {
                $q->where('file_type', 'download');
            })
            ->whereJsonContains('metadata->download_urls->' . $format, true)
            ->orWhereRaw("JSON_EXTRACT(metadata, '$.download_urls." . $format . "') IS NOT NULL")
            ->get();

        $this->info("📊 Se encontraron " . $modelsNeedingDownload->count() . " modelos para descargar");
        
        if ($modelsNeedingDownload->isEmpty()) {
            $this->warn('⚠️  No hay modelos para descargar con URLs disponibles');
            return 0;
        }

        $bar = $this->output->createProgressBar($modelsNeedingDownload->count());
        $downloaded = 0;
        
        foreach ($modelsNeedingDownload as $model) {
            try {
                $metadata = $model->metadata ?? [];
                $downloadUrls = $metadata['download_urls'] ?? [];
                $url = $downloadUrls[$format] ?? null;
                
                if (!$url) {
                    $bar->advance();
                    continue;
                }

                // Descargar archivo
                $response = Http::get($url);
                
                if ($response->successful()) {
                    $fileName = 'models/' . $model->id . '/' . 
                                sanitize_filename($model->name) . '.' . $format;
                    
                    Storage::disk('public')->put($fileName, $response->body());
                    
                    // Registrar en BD
                    \App\Models\ModelFile::updateOrCreate(
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
                }
            } catch (\Exception $e) {
                // Continuar con siguiente modelo
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info("✅ Completado: {$downloaded} modelos descargados");
        
        return 0;
    }
}

function sanitize_filename($filename) {
    return preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename);
}
