<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReviewReply;
use App\Models\ReviewReplyLike;
use Illuminate\Http\Request;

class ReviewReplyLikeController extends Controller
{
    /**
     * Toggle like en una respuesta
     */
    public function toggle($replyId)
    {
        $user = auth('sanctum')->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Usuario no autenticado'
            ], 401);
        }

        $reply = ReviewReply::find($replyId);
        
        if (!$reply) {
            return response()->json([
                'message' => 'Respuesta no encontrada'
            ], 404);
        }

        // No permitir dar like a la propia respuesta
        if ($reply->user_id === $user->id) {
            return response()->json([
                'message' => 'No puedes dar like a tu propia respuesta'
            ], 403);
        }

        // Verificar si ya existe el like
        $existingLike = ReviewReplyLike::where('reply_id', $replyId)
            ->where('user_id', $user->id)
            ->first();

        if ($existingLike) {
            // Remover like
            $existingLike->delete();
            return response()->json([
                'message' => 'Like removido',
                'liked' => false,
                'likes_count' => $reply->likes()->count()
            ]);
        } else {
            // Agregar like
            ReviewReplyLike::create([
                'reply_id' => $replyId,
                'user_id' => $user->id
            ]);
            return response()->json([
                'message' => 'Like agregado',
                'liked' => true,
                'likes_count' => $reply->likes()->count()
            ], 201);
        }
    }

    /**
     * Obtener likes de una respuesta
     */
    public function getLikes($replyId)
    {
        $reply = ReviewReply::find($replyId);
        
        if (!$reply) {
            return response()->json([
                'message' => 'Respuesta no encontrada'
            ], 404);
        }

        $likes = $reply->likes()
            ->with('user:id,name')
            ->get();

        return response()->json([
            'success' => true,
            'reply_id' => $replyId,
            'likes_count' => $likes->count(),
            'likes' => $likes
        ]);
    }
}
