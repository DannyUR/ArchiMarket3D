<?php

namespace App\Http\Controllers\Api;

use App\Models\Model3D;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class ImageController
{
    /**
     * Servir imagen de preview de un modelo
     */
    public function preview($modelId)
    {
        try {
            $model = Model3D::find($modelId);
            if(!$model) {
                return $this->generatePlaceholderResponse();
            }
            
            // Buscar archivo de preview (PNG primero, luego SVG)
            if($model->files && count($model->files) > 0) {
                $previewFile = $model->files()
                    ->where('file_type', 'preview')
                    ->first();
                
                if($previewFile && $previewFile->file_url) {
                    $filePath = storage_path('app/public') . $previewFile->file_url;
                    
                    if(File::exists($filePath)) {
                        $content = File::get($filePath);
                        $mimeType = $this->getMimeType($filePath);
                        
                        return response($content, 200)
                            ->header('Content-Type', $mimeType)
                            ->header('Cache-Control', 'public, max-age=31536000')
                            ->header('Pragma', 'public')
                            ->header('Access-Control-Allow-Origin', '*')
                            ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                            ->header('Access-Control-Allow-Headers', 'Content-Type');
                    }
                }
            }
            
            // Fallback: buscar PNG primero, luego JPG, luego SVG en el sistema de archivos
            $basePath = storage_path('app/public/models/' . $modelId);
            
            // Buscar PNG primero (desde Sketchfab)
            $pngPath = $basePath . '/preview.png';
            if(File::exists($pngPath)) {
                $content = File::get($pngPath);
                return response($content, 200)
                    ->header('Content-Type', 'image/png')
                    ->header('Cache-Control', 'public, max-age=31536000')
                    ->header('Pragma', 'public')
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type');
            }
            
            // Buscar JPG
            $jpgPath = $basePath . '/preview.jpg';
            if(File::exists($jpgPath)) {
                $content = File::get($jpgPath);
                return response($content, 200)
                    ->header('Content-Type', 'image/jpeg')
                    ->header('Cache-Control', 'public, max-age=31536000')
                    ->header('Pragma', 'public')
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type');
            }
            
            // Buscar SVG como fallback
            $svgPath = $basePath . '/preview.svg';
            if(File::exists($svgPath)) {
                $content = File::get($svgPath);
                return response($content, 200)
                    ->header('Content-Type', 'image/svg+xml')
                    ->header('Cache-Control', 'public, max-age=31536000')
                    ->header('Pragma', 'public')
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type');
            }
            
            // Si no hay nada, generar SVG por defecto
            return $this->generatePlaceholderResponse();
                
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error sirviendo imagen',
                'message' => $e->getMessage()
            ], 500)
            ->header('Access-Control-Allow-Origin', '*');
        }
    }
    
    /**
     * Generar SVG placeholder
     */
    private function generatePlaceholderResponse()
    {
        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
        </linearGradient>
    </defs>
    <rect width="300" height="300" fill="url(#grad)"/>
    <g transform="translate(150, 150)">
        <rect x="-50" y="-50" width="100" height="100" fill="none" stroke="white" stroke-width="2"/>
        <rect x="-35" y="-35" width="35" height="35" fill="none" stroke="white" stroke-width="2"/>
        <line x1="-50" y1="-50" x2="50" y2="50" stroke="white" stroke-width="1" opacity="0.5"/>
    </g>
</svg>
SVG;
        
        return response($svg, 200)
            ->header('Content-Type', 'image/svg+xml')
            ->header('Cache-Control', 'public, max-age=86400')
            ->header('Pragma', 'public')
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type');
    }
    
    /**
     * Determinar MIME type basado en extensión
     */
    private function getMimeType($filePath)
    {
        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $mimeTypes = [
            'svg' => 'image/svg+xml',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'webp' => 'image/webp'
        ];
        
        return $mimeTypes[$ext] ?? 'application/octet-stream';
    }
}

