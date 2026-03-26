<?php

namespace App\Console\Commands;

use App\Models\Model3D;
use App\Models\ModelFile;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class DownloadFromMetadata extends Command
{
    protected $signature = 'models:download-from-metadata';
    protected $description = 'Descarga archivos 3D usando las URLs guardadas en metadata';

    public function handle()
    {
        $this->info('🔄 Iniciando descarga desde metadata...');
        
        $models = Model3D::whereNotNull('sketchfab_id')->get();
        $total = 0;
        $totalModels = 0;

        foreach ($models as $model) {
            $metadata = json_decode($model->metadata, true);
            
            // Buscar en diferentes posibles ubicaciones de las URLs
            $archives = [];
            
            if (isset($metadata['archives'])) {
                $archives = $metadata['archives'];
                $this->line("📦 Procesando: {$model->name} (ID: {$model->id}) - Usando 'archives'");
            } elseif (isset($metadata['download_urls'])) {
                $archives = $metadata['download_urls'];
                $this->line("📦 Procesando: {$model->name} (ID: {$model->id}) - Usando 'download_urls'");
            } else {
                $this->warn("   ⚠️ No hay información de archivos en metadata");
                continue;
            }

            if (empty($archives)) {
                $this->warn("   ⚠️ Archives vacío");
                continue;
            }

            $modelHasFiles = false;

            foreach ($archives as $format => $info) {
                // Verificar diferentes estructuras posibles
                $downloadUrl = null;
                $fileSize = null;
                
                if (is_array($info) && isset($info['url'])) {
                    $downloadUrl = $info['url'];
                    $fileSize = $info['size'] ?? null;
                } elseif (is_string($info)) {
                    // Caso donde directamente es la URL
                    $downloadUrl = $info;
                }

                if (!$downloadUrl) {
                    $this->warn("   ⚠️ No hay URL para {$format}");
                    continue;
                }

                // Verificar si ya tenemos este formato
                $exists = ModelFile::where('model_id', $model->id)
                    ->where('format', strtoupper($format))
                    ->where('file_type', 'download')
                    ->exists();

                if ($exists) {
                    $this->line("   ⏭️  {$format} ya existe");
                    $modelHasFiles = true;
                    continue;
                }

                $this->line("   📥 Descargando {$format}...");

                try {
                    $response = Http::withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    ])->timeout(300)->get($downloadUrl); // Timeout de 5 minutos para archivos grandes

                    if (!$response->successful()) {
                        $this->warn("      ⚠️ Error HTTP: " . $response->status());
                        continue;
                    }

                    // Crear directorio
                    $directory = 'models/' . $model->id;
                    Storage::disk('public')->makeDirectory($directory);

                    // Nombre del archivo
                    $fileName = $this->sanitizeFilename($model->name) . '.' . $format;
                    $filePath = $directory . '/' . $fileName;

                    // Guardar archivo
                    Storage::disk('public')->put($filePath, $response->body());

                    // Obtener tamaño real
                    $actualSize = strlen($response->body());

                    // Guardar registro
                    ModelFile::create([
                        'model_id' => $model->id,
                        'file_url' => '/storage/' . $filePath,
                        'file_type' => 'download',
                        'format' => strtoupper($format),
                        'original_name' => $fileName,
                        'size_bytes' => $actualSize,
                        'origin' => 'sketchfab'
                    ]);

                    $sizeMB = round($actualSize / 1024 / 1024, 2);
                    $this->line("      ✅ {$format} descargado ({$sizeMB} MB)");
                    $total++;
                    $modelHasFiles = true;

                } catch (\Exception $e) {
                    $this->warn("      ⚠️ Error: " . $e->getMessage());
                }
            }

            if ($modelHasFiles) {
                $totalModels++;
            }
        }

        $this->newLine();
        $this->info("✅ Proceso completado.");
        $this->table(
            ['Archivos descargados', 'Modelos procesados'],
            [[$total, $totalModels]]
        );

        return 0;
    }

    private function sanitizeFilename($name)
    {
        $name = preg_replace('/[^a-zA-Z0-9]/', '_', $name);
        return substr($name, 0, 50);
    }
}