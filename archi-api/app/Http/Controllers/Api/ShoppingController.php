<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shopping;
use App\Models\ShoppingDetail;
use App\Models\Model3D;
use App\Models\ModelFile;
use App\Models\UserLicense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use App\Events\NewPurchase;
use App\Events\NewUserRegistered;
use App\Helpers\NotificationHelper;
use App\Services\PayPalService;
use App\Services\GamificationService;
use App\Notifications\PurchaseConfirmation;


class ShoppingController extends Controller
{
    /**
     * Listar compras del usuario autenticado
     */
    public function index()
    {
        $user = auth()->user();
        
        $purchases = Shopping::where('user_id', $user->id)
            ->with([
                'models' => function($q) {
                    $q->select('models.id', 'models.name', 'models.price', 'models.format')
                      ->withPivot('unit_price')
                      ->with(['files' => function($f) {
                          $f->where('file_type', 'preview')
                            ->select('id', 'model_id', 'file_url');
                      }]);
                }
            ])
            ->orderBy('purchase_date', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $purchases,
            'stats' => [
                'total_spent' => $user->shopping()->sum('total'),
                'total_purchases' => $user->shopping()->count()
            ]
        ]);
    }

    /**
     * Mostrar detalle de una compra específica
     */
    public function show($id)
    {
        $purchase = Shopping::with([
                'user:id,name,email',
                'models' => function($q) {
                    $q->select('models.id', 'models.name', 'models.format', 'models.size_mb')
                      ->withPivot('unit_price')
                      ->with(['files' => function($f) {
                          $f->select('id', 'model_id', 'file_url', 'file_type');
                      }]);
                }
            ])
            ->find($id);

        if (!$purchase) {
            return response()->json([
                'success' => false,
                'message' => 'Compra no encontrada'
            ], 404);
        }

        // Verificar que sea el dueño o admin
        if ($purchase->user_id !== auth()->id() && auth()->user()->user_type !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $purchase
        ]);
    }

    /**
     * Realizar una compra (checkout) - MODO DEMO
     */
    public function store(Request $request)
    {
        \Log::info('=== INICIO CHECKOUT ===');
        \Log::info('Request:', $request->all());
        
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.model_id' => 'required|exists:models,id',
            'items.*.license_type' => 'required|in:personal,business,unlimited'
        ]);

        if ($validator->fails()) {
            \Log::error('Validación falló:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        \Log::info('Usuario ID: ' . $user->id);

        try {
            DB::beginTransaction();

            $total = 0;
            $items = [];
            $purchasedModels = [];

            foreach ($request->items as $item) {
                $model = Model3D::find($item['model_id']);
                \Log::info('Procesando modelo:', [
                    'id' => $model->id,
                    'name' => $model->name,
                    'price_base' => $model->price
                ]);

                // Verificar si ya lo compró antes
                $alreadyPurchased = $user->licenses()
                    ->where('model_id', $model->id)
                    ->where('is_active', true)
                    ->exists();

                if ($alreadyPurchased) {
                    throw new \Exception("El modelo '{$model->name}' ya fue comprado");
                }

                $licensePrice = $this->calculateLicensePrice($model->price, $item['license_type']);
                \Log::info('Precio calculado:', [
                    'license_type' => $item['license_type'],
                    'price' => $licensePrice
                ]);
                
                $items[] = [
                    'model' => $model,
                    'unit_price' => $licensePrice,
                    'license_type' => $item['license_type']
                ];
                
                $total += $licensePrice;
                $purchasedModels[] = $model->name;
            }

            // Crear la compra
            $shopping = Shopping::create([
                'user_id' => $user->id,
                'purchase_date' => now(),
                'total' => $total,
                'status' => 'completed',
                'payment_id' => 'demo_' . uniqid(),
                'payment_provider' => 'demo'
            ]);
            \Log::info('Compra creada ID: ' . $shopping->id);

            // Crear detalles y licencias
            foreach ($items as $item) {
                // Detalle de compra
                ShoppingDetail::create([
                    'shopping_id' => $shopping->id,
                    'model_id' => $item['model']->id,
                    'unit_price' => $item['unit_price']
                ]);
                \Log::info('Detalle creado para modelo: ' . $item['model']->id);

                // ✅ REGISTRAR LA LICENCIA
                $license = UserLicense::create([
                    'user_id' => $user->id,
                    'model_id' => $item['model']->id,
                    'shopping_id' => $shopping->id,
                    'license_type' => $item['license_type'],
                    'price_paid' => $item['unit_price'],
                    'expires_at' => $this->getLicenseExpiration($item['license_type']),
                    'is_active' => true
                ]);
                \Log::info('Licencia creada ID: ' . $license->id);
            }

            DB::commit();
            NotificationHelper::newPurchase($shopping, $user);
            event(new NewPurchase($shopping, $user));
            
            // ✅ GAMIFICACIÓN: Registrar la compra para XP y logros
            try {
                GamificationService::recordPurchase($user);
                \Log::info('✅ Gamificación: Compra registrada para usuario ' . $user->id);
            } catch (\Exception $gamifyError) {
                \Log::warning('⚠️ Error en gamificación (no afecta compra): ' . $gamifyError->getMessage());
            }
            
            \Log::info('=== CHECKOUT EXITOSO ===');

            return response()->json([
                'success' => true,
                'message' => 'Compra realizada exitosamente',
                'data' => [
                    'purchase_id' => $shopping->id,
                    'total' => $total,
                    'purchased_models' => $purchasedModels
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('ERROR EN CHECKOUT: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la compra',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Obtener links de descarga para una compra
     */
    public function downloadLinks($id)
    {
        $purchase = Shopping::with('models.files')
            ->where('user_id', auth()->id())
            ->find($id);

        if (!$purchase) {
            return response()->json([
                'success' => false,
                'message' => 'Compra no encontrada'
            ], 404);
        }

        $downloads = [];
        foreach ($purchase->models as $model) {
            foreach ($model->files as $file) {
                if ($file->file_type === 'download') {
                    $downloads[] = [
                        'model_name' => $model->name,
                        'file_id' => $file->id,
                        'file_name' => basename($file->file_url),
                        'download_url' => url("/api/download/{$file->id}"),
                        'expires_at' => now()->addHours(24)->toDateTimeString()
                    ];
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => $downloads
        ]);
    }

    /**
     * Calcular precio según tipo de licencia
     */
    private function calculateLicensePrice($basePrice, $licenseType)
    {
        $multipliers = [
            'personal' => 1.0,
            'business' => 2.5,
            'unlimited' => 5.0
        ];

        return round($basePrice * ($multipliers[$licenseType] ?? 1.0), 2);
    }

    private function getLicenseExpiration($licenseType)
    {
        return match($licenseType) {
            'personal' => now()->addYear(),
            'business' => now()->addYears(3),
            'unlimited' => null,
            default => now()->addYear()
        };
    }

    /**
     * Generar links temporales para descarga inmediata
     */
    private function generateTempDownloadLinks($items)
    {
        $links = [];
        foreach ($items as $item) {
            foreach ($item['model']->files as $file) {
                if ($file->file_type === 'download') {
                    $links[] = [
                        'model' => $item['model']->name,
                        'file_id' => $file->id,
                        'url' => url("/api/download/{$file->id}"),
                        'expires' => now()->addHours(24)->toDateTimeString()
                    ];
                }
            }
        }
        return $links;
    }

    /**
     * Simular webhook de pago (para pruebas)
     */
    public function simulatePayment($shoppingId)
    {
        $shopping = Shopping::find($shoppingId);
        
        if (!$shopping) {
            return response()->json(['error' => 'Compra no encontrada'], 404);
        }

        // Simular que el pago fue exitoso
        $shopping->status = 'completed';
        $shopping->payment_id = 'demo_' . uniqid();
        $shopping->payment_provider = 'demo';
        $shopping->save();

        // Activar licencias
        UserLicense::where('shopping_id', $shopping->id)
            ->update(['is_active' => true]);

        // ✅ GAMIFICACIÓN: Registrar la compra para XP y logros
        try {
            $user = $shopping->user;
            if ($user) {
                GamificationService::recordPurchase($user);
                \Log::info('✅ Gamificación: Compra registrada para usuario ' . $user->id);
            }
        } catch (\Exception $gamifyError) {
            \Log::warning('⚠️ Error en gamificación: ' . $gamifyError->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Pago simulado correctamente'
        ]);
    }

    /**
     * Procesar pago (separado de la compra)
     */
    public function processPayment(Request $request, $shoppingId)
    {
        try {
            $shopping = Shopping::find($shoppingId);
            
            if (!$shopping) {
                return response()->json(['error' => 'Compra no encontrada'], 404);
            }

            // Aquí iría la lógica real de pago con Stripe/PayPal
            // Por ahora es simulado
            
            $shopping->status = 'completed';
            $shopping->payment_id = 'pay_' . uniqid();
            $shopping->payment_provider = 'stripe';
            $shopping->save();

            // ✅ DISPARAR EVENTO DE PAGO AQUÍ
            event(new PaymentProcessed($shopping));
            
            // ✅ GAMIFICACIÓN: Registrar la compra para XP y logros
            try {
                $user = $shopping->user;
                if ($user) {
                    GamificationService::recordPurchase($user);
                    \Log::info('✅ Gamificación: Compra registrada para usuario ' . $user->id);
                }
            } catch (\Exception $gamifyError) {
                \Log::warning('⚠️ Error en gamificación: ' . $gamifyError->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Pago procesado correctamente'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error procesando pago: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el pago'
            ], 500);
        }
    }

    /**
     * Crear orden de PayPal
     */
    public function createPayPalOrder(Request $request)
    {
        try {
            \Log::info('=== CREAR ORDEN PAYPAL ===');
            \Log::info('Request all data:', $request->all());
            
            $validator = Validator::make($request->all(), [
                'items' => 'required|array|min:1',
                'items.*.model_id' => 'required|integer|exists:models,id',
                'items.*.license_type' => 'required|string|in:personal,business,unlimited'
            ]);

            if ($validator->fails()) {
                $errors = $validator->errors()->toArray();
                \Log::error('Validation failed:', $errors);
                \Log::error('Items received:', ['items' => $request->input('items')]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'La validación falló. Verifica que todos los productos tengan un tipo de licencia válido.',
                    'errors' => $errors,
                    'received_data' => [
                        'items' => $request->input('items'),
                        'items_count' => count($request->input('items', []))
                    ]
                ], 422);
            }

            $user = auth()->user();
            $total = 0;
            $items = [];

            // Verificar que no hay modelos duplicados en el mismo carrito
            $modelIds = array_column($request->items, 'model_id');
            $duplicates = array_diff_assoc($modelIds, array_unique($modelIds));
            
            if (!empty($duplicates)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puedes agregar el mismo modelo múltiples veces en una compra. Por favor, elige una sola licencia por modelo.'
                ], 422);
            }

            // Calcular total y validar
            foreach ($request->items as $item) {
                $model = Model3D::find($item['model_id']);
                
                // Verificar si ya lo compró
                $alreadyPurchased = $user->licenses()
                    ->where('model_id', $model->id)
                    ->where('is_active', true)
                    ->exists();

                if ($alreadyPurchased) {
                    return response()->json([
                        'success' => false,
                        'message' => "El modelo '{$model->name}' ya fue comprado"
                    ], 400);
                }

                $price = $this->calculateLicensePrice($model->price, $item['license_type']);
                $total += $price;
                $items[] = $item;
            }

            DB::beginTransaction();

            // Crear compra temporal (pending)
            $shopping = Shopping::create([
                'user_id' => $user->id,
                'purchase_date' => now(),
                'total' => $total,
                'status' => 'pending',
                'payment_provider' => 'paypal'
            ]);

            // Crear detalles y licencias (pero inactivas)
            foreach ($items as $item) {
                $model = Model3D::find($item['model_id']);
                $price = $this->calculateLicensePrice($model->price, $item['license_type']);

                ShoppingDetail::create([
                    'shopping_id' => $shopping->id,
                    'model_id' => $model->id,
                    'unit_price' => $price
                ]);

                UserLicense::create([
                    'user_id' => $user->id,
                    'model_id' => $model->id,
                    'shopping_id' => $shopping->id,
                    'license_type' => $item['license_type'],
                    'price_paid' => $price,
                    'expires_at' => $this->getLicenseExpiration($item['license_type']),
                    'is_active' => false
                ]);
            }

            DB::commit();

            $returnUrl = $request->input('return_url');
            $cancelUrl = $request->input('cancel_url');

            if (!$returnUrl) {
                // 🔥 CAMBIO IMPORTANTE: Debe apuntar a tu BACKEND
                $returnUrl = url('/api/shopping/execute-paypal-payment');
            }
            if (!$cancelUrl) {
                $cancelUrl = 'archimarket3d://checkout';
            }

            // Añadir el shopping_id a las URLs para que el frontend lo reciba al regresar desde PayPal
            try {
                $returnSeparator = parse_url($returnUrl, PHP_URL_QUERY) ? '&' : '?';
                $returnUrl = $returnUrl . $returnSeparator . 'shopping_id=' . $shopping->id;

                $cancelSeparator = parse_url($cancelUrl, PHP_URL_QUERY) ? '&' : '?';
                $cancelUrl = $cancelUrl . $cancelSeparator . 'shopping_id=' . $shopping->id;
            } catch (\Exception $urlEx) {
                \Log::warning('No se pudo anexar shopping_id a las URLs: ' . $urlEx->getMessage());
            }

            \Log::info('📊 PARÁMETROS QUE ENVÍO A PAYPAL:', [
                'shopping_id' => $shopping->id,
                'total' => $total,
                'items_count' => count($items),
                'returnUrl' => $returnUrl,
                'cancelUrl' => $cancelUrl
            ]);
            
            $paypalService = app(\App\Services\PayPalService::class);
            
            $result = $paypalService->createOrder(
                $shopping->id,
                $total,
                $items,
                $returnUrl,
                $cancelUrl,
                ['shopping_id' => $shopping->id]
            );

            if (!$result['success']) {
                throw new \Exception($result['message']);
            }

            $shopping->paypal_order_id = $result['payment_id'];
            $shopping->save();

            \Log::info('✅ Orden PayPal creada', ['payment_id' => $result['payment_id']]);

            return response()->json([
                'success' => true,
                'payment_id' => $result['payment_id'],
                'approval_url' => $result['approval_url'],
                'shopping_id' => $shopping->id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('❌ Error en createPayPalOrder: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la orden de pago',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ejecutar pago de PayPal (callback después del pago)
     * Esta función es llamada por PayPal después de que el usuario paga
     */
    public function executePayPalPayment(Request $request)
    {
        try {
            \Log::info('=== EJECUTAR PAGO PAYPAL (CALLBACK) ===');
            \Log::info('Todos los parámetros recibidos:', $request->all());
            
            // PayPal devuelve: paymentId, PayerID
            $paymentId = $request->query('paymentId');
            $payerId = $request->query('PayerID');
            $shoppingId = $request->query('shopping_id');
            
            \Log::info('Parámetros:', [
                'paymentId' => $paymentId,
                'payerId' => $payerId,
                'shoppingId' => $shoppingId
            ]);
            
            // Buscar la compra
            $shopping = null;
            if ($shoppingId) {
                $shopping = Shopping::find($shoppingId);
            }
            
            if (!$shopping && $paymentId) {
                $shopping = Shopping::where('paypal_order_id', $paymentId)->first();
            }
            
            if (!$shopping) {
                $user = auth()->user();
                if ($user) {
                    $shopping = Shopping::where('user_id', $user->id)
                        ->where('status', 'pending')
                        ->latest()
                        ->first();
                }
            }
            
            if (!$shopping) {
                throw new \Exception('Compra no encontrada');
            }
            
            \Log::info('Compra encontrada:', [
                'id' => $shopping->id,
                'status' => $shopping->status
            ]);
            
            // Si ya está completada, redirigir según plataforma
            if ($shopping->status === 'completed') {
                \Log::info('⚠️ La compra ya estaba completada');
                return $this->redirectAfterPayment($shopping->id, $request);
            }
            
            DB::beginTransaction();
            
            // Verificar el pago con PayPal
            $paypalService = app(PayPalService::class);
            $result = $paypalService->executePayment($paymentId, $payerId);
            
            if (!$result['success']) {
                throw new \Exception('PayPal no validó el pago: ' . $result['message']);
            }
            
            \Log::info('✅ PayPal validó el pago');
            
            // Actualizar compra
            $shopping->status = 'completed';
            $shopping->payment_id = $paymentId;
            $shopping->paid_at = now();
            $shopping->save();
            
            \Log::info('✅ Compra actualizada a completed', ['shopping_id' => $shopping->id]);
            
            // Activar licencias
            $updated = UserLicense::where('shopping_id', $shopping->id)
                ->update(['is_active' => true, 'activated_at' => now()]);
            
            \Log::info('✅ Licencias activadas', ['count' => $updated]);
            
            DB::commit();
            
            // Cargar relaciones para el correo
            $shopping->load('models');
            $user = $shopping->user;
            
            // Enviar correo de confirmación
            $this->sendPurchaseConfirmation($shopping, $user);
            
            // Gamificación
            try {
                if ($user) {
                    GamificationService::recordPurchase($user);
                    \Log::info('✅ Gamificación registrada');
                }
            } catch (\Exception $e) {
                \Log::warning('⚠️ Error en gamificación: ' . $e->getMessage());
            }
            
            // Disparar eventos
            try {
                NotificationHelper::newPurchase($shopping, $user);
                event(new NewPurchase($shopping, $user));
            } catch (\Exception $e) {
                \Log::warning('⚠️ Error en eventos: ' . $e->getMessage());
            }
            
            // 🔥 REDIRIGIR SEGÚN LA PLATAFORMA
            return $this->redirectAfterPayment($shopping->id, $request);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('❌ Error en executePayPalPayment: ' . $e->getMessage());
            
            $errorUrl = 'http://localhost:8081/cart?error=' . urlencode($e->getMessage());
            return redirect()->to($errorUrl);
        }
    }

    /**
     * Redirigir después del pago exitoso según la plataforma
     */
    private function redirectAfterPayment($shoppingId, Request $request)
    {
        // Configuración de URLs
        $expoWebUrl = 'http://192.168.1.20:8081'; // Cambia por tu IP
        $deepLink = 'archimarket3d://purchases/success?shopping_id=' . $shoppingId . '&payment_success=true';
        
        // Detectar plataforma por User-Agent
        $userAgent = $request->header('User-Agent', '');
        
        // Si viene de la app móvil (Expo o contiene archimarket3d)
        $isMobileApp = str_contains($userAgent, 'Expo') || 
                       str_contains($userAgent, 'archimarket3d') ||
                       str_contains($userAgent, 'ReactNative');
        
        // Si viene de la web de Expo
        $isExpoWeb = str_contains($userAgent, 'Expo') && !$isMobileApp;
        
        \Log::info('📍 Redirigiendo después de pago', [
            'shopping_id' => $shoppingId,
            'userAgent' => $userAgent,
            'isMobileApp' => $isMobileApp,
            'isExpoWeb' => $isExpoWeb
        ]);
        
        if ($isMobileApp) {
            // App móvil real - usar deep link
            \Log::info('📱 Redirigiendo a deep link de app móvil: ' . $deepLink);
            return redirect()->to($deepLink);
        } else {
            // Web (Expo) - redirigir a la web
            $webUrl = $expoWebUrl . '/purchases/success?shopping_id=' . $shoppingId . '&payment_success=true';
            \Log::info('🌐 Redirigiendo a web: ' . $webUrl);
            return redirect()->to($webUrl);
        }
    }

    /**
     * Enviar correo de confirmación de compra
     */
    private function sendPurchaseConfirmation($shopping, $user)
    {
        try {
            if (!$user || !$user->email) {
                \Log::warning('⚠️ No se puede enviar correo: usuario sin email', ['user_id' => $user->id ?? null]);
                return;
            }
            
            // Cargar la relación models si no está cargada
            if (!$shopping->relationLoaded('models')) {
                $shopping->load('models');
            }
            
            \Log::info('📧 Enviando correo de confirmación', [
                'to' => $user->email,
                'shopping_id' => $shopping->id
            ]);
            
            $user->notify(new PurchaseConfirmation($shopping, $user));
            
            \Log::info('✅ Correo enviado exitosamente');
            
        } catch (\Exception $e) {
            \Log::error('❌ Error enviando correo: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
        }
    }
    
    /**
     * Confirmar compra después de pago exitoso (SIN autenticación)
     */
    public function confirmPurchase(Request $request)
    {
        try {
            \Log::info('=== CONFIRMAR COMPRA (Sin Auth) ===');
            \Log::info('Request data:', $request->all());
            
            $validator = Validator::make($request->all(), [
                'shopping_id' => 'required|integer|exists:shopping,id'
            ]);

            if ($validator->fails()) {
                \Log::error('Validación falló', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Datos inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $shopping = Shopping::find($request->shopping_id);

            if (!$shopping) {
                \Log::error('Compra no encontrada', ['shopping_id' => $request->shopping_id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Compra no encontrada'
                ], 404);
            }

            if ($shopping->status !== 'pending') {
                \Log::error('Compra no está en estado pending', [
                    'shopping_id' => $shopping->id,
                    'current_status' => $shopping->status
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Esta compra ya fue procesada o está en estado inválido'
                ], 400);
            }

            $createdAt = $shopping->created_at;
            $now = now();
            $hoursAgo = $createdAt->diffInHours($now);
            
            if ($hoursAgo > 24) {
                \Log::error('Compra demasiado antigua', [
                    'shopping_id' => $shopping->id,
                    'created_at' => $createdAt,
                    'hours_ago' => $hoursAgo
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'La compra expiró. Por favor, crea una nueva'
                ], 400);
            }

            DB::beginTransaction();

            $shopping->update([
                'status' => 'completed',
                'payment_confirmed_at' => now()
            ]);

            UserLicense::where('shopping_id', $shopping->id)
                ->where('is_active', false)
                ->update([
                    'is_active' => true,
                    'activated_at' => now()
                ]);

            DB::commit();

            // Cargar relación para gamificación
            $shopping->load('models');
            
            $user = $shopping->user;

            // Gamificación
            try {
                if ($user) {
                    GamificationService::recordPurchase($user);
                    \Log::info('✅ Gamificación: Compra confirmada registrada para usuario ' . $user->id);
                }
            } catch (\Exception $gamifyError) {
                \Log::warning('⚠️ Error en gamificación (no afecta confirmación): ' . $gamifyError->getMessage());
            }

            // Enviar correo de confirmación
            try {
                if ($user && $user->email) {
                    $user->notify(new PurchaseConfirmation($shopping, $user));
                    \Log::info('✅ Correo de confirmación enviado a: ' . $user->email);
                }
            } catch (\Exception $mailError) {
                \Log::error('❌ Error enviando correo: ' . $mailError->getMessage());
            }

            \Log::info('✅ Compra confirmada', [
                'shopping_id' => $shopping->id,
                'user_id' => $shopping->user_id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Compra confirmada correctamente',
                'data' => [
                    'shopping_id' => $shopping->id,
                    'status' => $shopping->status,
                    'total' => $shopping->total
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('❌ Error confirmando compra: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Error al confirmar la compra',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Capturar orden de PayPal (para app móvil)
     * POST /api/paypal/capture-order
     */
    public function capturePayPalOrder(Request $request)
    {
        try {
            \Log::info('=== CAPTURAR ORDEN PAYPAL (APP MÓVIL) ===');
            \Log::info('Request data:', $request->all());
            
            $validator = Validator::make($request->all(), [
                'order_id' => 'required|string',
                'shopping_id' => 'required|integer|exists:shopping,id'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $orderId = $request->order_id;
            $shoppingId = $request->shopping_id;
            
            $shopping = Shopping::find($shoppingId);
            
            if (!$shopping) {
                return response()->json([
                    'success' => false,
                    'message' => 'Compra no encontrada'
                ], 404);
            }
            
            if ($shopping->status === 'completed') {
                return response()->json([
                    'success' => true,
                    'message' => 'La compra ya estaba completada',
                    'data' => ['shopping_id' => $shopping->id]
                ]);
            }
            
            DB::beginTransaction();
            
            // Capturar el pago con PayPal
            $paypalService = app(PayPalService::class);
            $result = $paypalService->captureOrder($orderId);
            
            if (!$result['success']) {
                throw new \Exception($result['message']);
            }
            
            // Actualizar compra
            $shopping->status = 'completed';
            $shopping->payment_id = $orderId;
            $shopping->paypal_order_id = $orderId;
            $shopping->paid_at = now();
            $shopping->save();
            
            // Activar licencias
            UserLicense::where('shopping_id', $shopping->id)
                ->update(['is_active' => true, 'activated_at' => now()]);
            
            DB::commit();
            
            // Cargar relaciones para el correo
            $shopping->load('models');
            $user = $shopping->user;
            
            // Enviar correo de confirmación
            $this->sendPurchaseConfirmation($shopping, $user);
            
            // Gamificación
            try {
                if ($user) {
                    GamificationService::recordPurchase($user);
                    \Log::info('✅ Gamificación registrada');
                }
            } catch (\Exception $e) {
                \Log::warning('⚠️ Error en gamificación: ' . $e->getMessage());
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Pago capturado exitosamente',
                'data' => [
                    'shopping_id' => $shopping->id,
                    'status' => $shopping->status
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('❌ Error capturando orden PayPal: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}