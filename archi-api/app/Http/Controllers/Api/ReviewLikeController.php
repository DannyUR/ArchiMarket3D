<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\ReviewLike;
use App\Models\ReviewReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\GamificationService; // ✅ GAMIFICACIÓN: Importar el servicio

class ReviewLikeController extends Controller
{
    /**
     * Toggle like en una reseña
     */
    public function toggle($reviewId)
    {
        $user = auth('sanctum')->user();
        
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
            
            // ✅ GAMIFICACIÓN: Cuando se remueve un like, NO se resta XP
            // (Para evitar que los usuarios abusen dando y quitando likes)
            \Log::info('Like removido - sin cambios en XP', [
                'review_owner_id' => $review->user_id,
                'user_who_liked' => $user->id,
                'review_id' => $reviewId
            ]);
            
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
            
            // ✅ GAMIFICACIÓN: Dar XP al dueño de la reseña por recibir like
            try {
                $reviewOwner = $review->user;
                if ($reviewOwner) {
                    GamificationService::recordLikeReceived($reviewOwner);
                    \Log::info('✅ Gamificación: Like registrado para el dueño de la reseña', [
                        'review_owner_id' => $reviewOwner->id,
                        'review_owner_name' => $reviewOwner->name,
                        'user_who_liked' => $user->id,
                        'review_id' => $reviewId
                    ]);
                }
            } catch (\Exception $gamifyError) {
                \Log::warning('⚠️ Error en gamificación al dar like (no afecta el like): ' . $gamifyError->getMessage());
            }
            
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