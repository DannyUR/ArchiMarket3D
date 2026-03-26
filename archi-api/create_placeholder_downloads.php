<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

echo "=== CREANDO ARCHIVOS DE DESCARGA PLACEHOLDER ===\n\n";

// Obtener todos los modelos
$modelos = DB::table('models')->get();
$creados = 0;
$yaTienen = 0;
$errores = 0;

foreach ($modelos as $modelo) {
    echo "Procesando modelo: {$modelo->name} (ID: {$modelo->id})...\n";
    
    // Verificar si ya tiene archivo download en BD
    $tieneDownload = DB::table('model_files')
        ->where('model_id', $modelo->id)
        ->where('file_type', 'download')
        ->exists();
    
    if ($tieneDownload) {
        echo "  ✓ Ya tiene archivo de descarga\n";
        $yaTienen++;
        continue;
    }
    
    try {
        // Crear carpeta del modelo si no existe
        $carpeta = storage_path("app/public/models/{$modelo->id}");
        if (!is_dir($carpeta)) {
            mkdir($carpeta, 0755, true);
        }
        
        // Obtener el formato del modelo
        $formato = strtolower($modelo->format ?? 'glb');
        
        // Nombre del archivo de descarga
        $nombreSanitizado = Str::slug($modelo->name, '_');
        $nombreArchivo = "download_{$nombreSanitizado}.{$formato}";
        $rutaCompleta = "{$carpeta}/{$nombreArchivo}";
        
        // Crear un archivo simple con contenido
        $contenido = "Modelo 3D: {$modelo->name}\n";
        $contenido .= "Formato: " . strtoupper($formato) . "\n";
        $contenido .= "Tamaño: {$modelo->size_mb} MB\n";
        $contenido .= "---\n";
        $contenido .= "Este es un archivo placeholder.\n";
        $contenido .= "En producción, contendrá el archivo 3D real.\n";
        
        // Escribir el archivo
        if (file_put_contents($rutaCompleta, $contenido) === false) {
            throw new Exception("No se pudo escribir el archivo");
        }
        
        // Verificar que el archivo se creó
        if (!file_exists($rutaCompleta)) {
            throw new Exception("El archivo no se creó correctamente");
        }
        
        // Obtener tamaño del archivo
        $fileSize = filesize($rutaCompleta);
        
        // Insertar en model_files
        $modelFile = DB::table('model_files')->insert([
            'model_id' => $modelo->id,
            'file_url' => "/storage/models/{$modelo->id}/{$nombreArchivo}",
            'file_type' => 'download',
            'origin' => 'manual',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        if ($modelFile) {
            echo "  ⬇️  Archivo de descarga creado: {$nombreArchivo} ({$fileSize} bytes)\n";
            $creados++;
        } else {
            throw new Exception("Error insertando en base de datos");
        }
        
    } catch (Exception $e) {
        echo "  ✗ Error: {$e->getMessage()}\n";
        $errores++;
    }
}

echo "\n=== RESUMEN ===\n";
echo "Archivos creados: {$creados}\n";
echo "Modelos que ya tenían archivos: {$yaTienen}\n";
echo "Errores: {$errores}\n";
echo "Total procesado: " . count($modelos) . "\n";

