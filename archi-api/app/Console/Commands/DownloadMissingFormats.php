<?php

namespace App\Console\Commands;

use App\Models\Model3D;
use App\Models\ModelFile;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class DownloadMissingFormats extends Command
{
    protected $signature = 'models:download-missing-formats {--format=obj} {--limit=50}';
    protected $description = 'Descarga formatos faltantes para modelos que ya tienen GLB';

    public function handle()
    {
        $format = strtolower($this->option('format'));
        $limit = (int)$this->option('limit');
        
        $this->info("🔄 Descargando formatos {$format} para modelos que YA tienen GLB...");
        
        // Buscar modelos que YA tienen GLB pero NO el formato solicitado
        $models = Model3D::whereHas('files', function($q) {
            $q->where('file_type', 'download')->where('format', 'GLB');
        })
        ->whereDoesntHave('files', function($q) use ($format) {
            $q->where('file_type', 'download')->where('format', strtoupper($format));
        })
        ->limit($limit)
        ->get();

        if ($models->isEmpty()) {
            $this->warn("⚠️ No hay modelos para descargar en formato {$format}");
            return 0;
        }

        $this->info("📊 Se procesarán {$models->count()} modelos");
        
        $bar = $this->output->createProgressBar($models->count());
        $downloaded = 0;
        $failed = 0;

        foreach ($models as $model) {
            try {
                $metadata = json_decode(json_encode($model->metadata), true) ?? [];
                $urls = $metadata['download_urls'] ?? [];
                
                if (!isset($urls[$format])) {
                    $failed++;
                    $bar->advance();
                    continue;
                }
                
                try {
                    $response = Http::timeout(120)->get($urls[$format]);
                    
                    if (!$response->successful()) {
                        $failed++;
                        $bar->advance();
                        continue;
                    }
                    
                    $safeFileName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $model->name);
                    $fileName = 'models/' . $model->id . '/' . $safeFileName . '_' . $format . '.' . $format;
                    
                    Storage::disk('public')->put($fileName, $response->body());
                    
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
                    $failed++;
                }
                
                sleep(1);
                
            } catch (\Exception $e) {
                $failed++;
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info("✅ Descargados: {$downloaded}");
        $this->warn("❌ Fallidos: {$failed}");
        
        return 0;
    }
}
