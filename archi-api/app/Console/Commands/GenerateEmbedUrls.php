<?php

namespace App\Console\Commands;

use App\Models\Model3D;
use Illuminate\Console\Command;

class GenerateEmbedUrls extends Command
{
    protected $signature = 'models:generate-embed-urls';
    protected $description = 'Genera embed_url para todos los modelos con sketchfab_id';

    public function handle()
    {
        $this->info('🔄 Generando embed_url para modelos...');
        
        $models = Model3D::whereNotNull('sketchfab_id')
            ->whereNull('embed_url')
            ->get();

        if ($models->isEmpty()) {
            $this->info('✅ Todos los modelos ya tienen embed_url');
            return 0;
        }

        $bar = $this->output->createProgressBar($models->count());
        
        foreach ($models as $model) {
            $model->embed_url = 'https://sketchfab.com/models/' . $model->sketchfab_id . '/embed';
            $model->save();
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info("✅ Completado: {$models->count()} embed_url generados");
        
        return 0;
    }
}
