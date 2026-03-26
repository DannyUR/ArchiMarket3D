<?php

namespace App\Console\Commands;

use App\Models\Model3D;
use App\Models\ModelFile;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class RegisterDownloadedFiles extends Command
{
    protected $signature = 'models:register-downloaded-files {--limit=100}';
    protected $description = 'Registra los archivos GLB existentes en storage en la BD';

    public function handle()
    {
        $limit = (int)$this->option('limit');
        $this->info('🔄 Registrando archivos descargados en la BD...');
        
        $modelsPath = storage_path('app/public/models');
        $modelDirs = array_filter(
            scandir($modelsPath),
            fn($item) => is_dir($modelsPath . '/' . $item) && is_numeric($item)
        );

        $bar = $this->output->createProgressBar(min(count($modelDirs), $limit));
        $registered = 0;
        $skipped = 0;
        
        $count = 0;
        foreach ($modelDirs as $modelId) {
            if ($count++ >= $limit) break;
            
            $modelPath = $modelsPath . '/' . $modelId;
            $glbFiles = glob($modelPath . '/*.glb');
            
            // Filtrar solo archivos reales (> 1MB)
            $realFiles = array_filter($glbFiles, fn($f) => filesize($f) > 1024 * 1024);
            
            if (!empty($realFiles)) {
                $model = Model3D::find($modelId);
                if ($model) {
                    foreach ($realFiles as $filePath) {
                        $fileName = basename($filePath);
                        $fileUrl = '/storage/models/' . $modelId . '/' . $fileName;
                        $fileSize = filesize($filePath);
                        
                        ModelFile::updateOrCreate(
                            [
                                'model_id' => $modelId,
                                'format' => 'GLB',
                                'file_type' => 'download'
                            ],
                            [
                                'file_url' => $fileUrl,
                                'original_name' => $fileName,
                                'size_bytes' => $fileSize
                            ]
                        );
                        
                        $registered++;
                    }
                } else {
                    $skipped++;
                }
            } else {
                $skipped++;
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info("✅ Registrados: {$registered}");
        $this->warn("⏭️  Omitidos: {$skipped}");
        
        return 0;
    }
}
