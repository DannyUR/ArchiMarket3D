<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Model3D;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;


class ModelController extends Controller
{
    /**
     * Listar todos los modelos con filtros (público)
     */
    public function index(Request $request)
    {

        // IDs de categorías de arquitectura y construcción
        $allowedCategoryNames = [
            // ESTRUCTURALES
            'Estructuras de Acero',
            'Estructuras de Concreto',
            'Cimentaciones',
            'Elementos Portantes',
            // ARQUITECTURA
            'Arquitectura Residencial',
            'Arquitectura Comercial',
            'Fachadas y Cerramientos',
            'Cubiertas y Azoteas',
            // INSTALACIONES MEP
            'Sistemas Eléctricos',
            'Fontanería y Tuberías',
            'HVAC (Climatización)',
            'Protección Contra Incendios',
            // MOBILIARIO
            'Mobiliario de Oficina',
            'Mobiliario Residencial',
            'Mobiliario Urbano',
            'Equipamiento',
            // MAQUINARIA
            'Equipo Pesado',
            'Maquinaria Industrial',
            'Equipo de Construcción',
            // URBANISMO
            'Infraestructura Vial',
            'Espacios Públicos',
            'Paisajismo',
            'Redes de Servicio'
        ];
        $allowedCategoryIds = \App\Models\Category::whereIn('name', $allowedCategoryNames)->pluck('id')->toArray();

        $query = Model3D::with([
            'category:id,name',
            'files' => function($q) {
                $q->where('file_type', 'preview');
            }
        ])
        ->whereIn('category_id', $allowedCategoryIds)
        ->select(
            'id', 'name', 'description', 'price', 'format', 
            'size_mb', 'publication_date', 'category_id', 'featured', 
            'sketchfab_id', 'preview_url', 'embed_url', 'sketchfab_url'
        );

        // Filtros
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->has('format')) {
            $query->whereIn('format', explode(',', $request->format));
        }

