<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Password as PasswordFacade;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;


class AuthController extends Controller
{
    /**
     * Registro de usuario
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)->mixedCase()->numbers()
            ],
            'user_type' => 'required|in:architect,engineer,company',
            'company' => 'nullable|string|max:255'
        ], [
            'password.min' => 'La contraseña debe tener al menos 8 caracteres',
            'password.mixed' => 'La contraseña debe incluir mayúsculas y minúsculas',
            'password.numbers' => 'La contraseña debe incluir al menos un número',
            'password.confirmed' => 'Las contraseñas no coinciden'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'user_type' => $request->user_type,
                'company' => $request->company,
                'is_active' => true
            ]);

            $user->sendEmailVerificationNotification();

            $token = $user->createToken('auth_token_' . $user->id, ['*'], now()->addDays(7))->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'user_type' => $user->user_type,
                        'company' => $user->company,
                        'is_active' => $user->is_active,
                        'created_at' => $user->created_at
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                    'expires_in' => 7 * 24 * 60 * 60 // 7 días en segundos
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Inicio de sesión
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        // Verificar si el usuario está activo
        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Tu cuenta está desactivada. Contacta al administrador.'
            ], 403);
        }

        // 👇 AGREGAR VERIFICACIÓN DE EMAIL
        if (is_null($user->email_verified_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Debes verificar tu email antes de iniciar sesión'
            ], 403);
        }

        // Revocar tokens anteriores (opcional - seguridad)
        if ($request->has('revoke_previous') && $request->revoke_previous) {
            $user->tokens()->delete();
        }

        $token = $user->createToken('auth_token_' . $user->id, ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Inicio de sesión exitoso',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'user_type' => $user->user_type,
                    'company' => $user->company,
                    'is_active' => $user->is_active,
                    'email_verified' => !is_null($user->email_verified_at)
                ],
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => 7 * 24 * 60 * 60,
                'permissions' => $this->getUserPermissions($user)
            ]
        ]);
    }

    /**
     * Obtener usuario autenticado
     */
    public function me(Request $request)
    {
        $user = $request->user()->load([
            'shopping' => function($q) {
                $q->latest()->limit(3);
            }
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'user_type' => $user->user_type,
                    'company' => $user->company,
                    'is_active' => $user->is_active,
                    'email_verified' => !is_null($user->email_verified_at),
                    'created_at' => $user->created_at,
                    'stats' => [
                        'purchases_count' => $user->shopping()->count(),
                        'reviews_count' => $user->reviews()->count()
                    ]
                ]
            ]
        ]);
    }

    /**
     * Cerrar sesión
     */
    public function logout(Request $request)
    {
        try {
            // Revocar token actual
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Sesión cerrada correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cerrar sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cerrar sesión en todos los dispositivos
     */
    public function logoutAllDevices(Request $request)
    {
        try {
            $request->user()->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Sesión cerrada en todos los dispositivos'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cerrar sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Refrescar token
     */
    public function refresh(Request $request)
    {
        $user = $request->user();
        
        // Revocar token actual
        $user->currentAccessToken()->delete();
        
        // Crear nuevo token
        $token = $user->createToken('auth_token_' . $user->id, ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Token refrescado',
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => 7 * 24 * 60 * 60
            ]
        ]);
    }

    /**
     * Enviar link de restablecimiento de contraseña
     */
    public function forgotPassword(Request $request)
{
    $validator = Validator::make($request->all(), [
        'email' => 'required|email|exists:users,email'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    try {
        $status = PasswordFacade::sendResetLink(
            $request->only('email')
        );

        // 👇 AGREGAR ESTO PARA VER QUÉ DEVUELVE
        \Log::info('Password reset status: ' . $status);

        if ($status === PasswordFacade::RESET_LINK_SENT) {
            return response()->json([
                'success' => true, 
                'message' => 'Hemos enviado un link de restablecimiento a tu email'
            ]);
        }

        // Si no es RESET_LINK_SENT, devolvemos el status
        return response()->json([
            'success' => false, 
            'message' => 'Error al enviar el link',
            'status' => $status  // 👈 VER QUÉ STATUS DEVUELVE
        ], 400);

    } catch (\Exception $e) {
        \Log::error('Password reset error: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Error del servidor: ' . $e->getMessage()
        ], 500);
    }
}

    /**
     * Restablecer contraseña
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email|exists:users,email',
            'password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $status = PasswordFacade::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        return $status === PasswordFacade::PASSWORD_RESET
            ? response()->json([
                'success' => true, 
                'message' => 'Contraseña restablecida correctamente'
            ])
            : response()->json([
                'success' => false, 
                'message' => 'Token inválido o expirado'
            ], 400);
    }

    /**
     * Enviar email de verificación
     */
    public function sendVerificationEmail(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Email ya verificado'
            ]);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'success' => true,
            'message' => 'Link de verificación enviado a tu email'
        ]);
    }

    /**
     * Verificar email
     */
    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false, 
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json([
                'success' => false, 
                'message' => 'Link de verificación inválido'
            ], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => true, 
                'message' => 'Email ya verificado'
            ]);
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        return response()->json([
            'success' => true, 
            'message' => 'Email verificado correctamente'
        ]);
    }

    /**
     * Obtener permisos del usuario
     */
    private function getUserPermissions($user)
    {
        $permissions = [
            'can_purchase' => true,
            'can_review' => true,
            'can_download' => false // Se verifica por compra
        ];

        if ($user->user_type === 'admin') {
            $permissions = array_merge($permissions, [
                'can_manage_models' => true,
                'can_manage_users' => true,
                'can_manage_categories' => true,
                'can_view_all_purchases' => true
            ]);
        }

        return $permissions;
    }

    /**
 * Mostrar formulario de reset (opcional - para el link del email)
 */
    public function showResetForm($token)
    {
        return response()->json([
            'reset_url' => url("/api/auth/reset-password?token={$token}")
        ]);
        // En una app real, esto podría redirigir a tu frontend
        // return redirect("http://localhost:3000/reset-password?token={$token}");
    }
}