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

        $this->info("╔════════════════════════════════════════════╗");
        $this->info("║      IMPORTADOR DE MODELOS SKETCHFAB       ║");
        $this->info("╚════════════════════════════════════════════╝");
        $this->newLine();

        $this->info("🔍 Buscando modelos de categoría: <bg=blue> {$category} </>");
        $this->info("📊 Límite de descarga: {$limit} modelos");
        $this->newLine();

        $models = $sketchfab->searchArchitecturalModels($category, $limit);

        if (empty($models)) {
            $this->error('❌ No se encontraron modelos');
            return 1;
        }

        $this->info("✅ Encontrados " . count($models) . " modelos en Sketchfab");
        $this->newLine();

        $bar = $this->output->createProgressBar(count($models));
        $bar->setFormat('%current%/%max% [%bar%] %percent:3s%% %message%');
        $bar->start();

        $imported = 0;
        $skipped = 0;

        foreach ($models as $sketchfabModel) {
            $bar->setMessage("Procesando: {$sketchfabModel['name']}");
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
        $this->newLine();

        $this->info("╔════════════════════════════════════════════╗");
        $this->info("║           RESUMEN DE IMPORTACIÓN           ║");
        $this->info("╠════════════════════════════════════════════╣");
        $this->info("║ ✅ Importados:    <fg=green>{$imported}</> modelos");
        $this->info("║ ⏭️  Omitidos:     <fg=yellow>{$skipped}</> modelos");
        $this->info("║ 📊 Total:        " . count($models) . " modelos");
        $this->info("╚════════════════════════════════════════════╝");

        return 0;
    }

