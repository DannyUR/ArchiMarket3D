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
        $query = Model3D::with([
                'category:id,name',
                'files' => function($q) {
                    $q->where('file_type', 'preview')
                      ->select('id', 'model_id', 'file_url');
                }
            ])
            ->select(
                'id', 'name', 'description', 'price', 'format', 
                'size_mb', 'publication_date', 'category_id', 'featured'
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
            ->select('id', 'name', 'price', 'format', 'category_id')
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
        $model = Model3D::with([
                'category:id,name',
                'licenses:id,model_id,type,description',
                'files:id,model_id,file_url,file_type',
                'mixedReality:id,model_id,compatible,platform,notes',
                'reviews' => function($q) {
                    $q->with('user:id,name')
                      ->latest()
                      ->limit(5);
                }
            ])
            ->withAvg('reviews as average_rating', 'rating')
            ->withCount('reviews')
            ->find($id);

        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Modelo no encontrado'
            ], 404);
        }

        // Verificar si el usuario autenticado ya compró este modelo
        $user = auth()->user();
        $isPurchased = false;
        $canPreview = true;
        
        if ($user) {
            $isPurchased = $user->shopping()
                ->whereHas('models', function($q) use ($id) {
                    $q->where('model_id', $id);
                })->exists();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'model' => $model,
                'stats' => [
                    'average_rating' => round($model->average_rating ?? 0, 1),
                    'total_reviews' => $model->reviews_count,
                    'purchases_count' => $model->shopping()->count()
                ],
                'access' => [
                    'can_download' => $isPurchased,
                    'can_preview' => true,
                    'can_review' => $user && !$isPurchased ? false : true // Solo si compró puede reseñar
                ]
            ]
        ]);
    }

    public function adminIndex(Request $request)
    {
        $models = Model3D::with('category')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $models
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
            'featured' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $model = Model3D::create([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'format' => $request->format,
                'size_mb' => $request->size_mb,
                'category_id' => $request->category_id,
                'featured' => $request->featured ?? false,
                'publication_date' => now()
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
            'featured' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $model->update($request->only([
            'name', 'description', 'price', 'format', 
            'size_mb', 'category_id', 'featured'
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
}