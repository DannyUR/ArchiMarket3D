<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\Model3D;

class ModelFilesSeeder extends Seeder
{
    public function run(): void
    {
        $models = Model3D::all();
        
        foreach ($models as $model) {
            // Crear carpeta para el modelo
            $path = "models/{$model->id}";
            Storage::disk('public')->makeDirectory($path);
            
            // Archivos de ejemplo
            $files = [
                [
                    'file_name' => 'modelo_principal.rvt',
                    'file_type' => 'download',
                    'content' => 'Contenido del modelo 3D principal'
                ],
                [
                    'file_name' => 'vista_previa.glb',
                    'file_type' => 'preview',
                    'content' => 'Vista previa del modelo'
                ]
            ];
            
            foreach ($files as $file) {
                // Crear archivo físico
                $filePath = $path . '/' . $file['file_name'];
                Storage::disk('public')->put($filePath, $file['content']);
                
                // Insertar en BD
                DB::table('model_files')->insert([
                    'model_id' => $model->id,
                    'file_url' => Storage::url($filePath),
                    'file_type' => $file['file_type'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
        
        $this->command->info('✅ Archivos de modelos creados correctamente');
    }
}