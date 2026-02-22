<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Obtener notificaciones del admin
     */
    public function index()
    {
        try {
            $adminId = auth()->id();
            
            $notifications = Notification::where('user_id', $adminId)
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $notifications // 👈 Esto devuelve { data: [], current_page, etc }
            ]);

        } catch (\Exception $e) {
            Log::error('Error cargando notificaciones: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar notificaciones'
            ], 500);
        }
    }

    /**
     * Obtener contador de no leídas
     */
    public function unreadCount()
    {
        try {
            $adminId = auth()->id();
            
            $count = Notification::where('user_id', $adminId)
                ->whereNull('read_at')
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'unread_count' => $count
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error obteniendo contador: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener contador'
            ], 500);
        }
    }

    /**
     * Marcar notificación como leída
     */
    public function markAsRead($id)
    {
        try {
            $notification = Notification::find($id);
            
            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notificación no encontrada'
                ], 404);
            }

            $notification->read_at = now();
            $notification->save();

            return response()->json([
                'success' => true,
                'message' => 'Notificación marcada como leída'
            ]);

        } catch (\Exception $e) {
            Log::error('Error marcando notificación: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al marcar notificación'
            ], 500);
        }
    }

    /**
     * Marcar todas como leídas
     */
    public function markAllAsRead()
    {
        try {
            $adminId = auth()->id();
            
            Notification::where('user_id', $adminId)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Todas las notificaciones marcadas como leídas'
            ]);

        } catch (\Exception $e) {
            Log::error('Error marcando todas: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al marcar notificaciones'
            ], 500);
        }
    }

    /**
     * Eliminar notificación
     */
    public function destroy($id)
    {
        try {
            $notification = Notification::find($id);
            
            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notificación no encontrada'
                ], 404);
            }

            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notificación eliminada'
            ]);

        } catch (\Exception $e) {
            Log::error('Error eliminando notificación: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar notificación'
            ], 500);
        }
    }
}