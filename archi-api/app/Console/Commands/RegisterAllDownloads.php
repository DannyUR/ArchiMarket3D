<?php

namespace App\Console\Commands;

use App\Models\Model3D;
use App\Models\ModelFile;
use Illuminate\Console\Command;

class RegisterAllDownloads extends Command
{
    protected $signature = 'models:register-all-downloads';
    protected $description = 'Registra TODOS los archivos GLB que existen en disk en la BD';

    public function handle()
    {
        $this->info('🔍 Buscando todos los archivos GLB en disk...');
        
        $modelsPath = storage_path('app/public/models');
        $registered = 0;
        $skipped = 0;
        
        // Obtener SOLO los IDs de modelos que existen en BD
        $validModelIds = Model3D::pluck('id')->toArray();
        
        $this->info("📂 Registrando archivos para " . count($validModelIds) . " modelos válidos");
        
        $bar = $this->output->createProgressBar(count($validModelIds));
        
        foreach ($validModelIds as $modelId) {
            $modelPath = $modelsPath . '/' . $modelId;
            $glbFiles = glob($modelPath . '/*.glb');
            
            // Filtrar solo archivos > 1MB (reales)
            $realFiles = array_filter($glbFiles, fn($f) => filesize($f) > 1024 * 1024);
            
            foreach ($realFiles as $filePath) {
                $fileSize = filesize($filePath);
                $fileName = basename($filePath);
                $fileUrl = '/storage/models/' . $modelId . '/' . $fileName;
                
                // Registrar o actualizar
                $result = ModelFile::updateOrCreate(
                    [
                        'model_id' => (int)$modelId,
                        'format' => 'GLB',
                        'file_type' => 'download'
                    ],
                    [
                        'file_url' => $fileUrl,
                        'original_name' => $fileName,
                        'size_bytes' => $fileSize
                    ]
                );
                
                if ($result->wasRecentlyCreated || $result->wasChanged()) {
                    $registered++;
                }
            }
            
            if (empty($realFiles)) {
                $skipped++;
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info("✅ Registrados: $registered");
        $this->warn("⏭️  Omitidos: $skipped");
        
        return 0;
    }
}
