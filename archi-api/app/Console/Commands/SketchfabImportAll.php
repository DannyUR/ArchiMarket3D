<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Model3d;
use App\Models\ModelFile;
use App\Services\SketchfabService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class SketchfabImportAll extends Command
{
    protected $signature = 'sketchfab:import-all';
    protected $description = 'Importa modelos arquitectónicos de Sketchfab para todas las categorías';

    private $sketchfabService;
    private $totalImported = 0;
    private $totalErrors = 0;
    private $totalSkipped = 0;
    private $totalFilesDownloaded = 0;

    public function __construct(SketchfabService $sketchfabService)
    {
        parent::__construct();
        $this->sketchfabService = $sketchfabService;
    }

    public function handle()
    {
        $this->info('🚀 Iniciando importación masiva desde Sketchfab...');
        $this->newLine();
        $this->line('===================================================');

        $categories = Category::all();
        
        if ($categories->isEmpty()) {
            $this->error('❌ No hay categorías en la base de datos.');
            return 1;
        }

        $this->info("📊 Se encontraron {$categories->count()} categorías para procesar");
        $this->newLine();

        foreach ($categories as $category) {
            $this->info("📦 Procesando categoría: {$category->name} (ID: {$category->id})");
            
            try {
                $imported = $this->importModelsForCategory($category);
                $this->totalImported += $imported;
                $this->line("   ✅ Categoría completada: {$imported} modelos importados");
            } catch (\Exception $e) {
                $this->totalErrors++;
                $this->error("   ❌ Error en categoría {$category->name}: " . $e->getMessage());
            }

            $this->newLine();
            sleep(2);
        }

        $this->newLine(2);
        $this->info('✅ Importación masiva completada!');
        $this->table(
            ['Total Importados', 'Omitidos (duplicados)', 'Archivos Descargados', 'Errores', 'Categorías Procesadas'],
            [[$this->totalImported, $this->totalSkipped, $this->totalFilesDownloaded, $this->totalErrors, $categories->count()]]
        );

        return 0;
    }

    private function importModelsForCategory(Category $category)
    {
        $imported = 0;
        $searchTerms = $this->getSearchTermsForCategory($category);
        
        foreach ($searchTerms as $term) {
            $this->line("   🔍 Buscando: '{$term}'");
            
            try {
                $results = $this->sketchfabService->searchArchitecturalModels($term, 10);
                
                if (empty($results)) {
                    $this->line("   ⚠️  No se encontraron resultados para '{$term}'");
                    continue;
                }

                $this->line("   📊 Encontrados " . count($results) . " modelos");

                foreach ($results as $modelData) {
                    $result = $this->saveModel($modelData, $category->id);
                    if ($result === true) {
                        $imported++;
                        $this->line("   ✓ Guardado: " . substr($modelData['name'] ?? 'Sin nombre', 0, 50));
                    } elseif ($result === 'skipped') {
                        $this->totalSkipped++;
                        $this->line("   ⏭️  Omitido (duplicado): " . substr($modelData['name'] ?? 'Sin nombre', 0, 50));
                    }
                }
                
                sleep(1);
                
            } catch (\Exception $e) {
                $this->warn("   ⚠️  Error buscando '{$term}': " . $e->getMessage());
                continue;
            }
        }
        
        return $imported;
    }

    private function getSearchTermsForCategory(Category $category)
    {
        $terms = [
            'Estructuras de Acero' => ['steel structure', 'metal frame', 'structural steel', 'steel beam'],
            'Estructuras de Madera' => ['wood structure', 'timber frame', 'wooden beam'],
            'Estructuras de Hormigón' => ['concrete structure', 'reinforced concrete'],
            'Cimentaciones' => ['foundation', 'concrete foundation'],
            'Cubiertas y Tejados' => ['roof structure', 'roof truss', 'roof tiles'],
            'Cerramientos y Fachadas' => ['facade', 'curtain wall', 'building envelope'],
            'Aislamientos' => ['insulation', 'thermal insulation'],
            'Impermeabilizaciones' => ['waterproofing', 'roof waterproofing'],
            'Carpintería Exterior' => ['window', 'door', 'exterior joinery'],
            'Carpintería Interior' => ['interior door', 'wooden door'],
            'Revestimientos' => ['wall cladding', 'flooring', 'tiles'],
            'Pavimentos' => ['pavement', 'floor tile', 'paving'],
            'Fontanería y Tuberías' => ['plumbing', 'pipes', 'pipe fitting'],
            'Electricidad y Cableados' => ['electrical', 'cable tray', 'wiring'],
            'Climatización y Ventilación' => ['hvac', 'air conditioning', 'ventilation'],
            'Iluminación' => ['light fixture', 'lamp', 'lighting'],
            'Mobiliario Urbano' => ['urban furniture', 'street furniture', 'bench'],
            'Paisajismo y Jardinería' => ['landscape', 'garden', 'tree', 'plant'],
            'Señalética y Cartelería' => ['signage', 'sign', 'billboard'],
            'Protección Contra Incendios' => ['fire protection', 'fire extinguisher'],
            'Equipamiento Industrial' => ['industrial equipment', 'machinery'],
            'Construcción Sostenible' => ['green building', 'solar panel'],
            'Patrimonio y Rehabilitación' => ['heritage', 'historic building'],
        ];

        return $terms[$category->name] ?? [$category->name, 'architecture'];
    }

    private function saveModel($modelData, $categoryId)
    {
        try {
            $uid = $modelData['uid'] ?? null;
            
            if (!$uid) {
                return false;
            }

            // Verificar usando sketchfab_id
            $exists = Model3d::where('sketchfab_id', $uid)->exists();
            
            if ($exists) {
                return 'skipped';
            }

            $thumbnail = $this->getBestThumbnail($modelData);

            // Crear el modelo
            $model = Model3d::create([
                'name' => $modelData['name'] ?? 'Modelo sin nombre',
                'description' => $modelData['description'] ?? 'Modelo 3D arquitectónico de Sketchfab',
                'sketchfab_id' => $uid,
                'category_id' => $categoryId,
                'price' => $this->calculatePrice($modelData),
                'author_name' => $modelData['user']['displayName'] ?? $modelData['user']['username'] ?? 'Unknown',
                'author_avatar' => $modelData['user']['avatar']['images'][0]['url'] ?? null,
                'preview_url' => $this->getBestThumbnail($modelData),
                'embed_url' => $modelData['embedUrl'] ?? "https://sketchfab.com/models/{$uid}/embed",
                'sketchfab_url' => $modelData['viewerUrl'] ?? "https://sketchfab.com/3d-models/{$uid}",
                'polygon_count' => $modelData['faceCount'] ?? 0,
                'material_count' => 0,
                'has_animations' => ($modelData['animationCount'] ?? 0) > 0,
                'has_rigging' => false,
                'format' => 'GLTF', // Por defecto
                'size_mb' => $this->calculateSize($modelData),
                'metadata' => json_encode([
                    'sketchfab_uid' => $uid,
                    'face_count' => $modelData['faceCount'] ?? null,
                    'vertex_count' => $modelData['vertexCount'] ?? null,
                    'license' => $modelData['license']['label'] ?? null,
                    'published_at' => $modelData['publishedAt'] ?? null,
                    'tags' => array_column($modelData['tags'] ?? [], 'name'),
                    'archives' => $modelData['archives'] ?? null,
                ]),
                'featured' => false,
                'publication_date' => $modelData['publishedAt'] ?? now(),
            ]);

            $this->line("      📥 Descargando archivos del modelo...");
            
            // Descargar los archivos del modelo
            $filesDownloaded = $this->downloadModelFiles($modelData, $model->id);
            $this->totalFilesDownloaded += $filesDownloaded;
            
            if ($filesDownloaded > 0) {
                $this->line("      ✅ {$filesDownloaded} archivo(s) descargado(s)");
            } else {
                $this->warn("      ⚠️ No se pudieron descargar archivos");
            }

            return true;
            
        } catch (\Exception $e) {
            $this->warn("   ⚠️  Error guardando modelo: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Descargar archivos del modelo desde Sketchfab
     */
    private function downloadModelFiles($modelData, $modelId)
    {
        $archives = $modelData['archives'] ?? [];
        $downloaded = 0;
        
        if (empty($archives)) {
            return 0;
        }

        foreach ($archives as $format => $archive) {
            // Intentar obtener URL de descarga
            $downloadUrl = $archive['url'] ?? null;
            
            if (!$downloadUrl) {
                continue;
            }

            $this->line("         📦 Descargando formato: {$format}");
            
            try {
                // Descargar el archivo
                $response = Http::withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept' => '*/*',
                ])->timeout(120)->get($downloadUrl);

                if (!$response->successful()) {
                    $this->warn("         ⚠️ Error descargando {$format}: HTTP " . $response->status());
                    continue;
                }

                // Crear directorio si no existe
                $directory = 'models/' . $modelId;
                Storage::disk('public')->makeDirectory($directory);

                // Generar nombre de archivo
                $fileName = $this->sanitizeFilename($modelData['name'] ?? 'modelo') . '.' . $format;
                $filePath = $directory . '/' . $fileName;

                // Guardar archivo
                Storage::disk('public')->put($filePath, $response->body());

                // Obtener tamaño
                $size = $response->header('Content-Length') ?? strlen($response->body());

                // Guardar registro en model_files
                ModelFile::create([
                    'model_id' => $modelId,
                    'file_url' => '/storage/' . $filePath,
                    'file_type' => 'download',
                    'format' => strtoupper($format),
                    'original_name' => $fileName,
                    'size_bytes' => $size,
                    'origin' => 'sketchfab'
                ]);

                $downloaded++;
                $this->line("         ✅ {$format} descargado (" . round($size / 1024 / 1024, 2) . " MB)");

                // Pequeña pausa entre descargas
                sleep(1);

            } catch (\Exception $e) {
                $this->warn("         ⚠️ Error descargando {$format}: " . $e->getMessage());
                continue;
            }
        }

        return $downloaded;
    }

    /**
     * Sanitizar nombre de archivo
     */
    private function sanitizeFilename($name)
    {
        // Eliminar caracteres especiales y espacios
        $name = preg_replace('/[^a-zA-Z0-9]/', '_', $name);
        // Limitar longitud
        return substr($name, 0, 50);
    }

    private function getBestThumbnail($modelData)
    {
        // Intentar diferentes formas de obtener la thumbnail
        $thumbnails = [];
        
        // Formato 1: thumbnails.images array
        if (isset($modelData['thumbnails']['images'])) {
            $thumbnails = $modelData['thumbnails']['images'];
        }
        // Formato 2: thumbnails directo
        elseif (isset($modelData['thumbnails']) && is_array($modelData['thumbnails'])) {
            $thumbnails = $modelData['thumbnails'];
        }
        
        if (empty($thumbnails)) {
            // Intentar con la estructura alternativa
            if (isset($modelData['thumbnails'][0]['url'])) {
                $thumbnails = $modelData['thumbnails'];
            }
        }

        if (empty($thumbnails)) {
            return null;
        }

        // Ordenar por tamaño (width)
        usort($thumbnails, function($a, $b) {
            return ($b['width'] ?? 0) <=> ($a['width'] ?? 0);
        });

        $url = $thumbnails[0]['url'] ?? null;
        
        if ($url) {
            // Limpiar la URL
            $url = str_replace('http://', 'https://', $url);
            
            // Asegurar que termine en .jpg
            if (preg_match('/\.(png|svg|jpeg|jpg)$/i', $url)) {
                $url = preg_replace('/\.(png|svg)$/i', '.jpg', $url);
            } else {
                // Si no tiene extensión, asumimos que es .jpg
                $url = $url . '.jpg';
            }
            
            // Debug
            $this->line("      🖼️  Thumbnail: " . substr($url, 0, 100));
        }

        return $url;
    }

    private function calculatePrice($modelData)
    {
        $basePrice = 9.99;
        $faceCount = $modelData['faceCount'] ?? 0;
        
        if ($faceCount > 1000000) {
            return 29.99;
        } elseif ($faceCount > 500000) {
            return 24.99;
        } elseif ($faceCount > 100000) {
            return 19.99;
        } elseif ($faceCount > 50000) {
            return 14.99;
        }
        
        return $basePrice;
    }

    private function calculateSize($modelData)
    {
        // Intentar obtener el tamaño de los archivos
        $archives = $modelData['archives'] ?? [];
        $sizes = [];
        
        foreach ($archives as $format => $info) {
            if (isset($info['size'])) {
                $sizes[] = $info['size'];
            }
        }
        
        if (!empty($sizes)) {
            // Convertir a MB y redondear
            $maxSize = max($sizes) / (1024 * 1024);
            return round($maxSize, 2);
        }
        
        return 0;
    }
}