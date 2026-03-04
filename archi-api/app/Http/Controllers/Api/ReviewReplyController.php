<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\ReviewReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewReplyController extends Controller
{
    /**
     * Crear una respuesta a una reseña
     */
    public function store(Request $request, $reviewId)
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

        $validator = Validator::make($request->all(), [
            'comment' => 'required|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $reply = ReviewReply::create([
            'review_id' => $reviewId,
            'user_id' => $user->id,
            'comment' => $request->comment
        ]);

        return response()->json([
            'message' => 'Respuesta creada exitosamente',
            'reply' => $reply->load('user:id,name')
        ], 201);
    }

    /**
     * Obtener respuestas de una reseña
     */
    public function getReplies($reviewId)
    {
        $review = Review::find($reviewId);
        
        if (!$review) {
            return response()->json([
                'message' => 'Reseña no encontrada'
            ], 404);
        }

        $replies = $review->replies()
            ->with('user:id,name')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'review_id' => $reviewId,
            'replies_count' => $replies->count(),
            'replies' => $replies
        ]);
    }

    /**
     * Eliminar una respuesta
     */
    public function destroy($replyId)
    {
        $reply = ReviewReply::find($replyId);
        
        if (!$reply) {
            return response()->json([
                'message' => 'Respuesta no encontrada'
            ], 404);
        }

        $user = auth()->user();
        
        // Solo el autor o admin pueden eliminar
        if ($reply->user_id !== $user->id && $user->user_type !== 'admin') {
            return response()->json([
                'message' => 'No autorizado para eliminar esta respuesta'
            ], 403);
        }

        $reply->delete();

        return response()->json([
            'message' => 'Respuesta eliminada correctamente'
        ]);
    }

    /**
     * Actualizar una respuesta
     */
    public function update(Request $request, $replyId)
    {
        $reply = ReviewReply::find($replyId);
        
        if (!$reply) {
            return response()->json([
                'message' => 'Respuesta no encontrada'
            ], 404);
        }

        $user = auth()->user();
        
        // Solo el autor puede editar
        if ($reply->user_id !== $user->id) {
            return response()->json([
                'message' => 'No autorizado para editar esta respuesta'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'comment' => 'required|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $reply->update(['comment' => $request->comment]);

        return response()->json([
            'message' => 'Respuesta actualizada',
            'reply' => $reply->fresh('user:id,name')
        ]);
    }
}
