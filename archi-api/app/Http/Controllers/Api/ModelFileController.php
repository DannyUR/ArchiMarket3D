<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ModelFile;
use App\Models\Model3D;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ModelFileController extends Controller
{
    /**
     * Obtener previews de un modelo (público)
     */
    public function previews($modelId)
    {
        $model = Model3D::find($modelId);

        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Modelo no encontrado'
            ], 404);
        }

        $previews = $model->files()
            ->where('file_type', 'preview')
            ->select('id', 'file_url', 'created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $previews
        ]);
    }

    /**
     * Descargar archivo (requiere verificación de compra)
     */
    public function download($fileId)
    {
        $file = ModelFile::with('model')->find($fileId);

        if (!$file) {
            return response()->json([
                'success' => false,
                'message' => 'Archivo no encontrado'
            ], 404);
        }

        // Si es preview, cualquiera puede ver
        if ($file->file_type === 'preview') {
            return $this->serveFile($file);
        }

        // Si es download, verificar compra
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Debes iniciar sesión para descargar'
            ], 401);
        }

        $hasPurchased = $user->shopping()
            ->whereHas('models', function($q) use ($file) {
                $q->where('model_id', $file->model_id);
            })->exists();

        if (!$hasPurchased && $user->user_type !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'No has comprado este modelo'
            ], 403);
        }

        return $this->serveFile($file);
    }

    /**
     * Obtener formatos disponibles para un modelo
     */
    public function availableFormats($modelId)
    {
        $model = Model3D::find($modelId);

        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Modelo no encontrado'
            ], 404);
        }

        // Obtener todos los archivos de descarga para este modelo
        $files = $model->files()
            ->where('file_type', 'download')
            ->get(['id', 'file_url', 'format', 'size_bytes', 'created_at']);

        if ($files->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'No hay formatos disponibles para este modelo'
            ]);
        }

        // Formatear la respuesta
        $formats = $files->map(function($file) {
            return [
                'id' => $file->id,
                'format' => $file->format ?? strtoupper(pathinfo($file->file_url, PATHINFO_EXTENSION)),
                'size_bytes' => $file->size_bytes ?? 0,
                'size_mb' => round(($file->size_bytes ?? 0) / 1024 / 1024, 2),
                'file_url' => $file->file_url,
                'created_at' => $file->created_at
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formats,
            'count' => $formats->count()
        ]);
    }

    /**
     * Descargar modelo con selección de formato
     */
    public function downloadByFormat(Request $request, $modelId)
    {
        $format = strtoupper($request->query('format'));

        if (!$format) {
            return response()->json([
                'success' => false,
                'message' => 'Debes especificar un formato (format=GLB)'
            ], 422);
        }

        $model = Model3D::find($modelId);

        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Modelo no encontrado'
            ], 404);
        }

        // Verificar compra
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Debes iniciar sesión para descargar'
            ], 401);
        }

        $hasPurchased = $user->shopping()
            ->whereHas('models', function($q) use ($model) {
                $q->where('model_id', $model->id);
            })->exists();

        if (!$hasPurchased && $user->user_type !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'No has comprado este modelo'
            ], 403);
        }

        // Buscar el archivo con el formato solicitado
        $file = $model->files()
            ->where('file_type', 'download')
            ->where(function($q) use ($format) {
                $q->where('format', $format)
                  ->orWhere('format', strtolower($format));
            })
            ->first();

        if (!$file) {
            return response()->json([
                'success' => false,
                'message' => "Formato {$format} no disponible para este modelo"
            ], 404);
        }

        return $this->serveFile($file);
    }

    /**
     * Servir el archivo
     */
    private function serveFile($file)
    {
        $path = str_replace('/storage/', '', $file->file_url);
        
        if (!Storage::disk('public')->exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'Archivo no encontrado en el servidor'
            ], 404);
        }

        return Storage::disk('public')->download($path);
    }

    /**
     * Información pública sobre descargas (para mostrar ANTES de comprar)
     */
    public function downloadInfo($modelId)
    {
        $model = Model3D::find($modelId);

        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Modelo no encontrado'
            ], 404);
        }

        $files = $model->files()
            ->where('file_type', 'download')
            ->get(['format', 'size_bytes']);

        if ($files->isEmpty()) {
            return response()->json([
                'success' => true,
                'is_downloadable' => false,
                'available_formats' => [],
                'message' => 'Este modelo no tiene archivos disponibles para descargar'
            ]);
        }

        $totalSize = $files->sum('size_bytes');
        
        // Agrupar archivos por formato
        $formattedFiles = $files->groupBy('format')->map(function($group) {
            $size = $group->first()->size_bytes;
            return [
                'format' => $group->first()->format,
                'size_bytes' => $size,
                'size_mb' => round($size / 1024 / 1024, 2),
                'count' => $group->count()
            ];
        })->values();

        return response()->json([
            'success' => true,
            'is_downloadable' => true,
            'model_name' => $model->name,
            'available_formats' => $formattedFiles,
            'total_formats' => $formattedFiles->count(),
            'total_size_bytes' => $totalSize,
            'total_size_mb' => round($totalSize / 1024 / 1024, 2),
            'data' => [
                'available_formats' => $formattedFiles
            ]
        ]);
    }

    /**
     * Verificar si un modelo es descargable (simple sí/no)
     */
    public function isDownloadable($modelId)
    {
        $model = Model3D::find($modelId);

        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Modelo no encontrado'
            ], 404);
        }

        $hasDownloads = $model->files()
            ->where('file_type', 'download')
            ->exists();

        return response()->json([
            'success' => true,
            'is_downloadable' => $hasDownloads,
            'message' => $hasDownloads 
                ? 'Este modelo puede descargarse' 
                : 'Este modelo no está disponible para descargar'
        ]);
    }

    /**
     * Subir archivo (admin)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'model_id' => 'required|exists:models,id',
            'file' => 'required|file|max:102400', // 100MB
            'file_type' => 'required|in:preview,download,mixed_reality'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $model = Model3D::find($request->model_id);

        try {
            $uploadedFile = $request->file('file');
            $fileName = time() . '_' . uniqid() . '.' . $uploadedFile->getClientOriginalExtension();
            $filePath = $uploadedFile->storeAs('models/' . $model->id, $fileName, 'public');

            // Si es preview manual, eliminar previews automáticos previos
            if ($request->file_type === 'preview') {
                ModelFile::where('model_id', $model->id)
                    ->where('file_type', 'preview')
                    ->where(function($q){ $q->whereNull('origin')->orWhere('origin', 'sketchfab'); })
                    ->delete();
            }

            $modelFile = ModelFile::create([
                'model_id' => $model->id,
                'file_url' => Storage::url($filePath),
                'file_type' => $request->file_type,
                'origin' => $request->file_type === 'preview' ? 'manual' : null
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Archivo subido exitosamente',
                'data' => [
                    'id' => $modelFile->id,
                    'url' => $modelFile->file_url,
                    'type' => $modelFile->file_type,
                    'size' => $uploadedFile->getSize(),
                    'original_name' => $uploadedFile->getClientOriginalName()
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al subir archivo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Subir múltiples archivos (admin)
     */
    public function uploadMultiple(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'model_id' => 'required|exists:models,id',
            'files' => 'required|array|min:1',
            'files.*.file' => 'required|file|max:102400',
            'files.*.file_type' => 'required|in:preview,download,mixed_reality'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $model = Model3D::find($request->model_id);
        $uploadedFiles = [];

        try {
            foreach ($request->file('files') as $index => $fileData) {
                $file = $fileData['file'];
                $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('models/' . $model->id, $fileName, 'public');

                $modelFile = ModelFile::create([
                    'model_id' => $model->id,
                    'file_url' => Storage::url($filePath),
                    'file_type' => $fileData['file_type']
                ]);

                $uploadedFiles[] = [
                    'id' => $modelFile->id,
                    'url' => $modelFile->file_url,
                    'type' => $modelFile->file_type,
                    'original_name' => $file->getClientOriginalName()
                ];
            }

            return response()->json([
                'success' => true,
                'message' => count($uploadedFiles) . ' archivos subidos',
                'data' => $uploadedFiles
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al subir archivos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar metadata del archivo (admin)
     */
    public function update(Request $request, $id)
    {
        $file = ModelFile::find($id);

        if (!$file) {
            return response()->json([
                'success' => false,
                'message' => 'Archivo no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'file_type' => 'sometimes|in:preview,download,mixed_reality'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $file->update($request->only(['file_type']));

        return response()->json([
            'success' => true,
            'message' => 'Archivo actualizado',
            'data' => $file
        ]);
    }

    /**
     * Eliminar archivo (admin)
     */
    public function destroy($id)
    {
        $file = ModelFile::find($id);

        if (!$file) {
            return response()->json([
                'success' => false,
                'message' => 'Archivo no encontrado'
            ], 404);
        }

        try {
            // Eliminar archivo físico
            $path = str_replace('/storage/', '', $file->file_url);
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }

            $file->delete();

            return response()->json([
                'success' => true,
                'message' => 'Archivo eliminado correctamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar archivo',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}