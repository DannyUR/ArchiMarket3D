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
}