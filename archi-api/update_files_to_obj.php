<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

echo "=== GENERANDO ARCHIVOS 3D VÁLIDOS (OBJ) ===\n\n";

// Obtener modelos con archivos de descarga
$modelos = DB::table('models')
    ->join('model_files', 'models.id', '=', 'model_files.model_id')
    ->where('model_files.file_type', 'download')
    ->select('models.id', 'models.name', 'models.format')
    ->distinct()
    ->get();

$actualizado = 0;
$errores = 0;

foreach ($modelos as $modelo) {
    echo "Procesando modelo: {$modelo->name} (ID: {$modelo->id})...\n";
    
    try {
        // Obtener el archivo existente
        $file = DB::table('model_files')
            ->where('model_id', $modelo->id)
            ->where('file_type', 'download')
            ->first();
        
        if (!$file) {
            echo "  ✗ No se encontró archivo de descarga\n";
            $errores++;
            continue;
        }
        
        // Obtener ruta del archivo
        $rutaRelativa = str_replace('/storage/', '', $file->file_url);
        $rutaCompleta = storage_path("app/public/{$rutaRelativa}");
        
        // Crear directorio si no existe
        $directorio = dirname($rutaCompleta);
        if (!is_dir($directorio)) {
            mkdir($directorio, 0755, true);
        }
        
        // Crear un archivo OBJ válido con un cubo simple
        $objContent = generarCuboOBJ($modelo->name);
        
        // Cambiar extensión a .obj
        $rutaOBJ = preg_replace('/\.[^.]+$/', '.obj', $rutaCompleta);
        
        if (file_put_contents($rutaOBJ, $objContent) === false) {
            throw new Exception("No se pudo escribir el archivo OBJ");
        }
        
        // Actualizar en BD con la nueva ruta
        $nuevoNombre = basename($rutaOBJ);
        $nuevoPath = "/storage/" . str_replace(storage_path('app/public/'), '', $rutaOBJ);
        
        DB::table('model_files')
            ->where('id', $file->id)
            ->update([
                'file_url' => $nuevoPath,
                'updated_at' => now()
            ]);
        
        echo "  ✅ Archivo OBJ válido creado: {$nuevoNombre}\n";
        $actualizado++;
        
    } catch (Exception $e) {
        echo "  ✗ Error: {$e->getMessage()}\n";
        $errores++;
    }
}

echo "\n=== RESUMEN ===\n";
echo "Archivos actualizados a OBJ: {$actualizado}\n";
echo "Errores: {$errores}\n";

/**
 * Generar contenido OBJ de un cubo simple
 */
function generarCuboOBJ($nombre = "Model") {
    $nombre = str_replace([' ', '"', "'"], '', $nombre);
    
    $obj = "# Modelo 3D: {$nombre}\n";
    $obj .= "# Cubo de demostración\n";
    $obj .= "# Generado automáticamente para un modeloarquitectónico\n\n";
    
    // Vértices del cubo
    $obj .= "# Vértices\n";
    $vertices = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // Cara trasera
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]      // Cara delantera
    ];
    
    foreach ($vertices as $v) {
        $obj .= "v {$v[0]} {$v[1]} {$v[2]}\n";
    }
    
    // Normales
    $obj .= "\n# Normales\n";
    $normales = [
        [0, 0, -1], [0, 0, 1], [0, -1, 0], 
        [0, 1, 0], [-1, 0, 0], [1, 0, 0]
    ];
    
    foreach ($normales as $n) {
        $obj .= "vn {$n[0]} {$n[1]} {$n[2]}\n";
    }
    
    // Coordenadas de textura
    $obj .= "\n# Coordenadas de textura\n";
    $obj .= "vt 0 0\n";
    $obj .= "vt 1 0\n";
    $obj .= "vt 1 1\n";
    $obj .= "vt 0 1\n";
    
    // Caras (trianguladas)
    $obj .= "\n# Caras\n";
    $obj .= "f 1/1/1 2/2/1 3/3/1\n";
    $obj .= "f 1/1/1 3/3/1 4/4/1\n";
    $obj .= "f 5/1/2 8/2/2 7/3/2\n";
    $obj .= "f 5/1/2 7/3/2 6/4/2\n";
    $obj .= "f 1/1/3 5/2/3 6/3/3\n";
    $obj .= "f 1/1/3 6/3/3 2/4/3\n";
    $obj .= "f 4/1/4 3/2/4 7/3/4\n";
    $obj .= "f 4/1/4 7/3/4 8/4/4\n";
    $obj .= "f 1/1/5 4/2/5 8/3/5\n";
    $obj .= "f 1/1/5 8/3/5 5/4/5\n";
    $obj .= "f 2/1/6 6/2/6 7/3/6\n";
    $obj .= "f 2/1/6 7/3/6 3/4/6\n";
    
    return $obj;
}
