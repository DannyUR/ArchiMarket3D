<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Services\GamificationService;

class UserController extends Controller
{
    /**
     * Obtener perfil del usuario autenticado
     */
    public function profile()
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                Log::warning('Intento de acceso a perfil sin autenticación');
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }
            
            Log::info('Cargando perfil de usuario', ['user_id' => $user->id, 'user_name' => $user->name]);
            
            $user->load([
                'shopping' => function($q) {
                    $q->withCount('models')
                      ->latest()
                      ->limit(5);
                },
                'reviews' => function($q) {
                    $q->with('model:id,name')
                      ->latest()
                      ->limit(5);
                }
            ]);

            // ✅ GAMIFICACIÓN: Obtener datos de gamificación del usuario
            $gamificationData = null;
            try {
                if (class_exists(GamificationService::class)) {
                    $gamificationData = GamificationService::getUserGamificationData($user);
                    Log::info('Datos de gamificación obtenidos', ['user_id' => $user->id]);
                } else {
                    Log::warning('GamificationService no existe');
                }
            } catch (\Exception $e) {
                Log::error('Error al obtener datos de gamificación: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'user_type' => $user->user_type,
                        'company' => $user->company,
                        'phone' => $user->phone,
                        'bio' => $user->bio,
                        'avatar' => $user->avatar,
                        'created_at' => $user->created_at,
                    ],
                    'stats' => [
                        'total_purchases' => $user->shopping()->count(),
                        'total_spent' => (float)$user->shopping()->sum('total'),
                        'total_reviews' => $user->reviews()->count(),
                        'avg_rating' => round($user->reviews()->avg('rating') ?? 0, 1)
                    ],
                    'recent_activity' => [
                        'purchases' => $user->shopping,
                        'reviews' => $user->reviews
                    ],
                    'gamification' => $gamificationData
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error general en profile: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener datos de gamificación del usuario
     */
    public function gamificationStats()
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                Log::warning('Intento de acceso a gamificación sin autenticación');
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }
            
            Log::info('Cargando gamificación para usuario', ['user_id' => $user->id]);
            
            if (!class_exists(GamificationService::class)) {
                Log::error('GamificationService no encontrado');
                return response()->json([
                    'success' => false,
                    'message' => 'Servicio de gamificación no disponible'
                ], 500);
            }
            
            $data = GamificationService::getUserGamificationData($user);
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error obteniendo gamificación: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener datos de gamificación: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener compras del perfil
     */
    public function profilePurchases()
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }
            
            $purchases = $user->shopping()
                ->with([
                    'models' => function($q) {
                        $q->select('models.id', 'models.name', 'models.price')
                          ->withPivot('unit_price');
                    }
                ])
                ->orderBy('purchase_date', 'desc')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $purchases
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error en profilePurchases: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar compras'
            ], 500);
        }
    }

    /**
     * Obtener reseñas del perfil
     */
    public function profileReviews()
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }
            
            $reviews = $user->reviews()
                ->with('model:id,name')
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $reviews
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error en profileReviews: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar reseñas'
            ], 500);
        }
    }

    /**
     * Actualizar perfil propio
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'company' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:20',
                'bio' => 'nullable|string|max:1000',
                'avatar' => 'nullable|string|max:500',
                'current_password' => 'required_with:new_password|string',
                'new_password' => 'nullable|string|min:8|confirmed'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Actualizar datos básicos
            if ($request->has('name')) {
                $user->name = $request->name;
            }

            if ($request->has('company')) {
                $user->company = $request->company;
            }

            if ($request->has('phone')) {
                $user->phone = $request->phone;
            }

            if ($request->has('bio')) {
                $user->bio = $request->bio;
            }

            if ($request->has('avatar')) {
                $user->avatar = $request->avatar;
            }

            // Cambiar contraseña
            if ($request->has('new_password')) {
                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'La contraseña actual es incorrecta'
                    ], 401);
                }

                $user->password = Hash::make($request->new_password);
            }

            $user->save();

            // ✅ GAMIFICACIÓN: Obtener datos actualizados después del cambio
            $gamificationData = null;
            try {
                if (class_exists(GamificationService::class)) {
                    $gamificationData = GamificationService::getUserGamificationData($user);
                }
            } catch (\Exception $e) {
                Log::warning('Error al obtener gamificación después de update: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Perfil actualizado',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'user_type' => $user->user_type,
                    'company' => $user->company,
                    'phone' => $user->phone,
                    'bio' => $user->bio,
                    'avatar' => $user->avatar,
                    'gamification' => $gamificationData
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error en updateProfile: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el perfil'
            ], 500);
        }
    }

    /**
     * Ver mis licencias (usuario autenticado)
     */
    public function myLicenses()
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }
            
            // ✅ MOSTRAR TODAS LAS LICENCIAS (activas e inactivas/pendientes)
            $licenses = $user->licenses()
                ->with(['model:id,name,format,description'])
                ->get()
                ->map(function($license) {
                    $expiresAt = $license->expires_at ? Carbon::parse($license->expires_at) : null;
                    $now = Carbon::now();
                    
                    return [
                        'id' => $license->id,
                        'license_type' => $license->license_type,
                        'price_paid' => (float)$license->price_paid,
                        'expires_at' => $license->expires_at,
                        'is_active' => (bool)$license->is_active,
                        'is_expired' => $expiresAt ? $now->gt($expiresAt) : false,
                        'model' => [
                            'id' => $license->model->id,
                            'name' => $license->model->name,
                            'format' => $license->model->format
                        ],
                        'purchase_date' => $license->created_at->format('Y-m-d H:i:s')
                    ];
                });
            
            Log::info('✅ Licencias retornadas:', [
                'user_id' => $user->id,
                'count' => $licenses->count()
            ]);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'licenses' => $licenses,
                    'total_active' => $licenses->count()
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error en myLicenses: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar licencias'
            ], 500);
        }
    }

    /**
     * Listar usuarios (admin)
     */
    public function index(Request $request)
    {
        try {
            $query = User::select(
                    'id', 'name', 'email', 'user_type', 'company', 'created_at', 'is_active'
                )
                ->withCount(['shopping', 'reviews']);

            // Filtros
            if ($request->has('user_type')) {
                $query->where('user_type', $request->user_type);
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->is_active);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%")
                      ->orWhere('company', 'LIKE', "%{$search}%");
                });
            }

            return response()->json([
                'success' => true,
                'data' => $query->paginate(15),
                'filters' => $request->all()
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error en index usuarios: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al listar usuarios'
            ], 500);
        }
    }

    /**
     * Mostrar usuario específico (admin)
     */
    public function show($id)
    {
        try {
            $user = User::with([
                    'shopping' => function($q) {
                        $q->withCount('models')->latest();
                    },
                    'reviews' => function($q) {
                        $q->with('model:id,name')->latest();
                    }
                ])
                ->select('id', 'name', 'email', 'user_type', 'company', 'created_at', 'is_active')
                ->find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            // ✅ GAMIFICACIÓN: Obtener datos de gamificación para admin
            $gamificationData = null;
            try {
                if (class_exists(GamificationService::class)) {
                    $gamificationData = GamificationService::getUserGamificationData($user);
                }
            } catch (\Exception $e) {
                Log::warning('Error al obtener gamificación para admin: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user,
                    'stats' => [
                        'total_purchases' => $user->shopping->count(),
                        'total_spent' => (float)$user->shopping->sum('total'),
                        'total_reviews' => $user->reviews->count(),
                        'avg_rating' => round($user->reviews->avg('rating') ?? 0, 1)
                    ],
                    'gamification' => $gamificationData
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error en show usuario: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al mostrar usuario'
            ], 500);
        }
    }

    /**
     * Actualizar rol (admin)
     */
    public function updateRole(Request $request, $id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'user_type' => 'required|in:architect,engineer,company,admin'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $oldRole = $user->user_type;
            $user->user_type = $request->user_type;
            $user->save();

            Log::info('Rol de usuario actualizado', [
                'admin_id' => auth()->id(),
                'user_id' => $user->id,
                'old_role' => $oldRole,
                'new_role' => $user->user_type
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Rol actualizado',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'old_role' => $oldRole,
                    'new_role' => $user->user_type
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error en updateRole: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar rol'
            ], 500);
        }
    }

    /**
     * Activar/desactivar usuario (admin)
     */
    public function toggleStatus($id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            if ($user->id === auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puedes desactivar tu propia cuenta'
                ], 409);
            }

            $user->is_active = !$user->is_active;
            $user->save();

            Log::info('Estado de usuario actualizado', [
                'admin_id' => auth()->id(),
                'user_id' => $user->id,
                'is_active' => $user->is_active
            ]);

            return response()->json([
                'success' => true,
                'message' => $user->is_active ? 'Usuario activado' : 'Usuario desactivado',
                'is_active' => $user->is_active
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error en toggleStatus: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado'
            ], 500);
        }
    }

    /**
     * Eliminar usuario (admin) - SOLO si no tiene compras
     */
    public function destroy($id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            if ($user->id === auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puedes eliminarte a ti mismo'
                ], 409);
            }

            // Verificar si tiene compras
            if ($user->shopping()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar: el usuario tiene compras asociadas',
                    'details' => [
                        'purchases_count' => $user->shopping()->count(),
                        'suggestion' => 'Puedes desactivar el usuario en su lugar'
                    ]
                ], 409);
            }

            // Verificar si tiene reseñas
            if ($user->reviews()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar: el usuario tiene reseñas',
                    'details' => [
                        'reviews_count' => $user->reviews()->count(),
                        'suggestion' => 'Puedes desactivar el usuario en su lugar'
                    ]
                ], 409);
            }

            // Verificar si tiene licencias
            if ($user->licenses()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar: el usuario tiene licencias activas',
                    'details' => [
                        'licenses_count' => $user->licenses()->count(),
                        'suggestion' => 'Puedes desactivar el usuario en su lugar'
                    ]
                ], 409);
            }

            $user->delete();
            
            Log::info('Usuario eliminado:', [
                'deleted_user_id' => $id, 
                'admin_id' => auth()->id()
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Usuario eliminado correctamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error eliminando usuario:', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function resetGamification()
    {
        $user = auth()->user();
        
        // Eliminar logros del usuario
        $user->achievements()->detach();
        
        // Resetear estadísticas
        $stats = $user->stats;
        if ($stats) {
            $stats->xp = 0;
            $stats->level = 1;
            $stats->total_purchases = 0;
            $stats->total_reviews = 0;
            $stats->total_likes_received = 0;
            $stats->save();
        }
        
        // Contar datos reales
        $totalPurchases = $user->shopping()->where('status', 'completed')->count();
        $totalReviews = $user->reviews()->count();
        $totalLikes = \App\Models\ReviewLike::whereHas('review', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })->count();
        
        // Calcular nuevo XP
        $newXp = ($totalPurchases * 100) + ($totalReviews * 20) + ($totalLikes * 5);
        $newLevel = floor($newXp / 100) + 1;
        
        // Guardar
        $stats = $user->stats;
        if (!$stats) {
            $stats = new \App\Models\UserStats();
            $stats->user_id = $user->id;
        }
        $stats->xp = $newXp;
        $stats->level = $newLevel;
        $stats->total_purchases = $totalPurchases;
        $stats->total_reviews = $totalReviews;
        $stats->total_likes_received = $totalLikes;
        $stats->save();
        
        // Verificar logros
        \App\Services\GamificationService::checkAchievements($user);
        
        return response()->json([
            'success' => true,
            'message' => 'Gamificación reseteada',
            'data' => \App\Services\GamificationService::getUserGamificationData($user)
        ]);
    }
}