<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shopping;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class PaymentController extends Controller
{
    /**
     * Obtener lista de pagos
     */
    public function index(Request $request)
    {
        Log::info('=== INICIO PAYMENT CONTROLLER INDEX ===');
        Log::info('Request params:', $request->all());

        try {
            // Verificar conexión a BD
            Log::info('Verificando conexión a BD');
            try {
                DB::connection()->getPdo();
                Log::info('✅ Conexión a BD exitosa');
            } catch (\Exception $e) {
                Log::error('❌ Error de conexión a BD: ' . $e->getMessage());
                throw $e;
            }

            // Verificar que la tabla existe
            if (!Schema::hasTable('shopping')) {
                Log::error('❌ La tabla shopping no existe');
                return response()->json([
                    'success' => false,
                    'message' => 'La tabla de compras no existe'
                ], 500);
            }
            Log::info('✅ Tabla shopping existe');

            // Verificar columnas
            $columns = Schema::getColumnListing('shopping');
            Log::info('Columnas en shopping:', $columns);

            // Construir query
            Log::info('Construyendo query...');
            $query = Shopping::with(['user:id,name,email', 'models']);
            
            // Verificar si hay registros
            $totalCount = Shopping::count();
            Log::info("Total registros en shopping: {$totalCount}");

            // Aplicar ordenamiento
            if (in_array('purchase_date', $columns)) {
                $query->orderBy('purchase_date', 'desc');
                Log::info('Ordenando por purchase_date');
            } else {
                $query->orderBy('created_at', 'desc');
                Log::info('Ordenando por created_at');
            }

            // Aplicar filtros
            if ($request->has('status') && $request->status !== 'all') {
                if (in_array('status', $columns)) {
                    $query->where('status', $request->status);
                    Log::info("Filtro por status: {$request->status}");
                }
            }

            if ($request->has('method') && $request->method !== 'all') {
                if (in_array('payment_provider', $columns)) {
                    $query->where('payment_provider', $request->method);
                    Log::info("Filtro por payment_provider: {$request->method}");
                }
            }

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search, $columns) {
                    $q->where('id', 'LIKE', "%{$search}%");
                    
                    if (in_array('payment_id', $columns)) {
                        $q->orWhere('payment_id', 'LIKE', "%{$search}%");
                    }
                    
                    $q->orWhereHas('user', function($userQuery) use ($search) {
                        $userQuery->where('name', 'LIKE', "%{$search}%")
                                  ->orWhere('email', 'LIKE', "%{$search}%");
                    });
                });
                Log::info("Filtro por search: {$search}");
            }

            // Ejecutar query
            Log::info('Ejecutando query...');
            $payments = $query->paginate(15);
            Log::info("Query ejecutada, encontrados: " . $payments->count() . " registros");

            // Formatear datos
            Log::info('Formateando datos...');
            $formattedPayments = $payments->map(function($shopping) {
                return [
                    'id' => 'PAY-' . str_pad($shopping->id, 5, '0', STR_PAD_LEFT),
                    'transaction_id' => $shopping->payment_id ?? 'demo_' . $shopping->id,
                    'user' => $shopping->user ? [
                        'id' => $shopping->user->id,
                        'name' => $shopping->user->name,
                        'email' => $shopping->user->email
                    ] : null,
                    'amount' => (float)($shopping->total ?? 0),
                    'method' => $shopping->payment_provider ?? 'demo',
                    'status' => $shopping->status ?? 'completed',
                    'date' => $shopping->purchase_date ?? $shopping->created_at,
                    'items' => $shopping->models ? $shopping->models->map(function($model) {
                        return [
                            'name' => $model->name ?? 'Modelo',
                            'license' => $model->pivot->license_type ?? 'personal',
                            'price' => (float)($model->pivot->unit_price ?? $model->price ?? 0)
                        ];
                    }) : []
                ];
            });

            // Calcular estadísticas
            Log::info('Calculando estadísticas...');
            $totalAmount = Shopping::sum('total') ?? 0;
            $totalCount = Shopping::count();
            
            $successfulPayments = Shopping::where('status', 'completed')->count();
            $pendingPayments = Shopping::where('status', 'pending')->count();
            $failedPayments = Shopping::where('status', 'failed')->count();

            Log::info('✅ PaymentController completado exitosamente');

            return response()->json([
                'success' => true,
                'data' => [
                    'payments' => $formattedPayments,
                    'stats' => [
                        'totalPayments' => $totalCount,
                        'successfulPayments' => $successfulPayments,
                        'pendingPayments' => $pendingPayments,
                        'failedPayments' => $failedPayments,
                        'totalAmount' => (float)$totalAmount,
                        'avgAmount' => $totalCount > 0 ? (float)($totalAmount / $totalCount) : 0
                    ]
                ],
                'pagination' => [
                    'current_page' => $payments->currentPage(),
                    'last_page' => $payments->lastPage(),
                    'per_page' => $payments->perPage(),
                    'total' => $payments->total()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('❌ ERROR EN PAYMENT CONTROLLER: ' . $e->getMessage());
            Log::error('Archivo: ' . $e->getFile() . ':' . $e->getLine());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener pagos',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Obtener detalle de un pago específico
     */
    public function show($id)
    {
        Log::info("=== PAYMENT SHOW: ID {$id} ===");
        
        try {
            // Eliminar el prefijo PAY- si existe
            $realId = str_replace('PAY-', '', $id);
            Log::info("ID real: {$realId}");
            
            $shopping = Shopping::with(['user', 'models'])
                ->find($realId);

            if (!$shopping) {
                Log::warning("Pago no encontrado: {$realId}");
                return response()->json([
                    'success' => false,
                    'message' => 'Pago no encontrado'
                ], 404);
            }

            Log::info("Pago encontrado: ID {$shopping->id}, Usuario: {$shopping->user_id}");

            $payment = [
                'id' => 'PAY-' . str_pad($shopping->id, 5, '0', STR_PAD_LEFT),
                'transaction_id' => $shopping->payment_id ?? 'demo_' . $shopping->id,
                'user' => $shopping->user ? [
                    'id' => $shopping->user->id,
                    'name' => $shopping->user->name,
                    'email' => $shopping->user->email
                ] : null,
                'amount' => (float)($shopping->total ?? 0),
                'method' => $shopping->payment_provider ?? 'demo',
                'status' => $shopping->status ?? 'completed',
                'date' => $shopping->purchase_date ?? $shopping->created_at,
                'items' => $shopping->models ? $shopping->models->map(function($model) {
                    return [
                        'name' => $model->name ?? 'Modelo',
                        'license' => $model->pivot->license_type ?? 'personal',
                        'price' => (float)($model->pivot->unit_price ?? $model->price ?? 0)
                    ];
                }) : [],
                'metadata' => [
                    'payment_id' => $shopping->payment_id,
                    'user_id' => $shopping->user_id,
                    'purchase_date' => $shopping->purchase_date ?? $shopping->created_at
                ]
            ];

            Log::info("✅ Detalle de pago generado exitosamente");

            return response()->json([
                'success' => true,
                'data' => $payment
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error en show: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener pago',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Procesar reembolso
     */
    public function refund($id)
    {
        Log::info("=== PAYMENT REFUND: ID {$id} ===");
        
        try {
            $realId = str_replace('PAY-', '', $id);
            
            $shopping = Shopping::find($realId);

            if (!$shopping) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pago no encontrado'
                ], 404);
            }

            if ($shopping->status !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Solo se pueden reembolsar pagos completados'
                ], 400);
            }

            $shopping->status = 'refunded';
            $shopping->save();

            if (Schema::hasTable('user_licenses')) {
                DB::table('user_licenses')
                    ->where('shopping_id', $shopping->id)
                    ->update(['is_active' => false]);
            }

            Log::info('✅ Reembolso procesado', [
                'shopping_id' => $shopping->id,
                'user_id' => $shopping->user_id,
                'amount' => $shopping->total
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reembolso procesado correctamente'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error en refund: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar reembolso',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reenviar recibo por email
     */
    public function resendReceipt($id)
    {
        Log::info("=== PAYMENT RESEND RECEIPT: ID {$id} ===");
        
        try {
            $realId = str_replace('PAY-', '', $id);
            
            $shopping = Shopping::with('user')->find($realId);

            if (!$shopping) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pago no encontrado'
                ], 404);
            }

            Log::info('✅ Recibo reenviado', [
                'shopping_id' => $shopping->id,
                'user_email' => $shopping->user->email ?? 'sin email'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Recibo reenviado correctamente'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error en resendReceipt: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al reenviar recibo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de pagos
     */
    public function stats()
    {
        Log::info("=== PAYMENT STATS ===");
        
        try {
            $now = now();
            $startOfMonth = $now->copy()->startOfMonth();
            $startOfYear = $now->copy()->startOfYear();

            $stats = [
                'total' => Shopping::count(),
                'totalAmount' => (float)Shopping::sum('total'),
                'monthly' => Shopping::where('purchase_date', '>=', $startOfMonth)->count(),
                'monthlyAmount' => (float)Shopping::where('purchase_date', '>=', $startOfMonth)->sum('total'),
                'yearly' => Shopping::where('purchase_date', '>=', $startOfYear)->count(),
                'yearlyAmount' => (float)Shopping::where('purchase_date', '>=', $startOfYear)->sum('total'),
                'byStatus' => [
                    'completed' => Shopping::where('status', 'completed')->count(),
                    'pending' => Shopping::where('status', 'pending')->count(),
                    'failed' => Shopping::where('status', 'failed')->count(),
                    'refunded' => Shopping::where('status', 'refunded')->count()
                ],
                'byProvider' => [
                    'stripe' => Shopping::where('payment_provider', 'stripe')->count(),
                    'paypal' => Shopping::where('payment_provider', 'paypal')->count(),
                    'mercadopago' => Shopping::where('payment_provider', 'mercadopago')->count(),
                    'demo' => Shopping::where('payment_provider', 'demo')->count()
                ]
            ];

            Log::info('✅ Estadísticas calculadas');

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error en stats: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}