<?php

namespace App\Console\Commands;

use App\Models\Model3D;
use App\Models\ModelFile;
use Illuminate\Console\Command;

class RegisterDownloadedFilesFixed extends Command
{
    protected $signature = 'models:register-downloads {--limit=100}';
    protected $description = 'Registra archivos GLB en la BD basándose en lo que existe en disk';

    public function handle()
    {
        $limit = (int)$this->option('limit');
        $this->info('🔄 Registrando archivos descargados...');
        
        // Buscar todas las carpetas de modelos
        $modelsPath = 'C:\\Users\\Danny\\Documents\\GitHub\\ArchiMarket3D\\archi-api\\storage\\app\\public\\models';
        
        if (!is_dir($modelsPath)) {
            $this->error('❌ Ruta no encontrada: ' . $modelsPath);
            return 1;
        }
        
        $dirs = scandir($modelsPath);
        $modelIds = array_filter($dirs, fn($item) => is_numeric($item) && is_dir($modelsPath . '\\' . $item));
        
        $bar = $this->output->createProgressBar(min(count($modelIds), $limit));
        $registered = 0;
        $attempted = 0;
        
        foreach (array_slice(array_values($modelIds), 0, $limit) as $modelId) {
            $modelPath = $modelsPath . '\\' . $modelId;
            
            // Buscar archivos GLB
            $glbFiles = glob($modelPath . '\\*.glb');
            
            foreach ($glbFiles as $filePath) {
                $fileSize = filesize($filePath);
                
                // Solo registrar archivos > 1MB (archivos reales)
                if ($fileSize > 1024 * 1024) {
                    $fileName = basename($filePath);
                    $fileUrl = '/storage/models/' . $modelId . '/' . $fileName;
                    
                    ModelFile::updateOrCreate(
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
                    
                    $registered++;
                    $attempted++;
                }
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info("✅ Registrados: {$registered}");
        
        return 0;
    }
}
