<?php

namespace App\Console\Commands;

use App\Models\Model3D;
use App\Models\ModelFile;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class DownloadFromMetadataUrls extends Command
{
    protected $signature = 'models:download-metadata-urls {--format=glb} {--limit=50}';
    protected $description = 'Descarga archivos directamente desde las URLs guardadas en metadata';

    public function handle()
    {
        $format = strtolower($this->option('format'));
        $limit = (int)$this->option('limit');
        
        $this->info("🔄 Buscando modelos con URLs en metadata para {$format}...");
        
        // Traer modelos que NO tienen archivos pero SÍ tienen metadata con URLs
        $models = Model3D::whereNotNull('sketchfab_id')
            ->whereDoesntHave('files', function($q) {
                $q->where('file_type', 'download');
            })
            ->limit($limit)
            ->get();

        $this->info("📊 Se procesarán " . $models->count() . " modelos");
        
        if ($models->isEmpty()) {
            $this->warn('⚠️ No hay modelos para descargar');
            return 0;
        }

        $bar = $this->output->createProgressBar($models->count());
        $downloaded = 0;
        $failed = 0;
        
        foreach ($models as $model) {
            try {
                $metadata = json_decode(json_encode($model->metadata), true) ?? [];
                $urls = $metadata['download_urls'] ?? [];
                
                // Buscar URL para el formato solicitado
                $url = null;
                if (isset($urls[$format])) {
                    $url = $urls[$format];
                } elseif (isset($urls['glb'])) {
                    $url = $urls['glb'];
                    $format = 'glb';
                } elseif (isset($urls['gltf'])) {
                    $url = $urls['gltf'];
                    $format = 'gltf';
                }
                
                if (!$url) {
                    $bar->advance();
                    $failed++;
                    continue;
                }

                // Descargar con timeout
                $response = Http::timeout(120)->get($url);
                
                if (!$response->successful()) {
                    $bar->advance();
                    $failed++;
                    continue;
                }
                
                // Guardar archivo
                $safeFileName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $model->name);
                $fileName = 'models/' . $model->id . '/' . $safeFileName . '.' . $format;
                
                Storage::disk('public')->put($fileName, $response->body());
                
                // Guardar en BD
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
                // Continuar silenciosamente
                $failed++;
            }
            
            $bar->advance();
            sleep(1); // Rate limit
        }
        
        $bar->finish();
        $this->newLine();
        $this->info("✅ Descargados: {$downloaded}");
        $this->warn("❌ Fallidos: {$failed}");
        
        return 0;
    }
}
