<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\SketchfabService;
use App\Models\Model3D;
use App\Models\Category;
use App\Models\ModelFile;
use App\Models\License;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class ImportSketchfabModels extends Command
{
    protected $signature = 'sketchfab:import {category?} {--limit=10}';
    protected $description = 'Importa modelos arquitectónicos desde Sketchfab';

    public function handle(SketchfabService $sketchfab)
    {
        $category = $this->argument('category') ?? 'architecture';
        $limit = $this->option('limit');

        $this->info("🔍 Buscando modelos de {$category}...");

        $models = $sketchfab->searchArchitecturalModels($category, $limit);

        if (empty($models)) {
            $this->error('No se encontraron modelos');
            return 1;
        }

        $this->info("📦 Encontrados " . count($models) . " modelos");
        $bar = $this->output->createProgressBar(count($models));
        $bar->start();

        $imported = 0;
        $skipped = 0;

        foreach ($models as $sketchfabModel) {
            $result = $this->importModel($sketchfabModel, $sketchfab);
            if ($result) {
                $imported++;
            } else {
                $skipped++;
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("✅ Importación completada: {$imported} importados, {$skipped} omitidos");

        return 0;
    }

protected function importModel($sketchfabModel, $sketchfabService)
{
    // Verificar si ya existe
    $exists = Model3D::where('name', $sketchfabModel['name'])->exists();
    if ($exists) return false;

    // Obtener detalles
    $details = $sketchfabService->getModelDetails($sketchfabModel['uid']);
    if (!$details) return false;

    // Verificar si tiene imagen ANTES de crear el modelo
    $imageUrl = $this->getImageUrl($details);
    if (!$imageUrl) {
        $this->warn("   ⚠ Modelo sin imagen, omitiendo");
        return false;
    }

    // Obtener categoría
    $categoryId = $this->getCategoryId($details['categories'] ?? []);

    // Calcular tamaño
    $sizeMb = $this->calculateSize($details);

    // Crear el modelo en BD
    // Al crear el modelo, agrega:
    $model = Model3D::create([
        'name' => $sketchfabModel['name'],
        'description' => $this->cleanDescription($details['description'] ?? ''),
        'price' => $this->calculateBasePrice($details),
        'format' => 'GLTF',
        'size_mb' => $sizeMb,
        'category_id' => $categoryId,
        'featured' => false,
        'publication_date' => now(),
        'sketchfab_id' => $sketchfabModel['uid'],
        'author_name' => $details['user']['username'] ?? 'Sketchfab User',
        'author_avatar' => $details['user']['avatar']['url'] ?? null,
        'author_bio' => $details['user']['bio'] ?? null,
        // Nuevos campos técnicos
        'polygon_count' => $details['vertexCount'] ?? null,
        'material_count' => $details['materialCount'] ?? null,
        'has_animations' => $details['animationCount'] > 0 ?? false,
        'has_rigging' => $details['riggingCount'] > 0 ?? false,
        'technical_specs' => json_encode($details['technologies'] ?? [])
    ]);

    // Guardar el sketchfab_id
    $model->sketchfab_id = $sketchfabModel['uid'];
    $model->save();

    // Guardar imagen
    $this->savePreviewImage($model, $details);
    
    // Crear licencias
    $this->createLicenses($model);
    
    return true;
}

    protected function getCategoryId($categories)
    {
        // Mapear categorías de Sketchfab a tus categorías
        $categoryMap = [
            'architecture' => 'Arquitectura Residencial',
            'building' => 'Estructural',
            'house' => 'Arquitectura Residencial',
            'interior' => 'Arquitectura Comercial',
            'bridge' => 'Estructural',
            'city' => 'Urbanismo',
        ];

        foreach ($categories as $cat) {
            $catName = $cat['name'] ?? '';
            foreach ($categoryMap as $key => $value) {
                if (stripos($catName, $key) !== false) {
                    $category = Category::firstOrCreate(
                        ['name' => $value],
                        ['description' => 'Modelos de ' . $value]
                    );
                    return $category->id;
                }
            }
        }

        // Categoría por defecto
        $default = Category::firstOrCreate(
            ['name' => 'Arquitectura'],
            ['description' => 'Modelos arquitectónicos generales']
        );
        return $default->id;
    }

protected function calculateSize($details)
{
    $totalSize = 0;
    
    if (isset($details['archives']) && is_array($details['archives'])) {
        foreach ($details['archives'] as $archive) {
            $totalSize += $archive['size'] ?? 0;
        }
    }

    if ($totalSize === 0) {
        $vertexCount = $details['vertexCount'] ?? 10000;
        $textureCount = $details['textureCount'] ?? 2;
        $totalSize = ($vertexCount / 100) * 1024 + ($textureCount * 512000);
    }

    return round($totalSize / 1048576, 1);
}

    protected function savePreviewImage($model, $details)
    {
        try {
            // Obtener URL de la imagen
            $imageUrl = $this->getImageUrl($details);
            
            if (!$imageUrl) {
                $this->warn("      ⚠ No se encontró imagen para el modelo");
                return;
            }

            // Descargar la imagen
            $response = Http::timeout(30)->get($imageUrl);
            
            if ($response->successful()) {
                // Crear carpeta si no existe
                $path = 'models/' . $model->id;
                Storage::disk('public')->makeDirectory($path);
                
                // Generar nombre único
                $filename = $path . '/preview_' . time() . '.jpg';
                
                // Guardar en storage
                Storage::disk('public')->put($filename, $response->body());
                
                // Crear registro en model_files
                ModelFile::create([
                    'model_id' => $model->id,
                    'file_url' => '/storage/' . $filename, // 👈 IMPORTANTE: con /storage/
                    'file_type' => 'preview',
                ]);

                $this->line("      🖼️ Imagen preview guardada en: " . $filename);
            }
        } catch (\Exception $e) {
            $this->warn("      ⚠ No se pudo guardar la imagen: " . $e->getMessage());
        }
    }

    protected function getImageUrl($details)
    {
        if (isset($details['thumbnails']['images'])) {
            $images = $details['thumbnails']['images'];
            usort($images, function($a, $b) {
                return ($b['width'] ?? 0) - ($a['width'] ?? 0);
            });
            return $images[0]['url'] ?? null;
        }

        return $details['thumbnails']['url'] ?? null;
    }

    protected function createLicenses($model)
    {
        $basePrice = $model->price;

        // Licencia Personal
        License::create([
            'model_id' => $model->id,
            'type' => 'personal',
            'description' => 'Licencia para uso personal en un solo proyecto. Incluye derechos de uso no comercial.'
        ]);

        // Licencia Business
        License::create([
            'model_id' => $model->id,
            'type' => 'business',
            'description' => 'Licencia comercial para hasta 5 usuarios. Incluye derechos de uso en proyectos comerciales.'
        ]);

        // Licencia Unlimited
        License::create([
            'model_id' => $model->id,
            'type' => 'unlimited',
            'description' => 'Licencia empresarial sin límite de usuarios. Incluye soporte prioritario y derechos completos.'
        ]);

        $this->line("      📋 Licencias creadas");
    }

    protected function cleanDescription($description)
    {
        if (!$description) {
            return 'Modelo arquitectónico profesional listo para usar en tus proyectos.';
        }

        $clean = strip_tags($description);
        $clean = preg_replace('/\s+/', ' ', $clean);
        return substr($clean, 0, 500);
    }

    protected function calculateBasePrice($details)
    {
        $vertexCount = $details['vertexCount'] ?? 0;
        $faceCount = $details['faceCount'] ?? 0;
        $textureCount = $details['textureCount'] ?? 0;
        $likes = $details['likeCount'] ?? 0;
        $views = $details['viewCount'] ?? 0;

        $basePrice = 19.99;

        if ($vertexCount > 50000 || $faceCount > 100000) {
            $basePrice = 49.99;
        } elseif ($vertexCount > 20000 || $faceCount > 40000) {
            $basePrice = 29.99;
        }

        if ($textureCount > 5) {
            $basePrice += 10;
        }

        if ($likes > 100 || $views > 5000) {
            $basePrice += 20;
        } elseif ($likes > 50 || $views > 2000) {
            $basePrice += 10;
        }

        return round($basePrice, 2);
    }
}