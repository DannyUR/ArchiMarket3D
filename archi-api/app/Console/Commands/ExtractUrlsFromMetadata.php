<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExtractModelUrls extends Command
{
    protected $signature = 'models:extract-urls';
    protected $description = 'Extrae preview_url, embed_url y sketchfab_url del campo metadata';

    public function handle()
    {
        $this->info('🔍 Extrayendo URLs del metadata...');
        
        $models = DB::table('models')->get();
        $updated = 0;
        $total = $models->count();

        $this->info("📊 Procesando {$total} modelos...");
        $bar = $this->output->createProgressBar($total);

        foreach ($models as $model) {
            if ($model->metadata) {
                $metadata = json_decode($model->metadata, true);
                
                if ($metadata) {
                    $updates = [];
                    
                    // Construir URLs desde sketchfab_id
                    if ($model->sketchfab_id) {
                        // Embed URL para el visor 3D
                        $updates['embed_url'] = "https://sketchfab.com/models/{$model->sketchfab_id}/embed";
                        
                        // Sketchfab URL para ver en la web
                        $updates['sketchfab_url'] = "https://sketchfab.com/3d-models/" . $model->sketchfab_id;
                    }
                    
                    // Intentar obtener preview_url de diferentes fuentes
                    $previewUrl = $this->extractPreviewUrl($metadata, $model);
                    if ($previewUrl) {
                        $updates['preview_url'] = $previewUrl;
                    }
                    
                    if (!empty($updates)) {
                        DB::table('models')
                            ->where('id', $model->id)
                            ->update($updates);
                        $updated++;
                    }
                }
            }
            
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("✅ Proceso completado. {$updated} modelos actualizados.");
        
        // Mostrar estadísticas
        $stats = DB::table('models')
            ->select(
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN preview_url IS NOT NULL THEN 1 ELSE 0 END) as with_preview'),
                DB::raw('SUM(CASE WHEN embed_url IS NOT NULL THEN 1 ELSE 0 END) as with_embed')
            )->first();
        
        $this->table(
            ['Total Modelos', 'Con Preview', 'Con Embed'],
            [[$stats->total, $stats->with_preview, $stats->with_embed]]
        );
        
        return 0;
    }

    private function extractPreviewUrl($metadata, $model)
    {
        // Intentar obtener thumbnail del metadata
        if (isset($metadata['thumbnails'])) {
            $thumbnails = $metadata['thumbnails'];
            
            // Formato 1: thumbnails.images
            if (isset($thumbnails['images']) && !empty($thumbnails['images'])) {
                $url = $this->getLargestThumbnail($thumbnails['images']);
                if ($url) return $this->cleanImageUrl($url);
            }
            
            // Formato 2: thumbnails array directo
            if (is_array($thumbnails) && !empty($thumbnails)) {
                $url = $this->getLargestThumbnail($thumbnails);
                if ($url) return $this->cleanImageUrl($url);
            }
        }
        
        // Intentar obtener de otras partes del metadata
        if (isset($metadata['preview_url'])) {
            return $this->cleanImageUrl($metadata['preview_url']);
        }
        
        // Si hay un UID, construir URL genérica de thumbnail
        if ($model->sketchfab_id) {
            return "https://media.sketchfab.com/models/{$model->sketchfab_id}/thumbnails/最佳分辨率.jpg";
        }
        
        return null;
    }

    private function getLargestThumbnail($images)
    {
        if (empty($images)) return null;
        
        // Buscar la imagen de mayor resolución
        $largest = null;
        $maxSize = 0;
        
        foreach ($images as $img) {
            $size = $img['width'] ?? $img['size'] ?? 0;
            if ($size > $maxSize) {
                $maxSize = $size;
                $largest = $img['url'] ?? null;
            }
        }
        
        return $largest;
    }

    private function cleanImageUrl($url)
    {
        if (!$url) return null;
        
        // Limpiar URL
        $url = str_replace('http://', 'https://', $url);
        
        // Asegurar extensión .jpg
        $url = preg_replace('/\.(png|svg|jpeg)$/i', '.jpg', $url);
        
        return $url;
    }
}