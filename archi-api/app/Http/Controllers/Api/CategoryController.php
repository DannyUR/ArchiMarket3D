<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    /**
     * Listar todas las categorías (público)
     */
    public function index()
    {
        $categories = Category::withCount('models')
            ->orderBy('name')
            ->get()
            ->map(function($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'description' => $category->description,
                    'models_count' => $category->models_count,
                    'created_at' => $category->created_at->format('Y-m-d')
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $categories,
            'total' => $categories->count()
        ]);
    }

    /**
     * Mostrar categoría específica
     */
    public function show($id)
    {
        $category = Category::with([
                'models' => function($query) {
                    $query->select('id', 'name', 'price', 'format', 'size_mb', 'category_id', 'featured')
                          ->with(['files' => function($q) {
                              $q->where('file_type', 'preview')
                                ->select('id', 'model_id', 'file_url');
                          }])
                          ->latest();
                }
            ])
            ->select('id', 'name', 'description', 'created_at')
            ->find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Categoría no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $category->id,
                'name' => $category->name,
                'description' => $category->description,
                'created_at' => $category->created_at,
                'models' => $category->models,
                'total_models' => $category->models->count()
            ]
        ]);
    }

    /**
     * Obtener modelos de una categoría (endpoint específico)
     */
    public function models($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Categoría no encontrada'
            ], 404);
        }

        $models = $category->models()
            ->with(['files' => function($q) {
                $q->where('file_type', 'preview')
                  ->select('id', 'model_id', 'file_url');
            }])
            ->select('id', 'name', 'price', 'format', 'size_mb', 'featured', 'created_at')
            ->paginate(12);

        return response()->json([
            'success' => true,
            'category' => [
                'id' => $category->id,
                'name' => $category->name
            ],
            'data' => $models
        ]);
    }

    /**
     * Crear categoría (admin)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:categories,name',
            'description' => 'required|string|min:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $category = Category::create([
            'name' => $request->name,
            'description' => $request->description
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Categoría creada exitosamente',
            'data' => $category
        ], 201);
    }

    /**
     * Actualizar categoría (admin)
     */
    public function update(Request $request, $id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Categoría no encontrada'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100|unique:categories,name,' . $id,
            'description' => 'sometimes|string|min:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $category->update($request->only(['name', 'description']));

        return response()->json([
            'success' => true,
            'message' => 'Categoría actualizada',
            'data' => $category
        ]);
    }

    /**
     * Eliminar categoría (admin)
     */
    public function destroy($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Categoría no encontrada'
            ], 404);
        }

        if ($category->models()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar: la categoría tiene modelos asociados',
                'models_count' => $category->models()->count()
            ], 409);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Categoría eliminada correctamente'
        ]);
    }
}