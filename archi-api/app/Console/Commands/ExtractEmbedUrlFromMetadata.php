<?php

namespace App\Console\Commands;

use App\Models\Model3D;
use Illuminate\Console\Command;

class ExtractEmbedUrlFromMetadata extends Command
{
    protected $signature = 'models:extract-embed-url';
    protected $description = 'Extrae embed_url del metadata y lo guarda en el campo embed_url';

    public function handle()
    {
        $this->info('🔧 Extrayendo embed_url del metadata...');
        
        $models = Model3D::all();
        $updated = 0;
        $bar = $this->output->createProgressBar($models->count());

        foreach ($models as $model) {
            // Si ya tiene embed_url, saltar
            if ($model->embed_url) {
                $bar->advance();
                continue;
            }

            // Decodificar metadata manualmente
            $metadata = $model->metadata;
            if (is_string($metadata)) {
                $metadata = json_decode($metadata, true);
            }

            // Si tiene metadata con embed_url, extraerlo
            if (is_array($metadata) && isset($metadata['embed_url'])) {
                $url = $metadata['embed_url'];
                // Limpiar el URL si está escapado
                $url = str_replace('\/', '/', $url);
                $model->embed_url = $url;
                $model->save();
                $updated++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("✅ Completado: $updated modelos actualizados");
    }
}
