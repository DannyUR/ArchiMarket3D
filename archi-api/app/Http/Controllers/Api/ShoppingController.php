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
            'personal' => now()->addYear(), // 1 año
            'business' => now()->addYears(3), // 3 años
            'unlimited' => null, // No expira
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
                    'is_active' => false // Inactiva hasta confirmar pago
                ]);
            }

            DB::commit();

            // URLs de retorno - USANDO NGROK
            $ngrokUrl = 'https://housewifely-quadrophonics-audrianna.ngrok-free.dev'; // Tu URL de ngrok
            $returnUrl = $ngrokUrl . '/api/shopping/execute-paypal-payment?shopping_id=' . $shopping->id;
            $cancelUrl = $ngrokUrl . '/cart';

            // Crear orden en PayPal usando el servicio
            $paypalService = app(\App\Services\PayPalService::class);
            
            \Log::info('📊 PARÁMETROS QUE ENVÍO A PAYPAL:', [
                'shopping_id' => $shopping->id,
                'total' => $total,
                'total_type' => gettype($total),
                'items_count' => count($items),
                'items' => $items,
                'returnUrl' => $returnUrl,
                'cancelUrl' => $cancelUrl
            ]);
            
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
     * Ejecutar pago de PayPal (callback)
     */
    public function executePayPalPayment(Request $request)
    {
        try {
            \Log::info('=== EJECUTAR PAGO PAYPAL ===');
            \Log::info('Request:', $request->all());

            $paymentId = $request->paymentId;
            $payerId = $request->PayerID;
            $shoppingId = $request->shopping_id;

            if (!$paymentId || !$payerId || !$shoppingId) {
                \Log::error('❌ Faltan parámetros: ', [
                    'paymentId' => $paymentId,
                    'payerId' => $payerId,
                    'shoppingId' => $shoppingId
                ]);
                throw new \Exception('Faltan parámetros requeridos');
            }

            $shopping = Shopping::find($shoppingId);
            if (!$shopping) {
                throw new \Exception('Compra no encontrada: ' . $shoppingId);
            }

            DB::beginTransaction();

            // Validar el pago con PayPal
            $paypalService = app(PayPalService::class);
            $result = $paypalService->executePayment($paymentId, $payerId);

            if (!$result['success']) {
                throw new \Exception('PayPal error: ' . $result['message']);
            }

            \Log::info('✅ PayPal validó el pago exitosamente');

            // Actualizar compra
            $shopping->status = 'completed';
            $shopping->payment_id = $paymentId;
            $shopping->save();

            \Log::info('✅ Compra actualizada a completed', ['shopping_id' => $shopping->id]);

            // Activar SOLO las licencias de esta compra
            $licenses = UserLicense::where('shopping_id', $shoppingId)->get();
            
            \Log::info('📊 Licencias encontradas:', [
                'count' => $licenses->count(),
                'details' => $licenses->map(fn($l) => [
                    'id' => $l->id,
                    'user_id' => $l->user_id,
                    'model_id' => $l->model_id,
                    'is_active_before' => $l->is_active
                ])->toArray()
            ]);

            $updated = UserLicense::where('shopping_id', $shoppingId)
                ->update(['is_active' => true]);
            
            \Log::info('✅ Licencias activadas', ['count_updated' => $updated]);

            DB::commit();

            // Disparar eventos Y CREAR NOTIFICACIONES (con protección contra errores)
            $user = $shopping->user;
            try {
                NotificationHelper::newPurchase($shopping, $user);
                \Log::info('✅ Notificaciones creadas exitosamente');
            } catch (\Exception $notifError) {
                // Si la notificación falla, LOG pero NO DETENER EL PAGO
                \Log::warning('⚠️ Error creando notificación (no detiene pago): ' . $notifError->getMessage());
            }
            
            try {
                event(new NewPurchase($shopping, $user));
                \Log::info('✅ Evento NewPurchase disparado');
            } catch (\Exception $eventError) {
                \Log::warning('⚠️ Error disparando evento: ' . $eventError->getMessage());
            }

            \Log::info('✅ Pago ejecutado exitosamente');

            // ✅ Redirigir al frontend con token para limpiar carrito
            $frontendUrl = 'http://localhost:3000/purchases/success?shopping_id=' . $shoppingId . '&payment_success=true';
            
            \Log::info('📍 Redirigiendo a: ' . $frontendUrl);
            return redirect()->to($frontendUrl);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('❌ Error en executePayPalPayment: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            $frontendUrl = 'http://localhost:3000/cart?error=payment_failed&message=' . urlencode($e->getMessage());
            return redirect()->to($frontendUrl);
        }
    }
}