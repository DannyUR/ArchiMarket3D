<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Obtener perfil del usuario autenticado
     */
    public function profile()
    {
        $user = auth()->user()->load([
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

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'user_type' => $user->user_type,
                'company' => $user->company,
                'created_at' => $user->created_at,
                'stats' => [
                    'total_purchases' => $user->shopping()->count(),
                    'total_spent' => $user->shopping()->sum('total'),
                    'total_reviews' => $user->reviews()->count(),
                    'avg_rating' => round($user->reviews()->avg('rating') ?? 0, 1)
                ],
                'recent_activity' => [
                    'purchases' => $user->shopping,
                    'reviews' => $user->reviews
                ]
            ]
        ]);
    }

    /**
     * Obtener compras del perfil
     */
    public function profilePurchases()
    {
        $user = auth()->user();
        
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
    }

    /**
     * Obtener reseñas del perfil
     */
    public function profileReviews()
    {
        $user = auth()->user();
        
        $reviews = $user->reviews()
            ->with('model:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    /**
     * Actualizar perfil propio
     */
    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'company' => 'nullable|string|max:255',
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

        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'user_type' => $user->user_type,
                'company' => $user->company
            ]
        ]);
    }

    /**
     * Ver mis licencias (usuario autenticado)
     * GET /api/my-licenses
     */
    public function myLicenses()
    {
        $user = auth()->user();
        
        $licenses = $user->licenses()
            ->with([
                'model:id,name,format,description',
                'shopping'
            ])
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($license) {
                return [
                    'id' => $license->id,
                    'license_type' => $license->license_type,
                    'price_paid' => $license->price_paid,
                    'expires_at' => $license->expires_at,
                    'is_active' => $license->is_active,
                    'is_expired' => $license->expires_at ? now()->gt($license->expires_at) : false,
                    'model' => [
                        'id' => $license->model->id,
                        'name' => $license->model->name,
                        'format' => $license->model->format
                    ],
                    'purchase_date' => $license->shopping->purchase_date ?? null,
                    'created_at' => $license->created_at
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'total_licenses' => $licenses->count(),
                'active_licenses' => $licenses->where('is_expired', false)->count(),
                'licenses' => $licenses
            ]
        ]);
    }

    /**
     * Listar usuarios (admin)
     */
    public function index(Request $request)
    {
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
    }

    /**
     * Mostrar usuario específico (admin)
     */
    public function show($id)
    {
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

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'stats' => [
                    'total_purchases' => $user->shopping->count(),
                    'total_spent' => $user->shopping->sum('total'),
                    'total_reviews' => $user->reviews->count(),
                    'avg_rating' => round($user->reviews->avg('rating') ?? 0, 1)
                ]
            ]
        ]);
    }

    /**
     * Actualizar rol (admin)
     */
    public function updateRole(Request $request, $id)
    {
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
    }

    /**
     * Activar/desactivar usuario (admin)
     */
    public function toggleStatus($id)
    {
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

        return response()->json([
            'success' => true,
            'message' => $user->is_active ? 'Usuario activado' : 'Usuario desactivado',
            'is_active' => $user->is_active
        ]);
    }

    /**
     * Eliminar usuario (admin)
     */
    public function destroy($id)
    {
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

        if ($user->shopping()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar: el usuario tiene compras',
                'purchases_count' => $user->shopping()->count()
            ], 409);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Usuario eliminado correctamente'
        ]);
    }
}