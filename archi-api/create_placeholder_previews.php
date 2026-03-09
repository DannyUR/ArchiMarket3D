<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

echo "=== CREANDO IMÁGENES PLACEHOLDER ===\n\n";

// Obtener todos los modelos
$modelos = DB::table('models')->get();
$creados = 0;
$yaTienen = 0;

foreach ($modelos as $modelo) {
    // Verificar si ya tiene preview en BD
    $tienePreview = DB::table('model_files')
        ->where('model_id', $modelo->id)
        ->where('file_type', 'preview')
        ->exists();
    
    if ($tienePreview) {
        $yaTienen++;
        continue;
    }
    
    // Crear carpeta del modelo si no existe
    $carpeta = storage_path("app/public/models/{$modelo->id}");
    if (!is_dir($carpeta)) {
        mkdir($carpeta, 0755, true);
    }
    
    // Nombre del archivo
    $nombreArchivo = "preview_" . time() . ".jpg";
    $rutaCompleta = "{$carpeta}/{$nombreArchivo}";
    
    // Crear una imagen simple con texto
    crearImagenPlaceholder($rutaCompleta, $modelo->name);
    
    // Insertar en model_files
    DB::table('model_files')->insert([
        'model_id' => $modelo->id,
        'file_url' => "/storage/models/{$modelo->id}/{$nombreArchivo}",
        'file_type' => 'preview',
        'created_at' => now(),
        'updated_at' => now()
    ]);
    
    echo "✅ Modelo {$modelo->id}: {$modelo->name} - Imagen creada\n";
    $creados++;
    
    // Pequeña pausa para no saturar
    usleep(100000);
}

echo "\n=== RESUMEN ===\n";
echo "Total modelos: " . count($modelos) . "\n";
echo "Ya tenían preview: $yaTienen\n";
echo "Imágenes creadas: $creados\n";

function crearImagenPlaceholder($ruta, $texto) {
    // Crear una imagen de 400x300
    $imagen = imagecreatetruecolor(400, 300);
    
    // Colores
    $fondo = imagecolorallocate($imagen, 37, 99, 235); // Azul primary
    $blanco = imagecolorallocate($imagen, 255, 255, 255);
    $gris = imagecolorallocate($imagen, 200, 200, 200);
    
    // Rellenar fondo
    imagefill($imagen, 0, 0, $fondo);
    
    // Dibujar un cubo simple
    imageline($imagen, 100, 100, 300, 100, $blanco);
    imageline($imagen, 100, 200, 300, 200, $blanco);
    imageline($imagen, 100, 100, 100, 200, $blanco);
    imageline($imagen, 300, 100, 300, 200, $blanco);
    
    // Agregar texto
    $textoCorto = strlen($texto) > 30 ? substr($texto, 0, 27) . '...' : $texto;
    
    // Usar fuente built-in (tamaño 5)
    $x = 50;
    $y = 250;
    
    imagestring($imagen, 5, $x, $y, "Modelo 3D", $blanco);
    imagestring($imagen, 3, $x, $y + 25, $textoCorto, $gris);
    
    // Guardar imagen
    imagejpeg($imagen, $ruta, 90);
    imagedestroy($imagen);
}

echo "\n✅ Proceso completado\n";