        // Búsqueda
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Ordenamiento
        $sortField = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortField, $sortOrder);

        return response()->json([
            'success' => true,
            'data' => $query->paginate(12),
            'filters' => [
                'applied' => $request->all(),
                'available_formats' => Model3D::distinct('format')->pluck('format')
            ]
        ]);
    }

    /**
     * Búsqueda avanzada (endpoint específico)
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:2'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $query = $request->q;
        
        $results = Model3D::with('category:id,name')
            ->where('name', 'LIKE', "%{$query}%")
            ->orWhere('description', 'LIKE', "%{$query}%")
            ->orWhereHas('category', function($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%");
            })
            ->select('id', 'name', 'price', 'format', 'category_id')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'query' => $query,
            'total_results' => $results->count(),
            'data' => $results
        ]);
    }

    /**
     * Modelos destacados (para homepage)
     */
    public function featured()
    {
        $models = Model3D::with([
                'category:id,name',
                'files' => function($q) {
                    $q->where('file_type', 'preview')->select('id', 'model_id', 'file_url');
                }
            ])
            ->where('featured', true)
            ->select('id', 'name', 'price', 'format', 'category_id', 'sketchfab_id')
            ->latest()
            ->limit(8)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $models
        ]);
    }

    /**
     * Últimos modelos agregados
     */
    public function latest()
    {
        $models = Model3D::with([
                'category:id,name',
                'files' => function($q) {
                    $q->where('file_type', 'preview')->select('id', 'model_id', 'file_url');
                }
            ])
            ->select('id', 'name', 'price', 'format', 'category_id', 'created_at')
            ->latest()
            ->limit(12)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $models
        ]);
    }

    /**
     * Mostrar detalle completo de un modelo
     */
    public function show($id)
    {
        try {
            $model = Model3D::with([
                'category:id,name',
                'files:id,model_id,file_url,file_type',
                'licenses:id,model_id,type,description',
                'reviews' => function($q) {
                    $q->with('user:id,name')
                    ->latest()
                    ->limit(5);
                }
            ])
            ->select(
                'id', 'name', 'description', 'price', 'format', 
                'size_mb', 'publication_date', 'category_id', 'featured',
                'metadata', 'preview_url', 'embed_url', 'sketchfab_url',
                'author_name', 'author_avatar', 'author_bio'  // Estos ya están aquí
            )
            ->find($id);

            if (!$model) {
                return response()->json([
                    'success' => false,
                    'message' => 'Modelo no encontrado'
                ], 404);
            }

            $user = auth()->user();
            $isPurchased = false;
            $hasReviewed = false;

            if ($user) {
                $isPurchased = DB::table('shopping_details')
                    ->where('model_id', $id)
                    ->join('shopping', 'shopping.id', '=', 'shopping_details.shopping_id')
                    ->where('shopping.user_id', $user->id)
                    ->exists();
                    
                $hasReviewed = $model->reviews()
                    ->where('user_id', $user->id)
                    ->exists();
            }

            // Count avg rating manually
            $reviewsCount = $model->reviews()->count();
            $avgRating = 0;
            if ($reviewsCount > 0) {
                $avgRating = round($model->reviews()->avg('rating') ?? 0, 1);
            }

            // Count purchases
            $purchasesCount = DB::table('shopping_details')
                ->where('model_id', $id)
                ->join('shopping', 'shopping.id', '=', 'shopping_details.shopping_id')
                ->distinct('shopping_id')
                ->count('shopping_id');

            return response()->json([
                'success' => true,
                'data' => [
                    'model' => $model,
                    'author' => [
                        'name' => $model->author_name ?? 'ArchiMarket3D',
                        'avatar' => $model->author_avatar ?? null,
                        'bio' => $model->author_bio ?? 'Creador profesional de modelos 3D'
                    ],
                    'stats' => [
                        'average_rating' => $avgRating,
                        'total_reviews' => $reviewsCount,
                        'purchases_count' => $purchasesCount
                    ],
                    'access' => [
                        'can_download' => $isPurchased,
                        'can_preview' => true,
                        'can_review' => $isPurchased && !$hasReviewed
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error in ModelController::show - ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar el modelo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function adminIndex(Request $request)
    {
        // Usar la misma lógica de filtrado que index()
        $allowedCategoryNames = [
            // ESTRUCTURALES
            'Estructuras de Acero',
            'Estructuras de Concreto',
            'Cimentaciones',
            'Elementos Portantes',
            // ARQUITECTURA
            'Arquitectura Residencial',
            'Arquitectura Comercial',
            'Fachadas y Cerramientos',
            'Cubiertas y Azoteas',
            // INSTALACIONES MEP
            'Sistemas Eléctricos',
            'Fontanería y Tuberías',
            'HVAC (Climatización)',
            'Protección Contra Incendios',
            // MOBILIARIO
            'Mobiliario de Oficina',
            'Mobiliario Residencial',
            'Mobiliario Urbano',
            'Equipamiento',
            // MAQUINARIA
            'Equipo Pesado',
            'Maquinaria Industrial',
            'Equipo de Construcción',
            // URBANISMO
            'Infraestructura Vial',
            'Espacios Públicos',
            'Paisajismo',
            'Redes de Servicio'
        ];
        $allowedCategoryIds = \App\Models\Category::whereIn('name', $allowedCategoryNames)->pluck('id')->toArray();

        $query = Model3D::with([
            'category:id,name',
            'files' => function($q) {
                $q->where('file_type', 'preview');
            }
        ])
        ->whereIn('category_id', $allowedCategoryIds)
            ->select(
            'id', 'name', 'description', 'price', 'format', 
            'size_mb', 'publication_date', 'category_id', 'featured', 
            'sketchfab_id', 'preview_url', 'embed_url', 'sketchfab_url'
        );

        // Filtros opcionales (igual que index)
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }
        if ($request->has('format')) {
            $query->whereIn('format', explode(',', $request->format));
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }
        $sortField = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortField, $sortOrder);

        return response()->json([
            'success' => true,
            'data' => $query->get(),
            'filters' => [
                'applied' => $request->all(),
                'available_formats' => Model3D::distinct('format')->pluck('format')
            ]
        ]);
    }

    /**
     * Crear nuevo modelo (admin)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'format' => 'required|in:DWG,DXF,RVT,SKP,3DS,OBJ,FBX,IFC,DAE,GLTF,GLB,STL,3DM,PLN,3MF,BLEND',
            'size_mb' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'category_type' => 'nullable|in:estructural,arquitectura,instalaciones,mobiliario,maquinaria,urbanismo',
            'metadata' => 'nullable|array',
            'featured' => 'sometimes|boolean',
            'sketchfab_id' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $metadata = $request->metadata ?? [];
            $categoryType = $request->category_type ?? $this->determineCategoryType($request->category_id);

            $model = Model3D::create([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'format' => $request->format,
                'size_mb' => $request->size_mb,
                'category_id' => $request->category_id,
                'category_type' => $categoryType,
                'metadata' => $metadata,
                'featured' => $request->featured ?? false,
                'publication_date' => now(),
                'sketchfab_id' => $request->sketchfab_id
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Modelo creado exitosamente',
                'data' => $model->load('category:id,name')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el modelo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar modelo (admin)
     */
    public function update(Request $request, $id)
    {
        $model = Model3D::find($id);

        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Modelo no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'format' => 'sometimes|in:DWG,DXF,RVT,SKP,3DS,OBJ,FBX,IFC,DAE,GLTF,GLB,STL,3DM,PLN,3MF,BLEND',
            'size_mb' => 'sometimes|numeric|min:0',
            'category_id' => 'sometimes|exists:categories,id',
            'featured' => 'sometimes|boolean',
            'sketchfab_id' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $model->update($request->only([
            'name', 'description', 'price', 'format', 
            'size_mb', 'category_id', 'featured',
            'sketchfab_id'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Modelo actualizado',
            'data' => $model->fresh(['category:id,name'])
        ]);
    }

    /**
     * Marcar/desmarcar como destacado (admin)
     */
    public function toggleFeatured($id)
    {
        $model = Model3D::find($id);

        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Modelo no encontrado'
            ], 404);
        }

        $model->featured = !$model->featured;
        $model->save();

        return response()->json([
            'success' => true,
            'message' => $model->featured ? 'Modelo destacado' : 'Modelo quitado de destacados',
            'featured' => $model->featured
        ]);
    }

    /**
     * Eliminar modelo (admin)
     */
    public function destroy($id)
    {
        $model = Model3D::find($id);

        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Modelo no encontrado'
            ], 404);
        }

        try {
            DB::beginTransaction();
            
            // Verificar si tiene compras
            if ($model->shopping()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar: el modelo tiene compras asociadas'
                ], 409);
            }
            
            $model->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Modelo eliminado correctamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Determinar el tipo de categoría basado en el nombre de la categoría
     */
    private function determineCategoryType($categoryId)
    {
        $category = \App\Models\Category::find($categoryId);
        if (!$category) return null;

        $categoryName = strtolower($category->name);

        if (str_contains($categoryName, 'estructura') || str_contains($categoryName, 'acero') || 
            str_contains($categoryName, 'concreto') || str_contains($categoryName, 'cimentación') ||
            str_contains($categoryName, 'portante')) {
            return 'estructural';
        } elseif (str_contains($categoryName, 'arquitectura') || str_contains($categoryName, 'residencial') ||
                 str_contains($categoryName, 'comercial') || str_contains($categoryName, 'fachada') ||
                 str_contains($categoryName, 'cubierta')) {
            return 'arquitectura';
        } elseif (str_contains($categoryName, 'instalación') || str_contains($categoryName, 'eléctrico') ||
                 str_contains($categoryName, 'fontanería') || str_contains($categoryName, 'hvac') ||
                 str_contains($categoryName, 'incendio')) {
            return 'instalaciones';
        } elseif (str_contains($categoryName, 'mobiliario') || str_contains($categoryName, 'equipamiento')) {
            return 'mobiliario';
        } elseif (str_contains($categoryName, 'maquinaria') || str_contains($categoryName, 'equipo') ||
                 str_contains($categoryName, 'industria')) {
            return 'maquinaria';
        } elseif (str_contains($categoryName, 'urbanismo') || str_contains($categoryName, 'infraestructura') ||
                 str_contains($categoryName, 'vial') || str_contains($categoryName, 'espacio') ||
                 str_contains($categoryName, 'paisaje') || str_contains($categoryName, 'red')) {
            return 'urbanismo';
        }

        return null;
    }

    /**
     * Obtener metadatos requeridos según tipo de categoría
     */
    public function getMetadataSchema($categoryType)
    {
        $schemas = [
            'estructural' => [
                'material' => 'string',
                'resistencia' => 'string',
                'normativa' => 'string',
                'cargas' => 'string'
            ],
            'arquitectura' => [
                'area' => 'number',
                'altura' => 'number',
                'materiales' => 'string',
                'estilo' => 'string'
            ],
            'instalaciones' => [
                'diametro' => 'string',
                'presion' => 'string',
                'flujo' => 'string',
                'material' => 'string'
            ],
            'mobiliario' => [
                'dimensiones' => 'string',
                'material' => 'string',
                'peso' => 'string',
                'capacidad' => 'string'
            ],
            'maquinaria' => [
                'potencia' => 'string',
                'capacidad' => 'string',
                'dimensiones' => 'string',
                'ruido' => 'string'
            ]
        ];

        return $schemas[$categoryType] ?? [];
    }

        /**
     * Obtener la imagen preview de un modelo
     */
    public function previewImage($id)
    {
        try {
            $model = Model3D::with(['files' => function($q) {
                $q->where('file_type', 'preview');
            }])->find($id);

            if (!$model) {
                return response()->json(['error' => 'Modelo no encontrado'], 404);
            }

            if (!$model->files || $model->files->isEmpty()) {
                return response()->json(['error' => 'No hay imagen preview'], 404);
            }

            $file = $model->files->first();
            
            // Construir la ruta completa del archivo
            $filePath = str_replace('/storage/', '', $file->file_url);
            $fullPath = storage_path('app/public/' . $filePath);

            if (!file_exists($fullPath)) {
                \Log::error("Preview image not found: {$fullPath}");
                return response()->json(['error' => 'Archivo no encontrado'], 404);
            }

            // Determinar el content type según la extensión
            $extension = pathinfo($fullPath, PATHINFO_EXTENSION);
            $contentType = match($extension) {
                'jpg', 'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'gif' => 'image/gif',
                'svg' => 'image/svg+xml',
                default => 'image/jpeg'
            };

            return response()->file($fullPath, [
                'Content-Type' => $contentType,
                'Cache-Control' => 'public, max-age=86400'
            ]);

        } catch (\Exception $e) {
            \Log::error("Error en previewImage: " . $e->getMessage());
            return response()->json(['error' => 'Error al cargar la imagen'], 500);
        }
    }
}