protected function importModel($sketchfabModel, $sketchfabService)
{
    // Verificar si ya existe
    $exists = Model3D::where('sketchfab_id', $sketchfabModel['uid'])->exists();
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
    $searchQuery = $this->argument('category') ?? 'architecture';
    $categoryId = $this->getCategoryId($details['categories'] ?? [], $searchQuery);
    $category = Category::find($categoryId);
    $categoryType = $this->determineCategoryType($category);

    // Calcular tamaño
    $sizeMb = $this->calculateSize($details);

    // Preparar metadatos según el tipo de categoría
    $metadata = $this->generateMetadata($details, $categoryType);

    // Crear el modelo en BD
    $model = Model3D::create([
        'name' => $sketchfabModel['name'],
        'description' => $this->cleanDescription($details['description'] ?? ''),
        'price' => $this->calculateBasePrice($details),
        'format' => 'GLTF',
        'size_mb' => $sizeMb,
        'category_id' => $categoryId,
        'category_type' => $categoryType,
        'featured' => false,
        'publication_date' => now(),
        'sketchfab_id' => $sketchfabModel['uid'],
        'author_name' => $details['user']['username'] ?? 'Sketchfab User',
        'author_avatar' => $details['user']['avatar']['url'] ?? null,
        'author_bio' => $details['user']['bio'] ?? null,
        'polygon_count' => $details['vertexCount'] ?? null,
        'material_count' => $details['materialCount'] ?? null,
        'has_animations' => ($details['animationCount'] ?? 0) > 0,
        'has_rigging' => ($details['riggingCount'] ?? 0) > 0,
        'technical_specs' => json_encode($details['technologies'] ?? []),
        'metadata' => json_encode($metadata),
    ]);

    // Guardar imagen
    $this->savePreviewImage($model, $details);
    
    // Crear licencias
    $this->createLicenses($model);
    
    $this->line("      ✅ Modelo importado: {$model->name} (Cat: {$category->name})");
    return true;
}

    protected function getCategoryId($categories, $searchQuery = '')
    {
        // Mapeo mejorado con palabras clave y categorías específicas
        $categoryMap = [
            // Estructuras de Acero
            'steel structure' => 'Estructuras de Acero',
            'steel beam' => 'Estructuras de Acero',
            'steel column' => 'Estructuras de Acero',
            'steel truss' => 'Estructuras de Acero',
            'steel frame' => 'Estructuras de Acero',
            
            // Estructuras de Concreto
            'concrete structure' => 'Estructuras de Concreto',
            'reinforced concrete' => 'Estructuras de Concreto',
            'concrete beam' => 'Estructuras de Concreto',
            'concrete column' => 'Estructuras de Concreto',
            'concrete foundation' => 'Cimentaciones',
            
            // Instalaciones
            'plumbing' => 'Fontanería y Tuberías',
            'pipe' => 'Fontanería y Tuberías',
            'valve' => 'Fontanería y Tuberías',
            'electrical' => 'Sistemas Eléctricos',
            'wiring' => 'Sistemas Eléctricos',
            'hvac' => 'HVAC (Climatización)',
            'air conditioning' => 'HVAC (Climatización)',
            'duct' => 'HVAC (Climatización)',
            'sprinkler' => 'Protección Contra Incendios',
            
            // Mobiliario
            'office chair' => 'Mobiliario de Oficina',
            'office desk' => 'Mobiliario de Oficina',
            'office furniture' => 'Mobiliario de Oficina',
            'residential furniture' => 'Mobiliario Residencial',
            'street furniture' => 'Mobiliario Urbano',
            
            // Arquitectura
            'house' => 'Arquitectura Residencial',
            'residential' => 'Arquitectura Residencial',
            'commercial building' => 'Arquitectura Comercial',
            'facade' => 'Fachadas y Cerramientos',
            'roof' => 'Cubiertas y Azoteas',
            
            // Maquinaria
            'construction equipment' => 'Equipo de Construcción',
            'heavy equipment' => 'Equipo Pesado',
            'industrial machine' => 'Maquinaria Industrial',
            
            // Urbanismo
            'bridge' => 'Infraestructura Vial',
            'highway' => 'Infraestructura Vial',
            'plaza' => 'Espacios Públicos',
            'landscape' => 'Paisajismo',
            'pavement' => 'Infraestructura Vial',
        ];

        // Primero, buscar en las categorías de Sketchfab
        foreach ($categories as $cat) {
            $catName = strtolower($cat['name'] ?? '');
            foreach ($categoryMap as $key => $value) {
                if (stripos($catName, $key) !== false) {
                    $category = Category::where('name', $value)->first();
                    if ($category) {
                        $this->info("      📌 Categoría asignada: {$value}");
                        return $category->id;
                    }
                }
            }
        }

        // Si no encuentra, usar la palabra clave de búsqueda
        $searchLower = strtolower($searchQuery);
        foreach ($categoryMap as $key => $value) {
            if (stripos($searchLower, $key) !== false) {
                $category = Category::where('name', $value)->first();
                if ($category) {
                    $this->info("      📌 Categoría asignada por búsqueda: {$value}");
                    return $category->id;
                }
            }
        }

        // Categoría por defecto
        $default = Category::where('name', 'Arquitectura Residencial')->first();
        if (!$default) {
            $default = Category::first();
        }
        $this->info("      📌 Categoría por defecto: {$default->name}");
        return $default?->id ?? 1;
    }

    protected function determineCategoryType($category)
    {
        if (!$category) return 'arquitectura';

        $categoryName = strtolower($category->name);

        // Mapear categorías a tipos
        $typeMap = [
            // Estructurales
            'acero' => 'estructural',
            'hormigón' => 'estructural',
            'cimentación' => 'estructural',
            'columna' => 'estructural',
            'viga' => 'estructural',
            'cercha' => 'estructural',
            'marco' => 'estructural',
            'estructura' => 'estructural',
            'cubierta' => 'estructural',
            
            // Arquitectura
            'diseño' => 'arquitectura',
            'edificio' => 'arquitectura',
            'vivienda' => 'arquitectura',
            'interior' => 'arquitectura',
            'fachada' => 'arquitectura',
            'estilo' => 'arquitectura',
            'minimalismo' => 'arquitectura',
            
            // Instalaciones
            'hvac' => 'instalaciones',
            'sanitaria' => 'instalaciones',
            'eléctrica' => 'instalaciones',
            'incendio' => 'instalaciones',
            
            // Mobiliario
            'mobiliario' => 'mobiliario',
            'silla' => 'mobiliario',
            'mesa' => 'mobiliario',
            'escritorio' => 'mobiliario',
            'armario' => 'mobiliario',
            
            // Maquinaria
            'máquina' => 'maquinaria',
            'equipo' => 'maquinaria',
            'herramienta' => 'maquinaria',
            'industrial' => 'maquinaria',
            
            // Urbanismo
            'urbanismo' => 'urbanismo',
            'urban' => 'urbanismo',
            'ciudad' => 'urbanismo',
            'paisajismo' => 'urbanismo',
            'transporte' => 'urbanismo',
        ];

        foreach ($typeMap as $key => $type) {
            if (stripos($categoryName, $key) !== false) {
                return $type;
            }
        }

        return 'arquitectura'; // Por defecto
    }

    protected function generateMetadata($details, $categoryType)
    {
        $metadata = [];

        // Metadatos básicos para todos
        $metadata['polygon_count'] = $details['vertexCount'] ?? 0;
        $metadata['material_count'] = $details['materialCount'] ?? 0;
        $metadata['has_animations'] = ($details['animationCount'] ?? 0) > 0;
        $metadata['has_rigging'] = ($details['riggingCount'] ?? 0) > 0;

        // Metadatos específicos según el tipo de categoría
        switch ($categoryType) {
            case 'estructural':
                $metadata['material'] = $this->guessMaterial($details);
                $metadata['resistencia'] = $this->guessResistance($details);
                $metadata['sistemas_disponibles'] = ['estructura', 'detalles', 'planos'];
                break;

            case 'arquitectura':
                $metadata['area_aproximada'] = $this->guessArea($details);
                $metadata['altura'] = $this->guessHeight($details);
                $metadata['estilo'] = $this->guessStyle($details);
                $metadata['render_calidad'] = 'Alta';
                break;

            case 'instalaciones':
                $metadata['tipo_sistema'] = $this->guessInstallationType($details);
                $metadata['diametro'] = 'Especificaciones según proyecto';
                $metadata['presion_nominal'] = 'Varía según uso';
                break;

            case 'mobiliario':
                $metadata['dimensiones'] = 'Ver especificaciones técnicas';
                $metadata['material'] = $this->guessMaterial($details);
                $metadata['estilo'] = $this->guessStyle($details);
                break;

            case 'maquinaria':
                $metadata['potencia'] = 'Ver especificaciones técnicas';
                $metadata['tipo_equipo'] = 'Equipo industrial';
                $metadata['capacidad'] = 'Variable';
                break;

            case 'urbanismo':
                $metadata['area_cobertura'] = $this->guessArea($details);
                $metadata['densidad'] = 'Urbana';
                $metadata['escala'] = 'Según proyecto';
                break;
        }

        return $metadata;
    }

    protected function guessMaterial($details)
    {
        $description = strtolower($details['description'] ?? '');
        $name = strtolower($details['name'] ?? '');
        $text = $description . ' ' . $name;

        $materials = [
            'acero' => 'Acero',
            'hormigón' => 'Hormigón',
            'vidrio' => 'Vidrio',
            'madera' => 'Madera',
            'concreto' => 'Hormigón',
            'ladrillo' => 'Ladrillo',
            'piedra' => 'Piedra',
            'aluminio' => 'Aluminio',
        ];

        foreach ($materials as $key => $value) {
            if (stripos($text, $key) !== false) {
                return $value;
            }
        }

        return 'Mixto';
    }

    protected function guessResistance($details)
    {
        $description = strtolower($details['description'] ?? '');
        
        if (stripos($description, 'carga') !== false || stripos($description, 'pesado') !== false) {
            return '> 500 kg/m²';
        }
        return '250-500 kg/m²';
    }

    protected function guessArea($details)
    {
        $vertexCount = $details['vertexCount'] ?? 10000;
        
        if ($vertexCount > 100000) {
            return '> 5000 m²';
        } elseif ($vertexCount > 50000) {
            return '2000-5000 m²';
        } else {
            return '< 2000 m²';
        }
    }

    protected function guessHeight($details)
    {
        $description = strtolower($details['description'] ?? '');
        
        if (stripos($description, 'torre') !== false || stripos($description, 'high') !== false) {
            return '> 30 metros';
        } elseif (stripos($description, 'edificio') !== false) {
            return '15-30 metros';
        }
        return '< 15 metros';
    }

    protected function guessStyle($details)
    {
        $description = strtolower($details['description'] ?? '');
        $name = strtolower($details['name'] ?? '');
        $text = $description . ' ' . $name;

        $styles = [
            'moderno' => 'Moderno',
            'contemporary' => 'Contemporáneo',
            'clásico' => 'Clásico',
            'minimalista' => 'Minimalista',
            'industrial' => 'Industrial',
            'art deco' => 'Art Déco',
        ];

        foreach ($styles as $key => $value) {
            if (stripos($text, $key) !== false) {
                return $value;
            }
        }

        return 'Contemporáneo';
    }

    protected function guessInstallationType($details)
    {
        $description = strtolower($details['description'] ?? '');
        $name = strtolower($details['name'] ?? '');
        $text = $description . ' ' . $name;

        if (stripos($text, 'hvac') !== false || stripos($text, 'aire') !== false) {
            return 'HVAC';
        } elseif (stripos($text, 'sanitaria') !== false || stripos($text, 'agua') !== false) {
            return 'Sanitaria';
        } elseif (stripos($text, 'eléctrica') !== false || stripos($text, 'electricidad') !== false) {
            return 'Eléctrica';
        }

        return 'General';
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

            // Determinar la extensión desde la URL
            $extension = pathinfo(parse_url($imageUrl, PHP_URL_PATH), PATHINFO_EXTENSION);
            if (!in_array($extension, ['jpg', 'jpeg', 'png'])) {
                $extension = 'jpg'; // Por defecto
            }

            // Descargar la imagen
            $response = Http::timeout(30)->get($imageUrl);
            
            if ($response->successful()) {
                // Crear carpeta si no existe
                $path = 'models/' . $model->id;
                Storage::disk('public')->makeDirectory($path);
                
                // Generar nombre único con extensión correcta
                $filename = $path . '/preview_' . time() . '.' . $extension;
                
                // Guardar en storage
                Storage::disk('public')->put($filename, $response->body());
                
                // Crear registro en model_files
                ModelFile::create([
                    'model_id' => $model->id,
                    'file_url' => '/storage/' . $filename,
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
            
            // Ordenar por tamaño descendente
            usort($images, function($a, $b) {
                return ($b['width'] ?? 0) - ($a['width'] ?? 0);
            });
            
            // Buscar la primera imagen JPG (no SVG)
            foreach ($images as $img) {
                $url = $img['url'] ?? '';
                // Preferir JPG, JPEG, PNG sobre SVG
                if (preg_match('/\.(jpg|jpeg|png)$/i', $url)) {
                    return $url;
                }
            }
            
            // Si no hay JPG, devolver la más grande (pero será SVG)
            return $images[0]['url'] ?? null;
        }

        // Si solo hay una URL, verificar que no sea SVG
        $url = $details['thumbnails']['url'] ?? null;
        if ($url && preg_match('/\.(jpg|jpeg|png)$/i', $url)) {
            return $url;
        }
        
        return null;
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