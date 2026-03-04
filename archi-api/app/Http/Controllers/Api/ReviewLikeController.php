<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\ReviewLike;
use App\Models\ReviewReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewLikeController extends Controller
{
    /**
     * Toggle like en una reseña
     */
    public function toggle($reviewId)
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Usuario no autenticado'
            ], 401);
        }

        $review = Review::find($reviewId);
        
        if (!$review) {
            return response()->json([
                'message' => 'Reseña no encontrada'
            ], 404);
        }

        // No permitir dar like a la propia reseña
        if ($review->user_id === $user->id) {
            return response()->json([
                'message' => 'No puedes dar like a tu propio comentario'
            ], 403);
        }

        // Verificar si ya existe el like
        $existingLike = ReviewLike::where('review_id', $reviewId)
            ->where('user_id', $user->id)
            ->first();

        if ($existingLike) {
            // Remover like
            $existingLike->delete();
            return response()->json([
                'message' => 'Like removido',
                'liked' => false,
                'likes_count' => $review->likes()->count()
            ]);
        } else {
            // Agregar like
            ReviewLike::create([
                'review_id' => $reviewId,
                'user_id' => $user->id
            ]);
            return response()->json([
                'message' => 'Like agregado',
                'liked' => true,
                'likes_count' => $review->likes()->count()
            ], 201);
        }
    }

    /**
     * Obtener likes de una reseña
     */
    public function getLikes($reviewId)
    {
        $review = Review::find($reviewId);
        
        if (!$review) {
            return response()->json([
                'message' => 'Reseña no encontrada'
            ], 404);
        }

        $likes = $review->likes()
            ->with('user:id,name')
            ->get();

        return response()->json([
            'success' => true,
            'review_id' => $reviewId,
            'likes_count' => $likes->count(),
            'likes' => $likes
        ]);
    }
}
