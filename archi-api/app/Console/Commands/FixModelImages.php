<?php

namespace App\Console\Commands;

use App\Models\Model3d;
use Illuminate\Console\Command;

class FixModelImages extends Command
{
    protected $signature = 'models:fix-images';
    protected $description = 'Repara las URLs de imágenes y embed de los modelos';

    public function handle()
    {
        $this->info('🔧 Reparando URLs de modelos...');
        
        $models = Model3d::whereNull('preview_url')
            ->orWhere('preview_url', '')
            ->orWhere('preview_url', 'like', '%.svg')
            ->get();

        $this->info("📊 Encontrados {$models->count()} modelos con problemas");

        $bar = $this->output->createProgressBar($models->count());
        
        foreach ($models as $model) {
            $this->fixModelUrls($model);
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info('✅ Reparación completada');
    }

    private function fixModelUrls($model)
    {
        // Reparar preview_url
        if ($model->preview_url) {
            $url = str_replace('http://', 'https://', $model->preview_url);
            $url = preg_replace('/\.(svg|png)$/i', '.jpg', $url);
            $model->preview_url = $url;
        }

        // Asegurar embed_url
        if ($model->sketchfab_id) {
            if (!$model->embed_url) {
                $model->embed_url = "https://sketchfab.com/models/{$model->sketchfab_id}/embed";
            }
            if (!$model->sketchfab_url) {
                $model->sketchfab_url = "https://sketchfab.com/3d-models/" . $model->sketchfab_id;
            }
        }

        $model->save();
    }
}