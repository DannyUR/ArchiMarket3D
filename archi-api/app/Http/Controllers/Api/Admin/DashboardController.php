<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Model3D;
use App\Models\Shopping;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Obtener todas las estadísticas del dashboard
     */
    public function stats()
    {
        try {
            // Obtener fechas para comparativas
            $now = Carbon::now();
            $startOfMonth = $now->copy()->startOfMonth();
            $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
            $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

            // ============================================
            // ESTADÍSTICAS GENERALES
            // ============================================
            
            // Usuarios totales y nuevos este mes
            $totalUsers = User::count();
            $newUsersThisMonth = User::where('created_at', '>=', $startOfMonth)->count();
            $newUsersLastMonth = User::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
            $userGrowth = $newUsersLastMonth > 0 
                ? round(($newUsersThisMonth - $newUsersLastMonth) / $newUsersLastMonth * 100, 1)
                : 100;

            // Modelos totales y nuevos este mes
            $totalModels = Model3D::count();
            $newModelsThisMonth = Model3D::where('created_at', '>=', $startOfMonth)->count();
            $newModelsLastMonth = Model3D::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
            $modelGrowth = $newModelsLastMonth > 0 
                ? round(($newModelsThisMonth - $newModelsLastMonth) / $newModelsLastMonth * 100, 1)
                : 100;

            // Ventas totales y del mes
            $totalSales = Shopping::sum('total') ?? 0;
            $monthlySales = Shopping::where('purchase_date', '>=', $startOfMonth)->sum('total') ?? 0;
            $lastMonthSales = Shopping::whereBetween('purchase_date', [$startOfLastMonth, $endOfLastMonth])->sum('total') ?? 0;
            $salesGrowth = $lastMonthSales > 0 
                ? round(($monthlySales - $lastMonthSales) / $lastMonthSales * 100, 1)
                : 100;

            // Compras totales y del mes
            $totalPurchases = Shopping::count();
            $monthlyPurchases = Shopping::where('purchase_date', '>=', $startOfMonth)->count();
            $lastMonthPurchases = Shopping::whereBetween('purchase_date', [$startOfLastMonth, $endOfLastMonth])->count();
            $purchaseGrowth = $lastMonthPurchases > 0 
                ? round(($monthlyPurchases - $lastMonthPurchases) / $lastMonthPurchases * 100, 1)
                : 100;

            // ============================================
            // USUARIOS RECIENTES
            // ============================================
            $recentUsers = User::select('id', 'name', 'user_type', 'created_at')
                ->latest()
                ->limit(5)
                ->get()
                ->map(function($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'user_type' => $user->user_type,
                        'created_at' => $user->created_at->toISOString()
                    ];
                });

            // ============================================
            // MODELOS RECIENTES
            // ============================================
            $recentModels = Model3D::with('category')
                ->select('id', 'name', 'price', 'format', 'featured', 'created_at', 'category_id')
                ->latest()
                ->limit(5)
                ->get()
                ->map(function($model) {
                    return [
                        'id' => $model->id,
                        'name' => $model->name,
                        'price' => (float)$model->price,
                        'format' => $model->format,
                        'featured' => (bool)$model->featured,
                        'category' => $model->category ? $model->category->name : null,
                        'created_at' => $model->created_at->toISOString()
                    ];
                });

            // ============================================
            // VENTAS POR DÍA (ÚLTIMOS 7 DÍAS)
            // ============================================
            $salesByDay = Shopping::select(
                    DB::raw('DATE(purchase_date) as date'),
                    DB::raw('COUNT(*) as transactions'),
                    DB::raw('SUM(total) as total')
                )
                ->where('purchase_date', '>=', $now->copy()->subDays(7))
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function($item) {
                    return [
                        'date' => $item->date,
                        'transactions' => (int)$item->transactions,
                        'total' => (float)$item->total
                    ];
                });

            // ============================================
            // MODELOS MÁS VENDIDOS
            // ============================================
            $topModels = DB::table('shopping_details')
                ->join('models', 'shopping_details.model_id', '=', 'models.id')
                ->select(
                    'models.id',
                    'models.name',
                    DB::raw('COUNT(shopping_details.model_id) as sales_count'),
                    DB::raw('SUM(shopping_details.unit_price) as revenue')
                )
                ->groupBy('models.id', 'models.name')
                ->orderBy('sales_count', 'desc')
                ->limit(5)
                ->get()
                ->map(function($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'sales_count' => (int)$item->sales_count,
                        'revenue' => (float)$item->revenue
                    ];
                });

            // ============================================
            // RESPUESTA COMPLETA
            // ============================================
            return response()->json([
                'success' => true,
                'data' => [
                    // Estadísticas principales
                    'totalUsers' => $totalUsers,
                    'totalModels' => $totalModels,
                    'totalSales' => (float)$totalSales,
                    'totalPurchases' => $totalPurchases,
                    
                    // Tendencias
                    'trends' => [
                        'users' => $userGrowth,
                        'models' => $modelGrowth,
                        'sales' => $salesGrowth,
                        'purchases' => $purchaseGrowth
                    ],
                    
                    // Listas recientes
                    'recentUsers' => $recentUsers,
                    'recentModels' => $recentModels,
                    
                    // Datos adicionales para gráficas
                    'salesByDay' => $salesByDay,
                    'topModels' => $topModels,
                    
                    // Resumen del mes
                    'monthly' => [
                        'newUsers' => $newUsersThisMonth,
                        'newModels' => $newModelsThisMonth,
                        'sales' => (float)$monthlySales,
                        'purchases' => $monthlyPurchases
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en DashboardController@stats: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas del dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de ventas por período
     */
    public function salesStats(Request $request)
    {
        try {
            $period = $request->get('period', 'month'); // day, week, month, year
            $year = $request->get('year', now()->year);

            $query = Shopping::select(
                    DB::raw($this->getDateGroup($period) . ' as period'),
                    DB::raw('COUNT(*) as total_purchases'),
                    DB::raw('SUM(total) as total_sales'),
                    DB::raw('AVG(total) as average_sale')
                )
                ->whereYear('purchase_date', $year)
                ->groupBy('period')
                ->orderBy('period');

            if ($period === 'month') {
                $query->whereYear('purchase_date', $year);
            }

            $sales = $query->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => $period,
                    'year' => $year,
                    'stats' => $sales
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en DashboardController@salesStats: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas de ventas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener modelos populares
     */
    public function popularModels()
    {
        try {
            $mostViewed = Model3D::withCount('reviews')
                ->withAvg('reviews', 'rating')
                ->orderBy('reviews_count', 'desc')
                ->limit(5)
                ->get(['id', 'name', 'price', 'format']);

            $bestRated = Model3D::withAvg('reviews', 'rating')
                ->withCount('reviews')
                ->having('reviews_avg_rating', '>', 0)
                ->orderBy('reviews_avg_rating', 'desc')
                ->limit(5)
                ->get(['id', 'name', 'price', 'format']);

            return response()->json([
                'success' => true,
                'data' => [
                    'most_viewed' => $mostViewed,
                    'best_rated' => $bestRated
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en DashboardController@popularModels: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener modelos populares',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Estadísticas de usuarios
     */
    public function userStats()
    {
        try {
            $totalUsers = User::count();
            
            // Usuarios registrados por mes (últimos 6 meses)
            $usersByMonth = User::select(
                    DB::raw('MONTH(created_at) as month'),
                    DB::raw('YEAR(created_at) as year'),
                    DB::raw('COUNT(*) as total')
                )
                ->where('created_at', '>=', now()->subMonths(6))
                ->groupBy('year', 'month')
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->get();

            // Usuarios con compras
            $usersWithPurchases = User::has('shopping')->count();
            $usersWithoutPurchases = $totalUsers - $usersWithPurchases;

            return response()->json([
                'success' => true,
                'data' => [
                    'total_users' => $totalUsers,
                    'users_with_purchases' => $usersWithPurchases,
                    'users_without_purchases' => $usersWithoutPurchases,
                    'registration_by_month' => $usersByMonth
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en DashboardController@userStats: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas de usuarios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener el group by según el período
     */
    private function getDateGroup($period)
    {
        return match($period) {
            'day' => 'DATE(purchase_date)',
            'week' => 'YEARWEEK(purchase_date)',
            'month' => 'MONTH(purchase_date)',
            'year' => 'YEAR(purchase_date)',
            default => 'DATE(purchase_date)'
        };
    }
}