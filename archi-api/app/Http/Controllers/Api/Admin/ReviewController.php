<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Model3D;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReviewController extends Controller
{
    /**
     * Obtener todas las reseñas para el admin
     */
    public function index(Request $request)
    {
        try {
            // Por defecto NO mostrar eliminadas, a menos que se especifique
            $query = Review::with(['user:id,name,email', 'model:id,name'])
                ->whereNull('deleted_at')
                ->orderBy('created_at', 'desc');

            // Filtros
            if ($request->has('status') && $request->status !== 'all') {
                if ($request->status === 'pending') {
                    $query->whereNull('approved_at')
                          ->whereNull('rejected_at');
                } elseif ($request->status === 'approved') {
                    $query->whereNotNull('approved_at');
                } elseif ($request->status === 'rejected') {
                    $query->whereNotNull('rejected_at');
                }
            }

            if ($request->has('rating') && $request->rating !== 'all') {
                $query->where('rating', $request->rating);
            }

            if ($request->has('reported') && $request->reported === 'true') {
                $query->where('reported', true);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereHas('user', function($userQuery) use ($search) {
                        $userQuery->where('name', 'LIKE', "%{$search}%")
                                  ->orWhere('email', 'LIKE', "%{$search}%");
                    })->orWhereHas('model', function($modelQuery) use ($search) {
                        $modelQuery->where('name', 'LIKE', "%{$search}%");
                    })->orWhere('comment', 'LIKE', "%{$search}%");
                });
            }

            $reviews = $query->paginate(15);

            // Mapear reviews para agregar el campo 'status' calculado
            $reviews->getCollection()->transform(function ($review) {
                $review->status = $this->determineStatus($review);
                $review->reply = $this->getReplyData($review);
                return $review;
            });

            // Calcular estadísticas
            $stats = [
                'total_reviews' => Review::count(),
                'average_rating' => round(Review::avg('rating') ?? 0, 1),
                'pending_moderation' => Review::whereNull('approved_at')->whereNull('rejected_at')->count(),
                'approved' => Review::whereNotNull('approved_at')->count(),
                'rejected' => Review::whereNotNull('rejected_at')->count(),
                'reported' => Review::where('reported', true)->count(),
                'rating_distribution' => [
                    5 => Review::where('rating', 5)->count(),
                    4 => Review::where('rating', 4)->count(),
                    3 => Review::where('rating', 3)->count(),
                    2 => Review::where('rating', 2)->count(),
                    1 => Review::where('rating', 1)->count(),
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'reviews' => $reviews,
                    'stats' => $stats
                ],
                'pagination' => [
                    'current_page' => $reviews->currentPage(),
                    'last_page' => $reviews->lastPage(),
                    'per_page' => $reviews->perPage(),
                    'total' => $reviews->total()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error en AdminReviewController@index: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener reseñas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Determinar el estado de una reseña
     */
    private function determineStatus($review)
    {
        if ($review->rejected_at !== null) {
            return 'rejected';
        } elseif ($review->approved_at !== null) {
            return 'approved';
        } else {
            return 'pending';
        }
    }

    /**
     * Obtener datos de respuesta si existen
     */
    private function getReplyData($review)
    {
        if ($review->admin_reply && $review->replied_at) {
            return [
                'text' => $review->admin_reply,
                'created_at' => $review->replied_at
            ];
        }
        return null;
    }


    /**
     * Aprobar una reseña
     */
    public function approve($id)
    {
        try {
            $review = Review::find($id);

            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reseña no encontrada'
                ], 404);
            }

            $review->approved_at = now();
            $review->rejected_at = null;
            $review->save();

            Log::info('Reseña aprobada', [
                'review_id' => $review->id,
                'admin_id' => auth('sanctum')->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reseña aprobada correctamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error al aprobar reseña: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al aprobar reseña',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rechazar una reseña
     */
    public function reject($id)
    {
        try {
            $review = Review::find($id);

            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reseña no encontrada'
                ], 404);
            }

            $review->rejected_at = now();
            $review->approved_at = null;
            $review->save();

            Log::info('Reseña rechazada', [
                'review_id' => $review->id,
                'admin_id' => auth('sanctum')->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reseña rechazada correctamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error al rechazar reseña: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al rechazar reseña',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Responder a una reseña
     */
    public function reply(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'reply' => 'required|string|max:1000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $review = Review::find($id);

            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reseña no encontrada'
                ], 404);
            }

            $review->admin_reply = $request->reply;
            $review->replied_at = now();
            $review->replied_by = auth('sanctum')->id();
            $review->save();

            Log::info('Respuesta a reseña', [
                'review_id' => $review->id,
                'admin_id' => auth('sanctum')->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Respuesta enviada correctamente',
                'data' => [
                    'reply' => [
                        'text' => $review->admin_reply,
                        'created_at' => $review->replied_at
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error al responder reseña: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al enviar respuesta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marcar/desmarcar como reportada
     */
    public function toggleReport($id)
    {
        try {
            $review = Review::find($id);

            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reseña no encontrada'
                ], 404);
            }

            $review->reported = !$review->reported;
            $review->save();

            return response()->json([
                'success' => true,
                'message' => $review->reported ? 'Reseña reportada' : 'Reporte removido',
                'reported' => $review->reported
            ]);

        } catch (\Exception $e) {
            Log::error('Error al toggle reporte: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado de reporte',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Soft-delete (mover a historial) una reseña
     */
    public function destroy(Request $request, $id)
    {
        try {
            $review = Review::withTrashed()->find($id);

            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reseña no encontrada'
                ], 404);
            }

            // Registrar quién eliminó y la razón
            $review->deleted_by = auth('sanctum')->id();
            $review->deletion_reason = $request->input('reason', 'Sin especificar');
            $review->save();
            
            // Realizar soft delete
            $review->delete();

            Log::info('Reseña movida a historial', [
                'review_id' => $id,
                'admin_id' => auth('sanctum')->id(),
                'reason' => $review->deletion_reason
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reseña movida al historial correctamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error al eliminar reseña: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar reseña',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ver historial de reseñas eliminadas
     */
    public function trash(Request $request)
    {
        try {
            $query = Review::withTrashed()
                ->whereNotNull('deleted_at')
                ->with(['user:id,name,email', 'model:id,name'])
                ->orderBy('deleted_at', 'desc');

            // Búsqueda
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereHas('user', function($userQuery) use ($search) {
                        $userQuery->where('name', 'LIKE', "%{$search}%")
                                  ->orWhere('email', 'LIKE', "%{$search}%");
                    })->orWhereHas('model', function($modelQuery) use ($search) {
                        $modelQuery->where('name', 'LIKE', "%{$search}%");
                    })->orWhere('comment', 'LIKE', "%{$search}%");
                });
            }

            $deletedReviews = $query->paginate(15);

            // Agregar info del admin que eliminó
            $deletedReviews->getCollection()->transform(function ($review) {
                $review->status = $this->determineStatus($review);
                $review->deleted_by_user = $review->deleted_by ? 
                    \App\Models\User::find($review->deleted_by) : null;
                return $review;
            });

            return response()->json([
                'success' => true,
                'data' => $deletedReviews,
                'pagination' => [
                    'current_page' => $deletedReviews->currentPage(),
                    'last_page' => $deletedReviews->lastPage(),
                    'per_page' => $deletedReviews->perPage(),
                    'total' => $deletedReviews->total()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener historial: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener historial de eliminados',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restaurar una reseña eliminada
     */
    public function restore($id)
    {
        try {
            $review = Review::withTrashed()
                ->where('id', $id)
                ->whereNotNull('deleted_at')
                ->first();

            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reseña eliminada no encontrada'
                ], 404);
            }

            $review->restore();
            $review->deleted_by = null;
            $review->deletion_reason = null;
            $review->save();

            Log::info('Reseña restaurada', [
                'review_id' => $id,
                'admin_id' => auth('sanctum')->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reseña restaurada correctamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error al restaurar reseña: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al restaurar reseña',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar permanentemente (hard delete) una reseña
     */
    public function forceDelete($id)
    {
        try {
            $review = Review::withTrashed()
                ->where('id', $id)
                ->first();

            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reseña no encontrada'
                ], 404);
            }

            // Guardar info antes de eliminar
            $reviewData = [
                'id' => $review->id,
                'model_name' => $review->model?->name,
                'user_email' => $review->user?->email,
                'rating' => $review->rating
            ];

            $review->forceDelete();

            Log::warning('Reseña eliminada permanentemente', [
                'review_data' => $reviewData,
                'admin_id' => auth('sanctum')->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reseña eliminada permanentemente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error al eliminar permanentemente: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar permanentemente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas detalladas
     */
    public function stats()
    {
        try {
            $now = now();
            $startOfMonth = $now->copy()->startOfMonth();
            $startOfYear = $now->copy()->startOfYear();

            $stats = [
                'total' => Review::count(),
                'average' => round(Review::avg('rating') ?? 0, 2),
                'this_month' => Review::where('created_at', '>=', $startOfMonth)->count(),
                'this_year' => Review::where('created_at', '>=', $startOfYear)->count(),
                'by_rating' => [
                    5 => Review::where('rating', 5)->count(),
                    4 => Review::where('rating', 4)->count(),
                    3 => Review::where('rating', 3)->count(),
                    2 => Review::where('rating', 2)->count(),
                    1 => Review::where('rating', 1)->count(),
                ],
                'by_status' => [
                    'pending' => Review::whereNull('approved_at')->whereNull('rejected_at')->count(),
                    'approved' => Review::whereNotNull('approved_at')->count(),
                    'rejected' => Review::whereNotNull('rejected_at')->count(),
                ],
                'reported' => Review::where('reported', true)->count(),
                'with_replies' => Review::whereNotNull('admin_reply')->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Error en stats de reseñas: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}