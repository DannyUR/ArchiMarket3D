<?php

namespace App\Console\Commands;

use App\Models\Model3D;
use App\Models\ModelFile;
use App\Services\SketchfabService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

class DownloadRealModelsFixed extends Command
{
    protected $signature = 'models:download-real-fixed {--format=glb : Formato a descargar (glb, obj, fbx, usdz)} {--all-formats : Descargar todos los formatos disponibles}';
    protected $description = 'Descarga los archivos 3D reales desde Sketchfab (mejorado)';

    protected $sketchfabService;
    protected $supportedFormats = ['glb', 'gltf', 'obj', 'fbx', 'usdz'];

    public function __construct(SketchfabService $sketchfabService)
    {
        parent::__construct();
        $this->sketchfabService = $sketchfabService;
    }

    public function handle()
    {
        $this->info('🔄 Iniciando descarga MEJORADA de modelos reales desde Sketchfab...');
        
        $downloadAllFormats = $this->option('all-formats');
        $preferredFormat = strtolower($this->option('format'));

        // Obtener modelos que tienen sketchfab_id
        $models = Model3D::whereNotNull('sketchfab_id')
            ->get();

        if ($models->isEmpty()) {
            $this->info('✅ No hay modelos con sketchfab_id');
            return 0;
        }

        $this->info("📊 Se encontraron {$models->count()} modelos para procesar");
        
        $bar = $this->output->createProgressBar($models->count());
        $successCount = 0;
        $failureCount = 0;
        
        foreach ($models as $model) {
            $this->newLine();
            $this->info("📦 Procesando: {$model->name} (ID: {$model->id}, Sketchfab: {$model->sketchfab_id})");
            
            try {
                // Obtener URLs de descarga desde Sketchfab
                $this->line("   📡 Obteniendo URLs de descarga...");
                $downloadInfo = $this->sketchfabService->getDownloadUrls($model->sketchfab_id);
                
                if (!$downloadInfo) {
                    $this->warn("   ⚠️ No se pudo obtener URLs (verifica el token API de Sketchfab)");
                    $failureCount++;
                    $bar->advance();
                    continue;
                }

                $this->line("   ✓ URLs obtenidas. Formatos disponibles: " . implode(', ', array_keys($downloadInfo)));

                $formatsToDownload = $downloadAllFormats 
                    ? array_keys($downloadInfo)
                    : [$preferredFormat];

                $downloadsCount = 0;

                foreach ($formatsToDownload as $format) {
                    if (!isset($downloadInfo[$format]) || empty($downloadInfo[$format]['url'])) {
                        $this->line("   ⏭️  Formato {$format} no disponible");
                        continue;
                    }

                    // Verificar si ya existe este formato
                    $exists = ModelFile::where('model_id', $model->id)
                        ->where('file_type', 'download')
                        ->where('format', strtoupper($format))
                        ->exists();

                    if ($exists) {
                        $this->line("   ⏭️  Formato {$format} ya existe");
                        continue;
                    }

                    $this->line("   📥 Descargando formato: {$format}...");

                    try {
                        $result = $this->downloadFile(
                            $downloadInfo[$format]['url'],
                            $model->id,
                            $model->name,
                            $format
                        );

                        if ($result['success']) {
                            // Guardar en la base de datos
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
                            $this->line("   ✅ {$format} descargado: {$sizeMb} MB");
                            $downloadsCount++;
                        } else {
                            $this->warn("   ❌ Error descargando {$format}: {$result['error']}");
                        }
                        
                        // Pausa entre descargas
                        sleep(1);

                    } catch (\Exception $e) {
                        $this->error("   ❌ Excepción en {$format}: " . $e->getMessage());
                    }
                }

                if ($downloadsCount > 0) {
                    $this->info("   ✅ Modelo procesado: {$downloadsCount} archivo(s) descargado(s)");
                    $successCount++;
                } else {
                    $this->warn("   ⚠️ No se descargó ningún archivo");
                    $failureCount++;
                }

            } catch (\Exception $e) {
                $this->error("   ❌ Error fatal: " . $e->getMessage());
                $failureCount++;
            }
            
            $bar->advance();
            sleep(2); // Pausa entre modelos
        }
        
        $bar->finish();
        $this->newLine(2);
        
        $this->info("✅ Descarga completada");
        $this->info("   ✅ Éxito: {$successCount}");
        $this->info("   ❌ Fallos: {$failureCount}");
        
        return 0;
    }

    /**
     * Descargar un archivo individual
     */
    private function downloadFile($downloadUrl, $modelId, $modelName, $format)
    {
        try {
            $this->line("      🔗 Descargando desde: " . substr($downloadUrl, 0, 60) . "...");

            // Crear carpeta si no existe
            $folderPath = "models/{$modelId}";
            Storage::disk('public')->makeDirectory($folderPath);

            // Limpiar nombre del archivo
            $sanitizedName = preg_replace('/[^a-z0-9-_\.]/i', '_', strtolower($modelName));
            $fileName = "{$sanitizedName}.{$format}";
            $filePath = "{$folderPath}/{$fileName}";
            $fullPath = storage_path("app/public/{$filePath}");

            // Usar file_get_contents con stream context para archivos grandes
            $context = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'header' => [
                        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept: */*',
                    ],
                    'timeout' => 300  // 5 minutos
                ]
            ]);

            // Descargar con indicador de progreso
            $this->line("      ⏳ Descargando archivo...");
            $fileContent = @file_get_contents($downloadUrl, false, $context);

            if ($fileContent === false) {
                return [
                    'success' => false,
                    'error' => 'Error descargando el archivo (posible timeout o archivo muy grande)'
                ];
            }

            $fileSize = strlen($fileContent);

            if ($fileSize === 0) {
                return [
                    'success' => false,
                    'error' => 'Archivo vacío o inválido'
                ];
            }

            // Guardar archivo en disco
            if (file_put_contents($fullPath, $fileContent) === false) {
                return [
                    'success' => false,
                    'error' => 'No se pudo guardar el archivo en disco'
                ];
            }

            // Liberar memoria
            unset($fileContent);

            // Verificar que se guardó
            if (!file_exists($fullPath)) {
                return [
                    'success' => false,
                    'error' => 'No se pudo guardar el archivo'
                ];
            }

            return [
                'success' => true,
                'file_url' => '/storage/' . $filePath,
                'original_name' => $fileName,
                'size_bytes' => $fileSize
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Sanitizar nombre de archivo
     */
    private function sanitizeFilename($name)
    {
        return preg_replace('/[^a-z0-9-_\.]/i', '_', strtolower($name));
    }
}
