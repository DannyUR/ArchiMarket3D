<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Model3D;
use App\Models\Shopping;
use App\Models\Category;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Obtener todas las estadísticas del dashboard
     * GET /api/admin/dashboard/stats
     */
    public function stats()
    {
        // Estadísticas generales
        $totalUsers = User::count();
        $totalModels = Model3D::count();
        $totalSales = Shopping::sum('total');
        $totalPurchases = Shopping::count();
        $totalCategories = Category::count();
        $totalReviews = Review::count();

        // Ventas del mes actual
        $currentMonthSales = Shopping::whereMonth('purchase_date', now()->month)
            ->whereYear('purchase_date', now()->year)
            ->sum('total');

        // Ventas del mes anterior
        $lastMonthSales = Shopping::whereMonth('purchase_date', now()->subMonth()->month)
            ->whereYear('purchase_date', now()->subMonth()->year)
            ->sum('total');

        // Calcular crecimiento
        $salesGrowth = $lastMonthSales > 0 
            ? round((($currentMonthSales - $lastMonthSales) / $lastMonthSales) * 100, 1)
            : 100;

        // Usuarios nuevos este mes
        $newUsersThisMonth = User::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Modelos más vendidos
        $topSellingModels = Model3D::select(
                'models.id',
                'models.name',
                'models.price',
                DB::raw('COUNT(shopping_details.model_id) as total_sales'),
                DB::raw('SUM(shopping_details.unit_price) as revenue')
            )
            ->join('shopping_details', 'models.id', '=', 'shopping_details.model_id')
            ->groupBy('models.id', 'models.name', 'models.price')
            ->orderBy('total_sales', 'desc')
            ->limit(5)
            ->get();

        // Categorías con más modelos
        $topCategories = Category::withCount('models')
            ->orderBy('models_count', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'models_count']);

        // Usuarios por tipo
        $usersByType = User::select('user_type', DB::raw('count(*) as total'))
            ->groupBy('user_type')
            ->get();

        // Modelos por formato
        $modelsByFormat = Model3D::select('format', DB::raw('count(*) as total'))
            ->groupBy('format')
            ->orderBy('total', 'desc')
            ->get();

        // Reseñas recientes
        $recentReviews = Review::with(['user:id,name', 'model:id,name'])
            ->latest()
            ->limit(5)
            ->get();

        // Ventas por día (últimos 7 días)
        $salesLast7Days = Shopping::select(
                DB::raw('DATE(purchase_date) as date'),
                DB::raw('COUNT(*) as total_purchases'),
                DB::raw('SUM(total) as total_sales')
            )
            ->where('purchase_date', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Actividad reciente (compras)
        $recentPurchases = Shopping::with(['user:id,name', 'models:id,name'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function($purchase) {
                return [
                    'id' => $purchase->id,
                    'user' => $purchase->user->name,
                    'total' => $purchase->total,
                    'models_count' => $purchase->models->count(),
                    'date' => $purchase->purchase_date->format('Y-m-d H:i')
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_users' => $totalUsers,
                    'total_models' => $totalModels,
                    'total_sales' => $totalSales,
                    'total_purchases' => $totalPurchases,
                    'total_categories' => $totalCategories,
                    'total_reviews' => $totalReviews,
                    'new_users_this_month' => $newUsersThisMonth
                ],
                'sales' => [
                    'current_month' => $currentMonthSales,
                    'last_month' => $lastMonthSales,
                    'growth_percentage' => $salesGrowth,
                    'last_7_days' => $salesLast7Days
                ],
                'top_selling_models' => $topSellingModels,
                'top_categories' => $topCategories,
                'users_by_type' => $usersByType,
                'models_by_format' => $modelsByFormat,
                'recent_activity' => [
                    'reviews' => $recentReviews,
                    'purchases' => $recentPurchases
                ]
            ]
        ]);
    }

    /**
     * Estadísticas de ventas por período
     * GET /api/admin/dashboard/sales-stats
     */
    public function salesStats(Request $request)
    {
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

    /**
     * Estadísticas de modelos populares
     * GET /api/admin/dashboard/popular-models
     */
    public function popularModels()
    {
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
    }

    /**
     * Estadísticas de usuarios
     * GET /api/admin/dashboard/user-stats
     */
    public function userStats()
    {
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
    }
}