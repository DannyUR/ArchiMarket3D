<?php

namespace App\Console\Commands;

use App\Models\Model3D;
use App\Models\ModelFile;
use App\Services\SketchfabService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class DownloadModelsOneByOne extends Command
{
    protected $signature = 'models:download-light {--format=glb : Formato a descargar} {--limit=10 : Cantidad de modelos a procesar}';
    protected $description = 'Descarga modelos usando menos memoria (apto para servidores limitados)';

    protected $sketchfabService;

    public function __construct(SketchfabService $sketchfabService)
    {
        parent::__construct();
        $this->sketchfabService = $sketchfabService;
    }

    public function handle()
    {
        $this->info('🔄 Iniciando descarga LIGERA de modelos...');
        
        $format = strtolower($this->option('format'));
        $limit = (int)$this->option('limit');

        // Obtener solo los modelos sin ese formato
        $models = Model3D::whereNotNull('sketchfab_id')
            ->whereDoesntHave('files', function($q) use ($format) {
                $q->where('file_type', 'download')
                  ->where('format', strtoupper($format));
            })
            ->limit($limit)
            ->get();

        if ($models->isEmpty()) {
            $this->info('✅ No hay modelos nuevos para descargar');
            return 0;
        }

        $this->info("📊 Se procesarán {$models->count()} modelos (máximo {$limit})");
        
        $bar = $this->output->createProgressBar($models->count());
        $successCount = 0;
        
        foreach ($models as $model) {
            try {
                $this->info("\n📦 {$model->name} (ID: {$model->id})");

                $downloadInfo = $this->sketchfabService->getDownloadUrls($model->sketchfab_id);
                
                if (!$downloadInfo || !isset($downloadInfo[$format])) {
                    $this->line("   ⏭️  Formato no disponible");
                    $bar->advance();
                    continue;
                }

                if (!isset($downloadInfo[$format]['url'])) {
                    $this->line("   ⏭️  Sin URL de descarga");
                    $bar->advance();
                    continue;
                }

                $this->line("   📥 Descargando {$format}...");

                $result = $this->downloadFileSmall(
                    $downloadInfo[$format]['url'],
                    $model->id,
                    $model->name,
                    $format
                );

                if ($result['success']) {
                    ModelFile::updateOrCreate(
                        [
                            'model_id' => $model->id,
                            'format' => strtoupper($format),
                            'file_type' => 'download'
                        ],
                        [
                            'file_url' => $result['file_url'],
                            'original_name' => $result['original_name'],
                            'size_bytes' => $result['size_bytes'],
                            'origin' => 'sketchfab'
                        ]
                    );

                    $sizeMb = round($result['size_bytes'] / 1024 / 1024, 2);
                    $this->line("   ✅ Descargado: {$sizeMb} MB");
                    $successCount++;
                } else {
                    $this->warn("   ❌ Error: {$result['error']}");
                }

                // Liberar memoria
                gc_collect_cycles();
                sleep(2);

            } catch (\Exception $e) {
                $this->error("   ❌ {$e->getMessage()}");
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine(2);
        $this->info("✅ Descarga completada: {$successCount} modelos");
        
        return 0;
    }

    private function downloadFileSmall($url, $modelId, $modelName, $format)
    {
        try {
            // Crear carpeta
            $folderPath = storage_path("app/public/models/{$modelId}");
            if (!is_dir($folderPath)) {
                mkdir($folderPath, 0755, true);
            }

            $sanitizedName = preg_replace('/[^a-z0-9-_]/i', '_', strtolower($modelName));
            $fileName = "{$sanitizedName}.{$format}";
            $fullPath = "{$folderPath}/{$fileName}";

            $this->line("      🔗 URL: " . substr($url, 0, 50) . "...");

            // Descargar usando fopen + fread para mejor control de memoria
            $context = stream_context_create([
                'http' => [
                    'timeout' => 300,
                    'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\n"
                ]
            ]);

            $handle = fopen($url, 'r', false, $context);
            if (!$handle) {
                return ['success' => false, 'error' => 'No se pudo abrir la URL'];
            }

            // Escribir leer en chunks de 1MB para no llenar memoria
            $outHandle = fopen($fullPath, 'w');
            if (!$outHandle) {
                fclose($handle);
                return ['success' => false, 'error' => 'No se pudo crear archivo'];
            }

            $totalSize = 0;
            while (!feof($handle)) {
                $chunk = fread($handle, 1024 * 1024); // 1MB a la vez
                if ($chunk === false) {
                    break;
                }
                fwrite($outHandle, $chunk);
                $totalSize += strlen($chunk);
            }

            fclose($handle);
            fclose($outHandle);

            if ($totalSize === 0) {
                @unlink($fullPath);
                return ['success' => false, 'error' => 'Archivo vacío'];
            }

            return [
                'success' => true,
                'file_url' => '/storage/models/' . $modelId . '/' . $fileName,
                'original_name' => $fileName,
                'size_bytes' => $totalSize
            ];

        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
