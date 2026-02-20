<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Model3D;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Listar reseñas de un modelo (público)
     */
    public function index($modelId)
    {
        $model = Model3D::find($modelId);

        if (!$model) {
            return response()->json([
                'message' => 'Modelo no encontrado'
            ], 404);
        }

        $reviews = Review::where('model_id', $modelId)
            ->with('user:id,name')
            ->select('id', 'user_id', 'rating', 'comment', 'created_at')
            ->latest()
            ->paginate(10);

        $stats = [
            'average_rating' => round($model->reviews()->avg('rating') ?? 0, 1),
            'total_reviews' => $model->reviews()->count(),
            'rating_distribution' => [
                5 => $model->reviews()->where('rating', 5)->count(),
                4 => $model->reviews()->where('rating', 4)->count(),
                3 => $model->reviews()->where('rating', 3)->count(),
                2 => $model->reviews()->where('rating', 2)->count(),
                1 => $model->reviews()->where('rating', 1)->count(),
            ]
        ];

        return response()->json([
            'model_id' => $modelId,
            'stats' => $stats,
            'reviews' => $reviews
        ]);
    }

    /**
     * Crear reseña (usuario autenticado)
     */
    public function store(Request $request, $modelId)
    {
        $model = Model3D::find($modelId);

        if (!$model) {
            return response()->json([
                'message' => 'Modelo no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();

        // Verificar si ya reseñó este modelo
        $existingReview = Review::where('user_id', $user->id)
            ->where('model_id', $modelId)
            ->first();

        if ($existingReview) {
            return response()->json([
                'message' => 'Ya has reseñado este modelo',
                'review' => $existingReview
            ], 409);
        }

        // Verificar si compró el modelo (opcional - política de negocio)
        $hasPurchased = $user->shopping()
            ->whereHas('models', function($q) use ($modelId) {
                $q->where('model_id', $modelId);
            })->exists();

        // Puedes requerir compra para reseñar
        // if (!$hasPurchased) {
        //     return response()->json([
        //         'message' => 'Debes comprar el modelo para poder reseñarlo'
        //     ], 403);
        // }

        $review = Review::create([
            'user_id' => $user->id,
            'model_id' => $modelId,
            'rating' => $request->rating,
            'comment' => $request->comment
        ]);

        return response()->json([
            'message' => 'Reseña creada exitosamente',
            'review' => $review->load('user:id,name')
        ], 201);
    }

    /**
     * Actualizar reseña (solo autor)
     */
    public function update(Request $request, $id)
    {
        $review = Review::with('user:id,name')->find($id);

        if (!$review) {
            return response()->json([
                'message' => 'Reseña no encontrada'
            ], 404);
        }

        // Verificar que sea el autor
        if ($review->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'No autorizado para editar esta reseña'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'sometimes|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $review->update($request->only(['rating', 'comment']));

        return response()->json([
            'message' => 'Reseña actualizada',
            'review' => $review->fresh('user:id,name')
        ]);
    }

    /**
     * Eliminar reseña (autor o admin)
     */
    public function destroy($id)
    {
        $review = Review::find($id);

        if (!$review) {
            return response()->json([
                'message' => 'Reseña no encontrada'
            ], 404);
        }

        $user = auth()->user();

        // Solo autor o admin pueden eliminar
        if ($review->user_id !== $user->id && $user->user_type !== 'admin') {
            return response()->json([
                'message' => 'No autorizado para eliminar esta reseña'
            ], 403);
        }

        $review->delete();

        return response()->json([
            'message' => 'Reseña eliminada correctamente'
        ]);
    }
}