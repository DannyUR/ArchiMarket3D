<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Model3D;
use App\Models\Shopping;
use App\Models\Category;
use App\Models\Review;
use App\Models\UserLicense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;

class ReportController extends Controller
{
    /**
     * Reporte de ventas
     * GET /api/admin/reports/sales
     */
    public function sales(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());
        $format = $request->get('format', 'json'); // json, csv

        // Ventas por período
        $sales = Shopping::with(['user:id,name', 'models'])
            ->whereBetween('purchase_date', [$startDate, $endDate])
            ->orderBy('purchase_date', 'desc')
            ->get()
            ->map(function($sale) {
                return [
                    'id' => $sale->id,
                    'date' => $sale->purchase_date->format('Y-m-d H:i'),
                    'customer' => $sale->user->name ?? 'N/A',
                    'total' => $sale->total,
                    'items_count' => $sale->models->count(),
                    'status' => $sale->status ?? 'completed'
                ];
            });

        // Estadísticas del período
        $stats = [
            'total_sales' => $sales->sum('total'),
            'total_transactions' => $sales->count(),
            'average_sale' => $sales->count() > 0 ? round($sales->sum('total') / $sales->count(), 2) : 0,
            'max_sale' => $sales->max('total') ?? 0,
            'min_sale' => $sales->min('total') ?? 0,
            'period' => [
                'start' => $startDate,
                'end' => $endDate
            ]
        ];

        // Ventas por día
        $salesByDay = Shopping::select(
                DB::raw('DATE(purchase_date) as date'),
                DB::raw('COUNT(*) as transactions'),
                DB::raw('SUM(total) as total')
            )
            ->whereBetween('purchase_date', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Productos más vendidos
        $topProducts = Model3D::select(
                'models.id',
                'models.name',
                'models.price',
                DB::raw('COUNT(shopping_details.model_id) as total_sales'),
                DB::raw('SUM(shopping_details.unit_price) as revenue')
            )
            ->join('shopping_details', 'models.id', '=', 'shopping_details.model_id')
            ->join('shopping', 'shopping_details.shopping_id', '=', 'shopping.id')
            ->whereBetween('shopping.purchase_date', [$startDate, $endDate])
            ->groupBy('models.id', 'models.name', 'models.price')
            ->orderBy('total_sales', 'desc')
            ->limit(10)
            ->get();

        if ($format === 'csv') {
            return $this->exportSalesToCSV($sales, $stats, $startDate, $endDate);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'sales' => $sales,
                'sales_by_day' => $salesByDay,
                'top_products' => $topProducts
            ]
        ]);
    }

    /**
     * Exportar ventas a CSV
     */
    private function exportSalesToCSV($sales, $stats, $startDate, $endDate)
    {
        $filename = "ventas_{$startDate}_a_{$endDate}.csv";
        $handle = fopen('php://temp', 'w');
        
        // Cabeceras
        fputcsv($handle, ['ID', 'Fecha', 'Cliente', 'Total', 'Items', 'Estado']);
        
        // Datos
        foreach ($sales as $sale) {
            fputcsv($handle, [
                $sale['id'],
                $sale['date'],
                $sale['customer'],
                $sale['total'],
                $sale['items_count'],
                $sale['status']
            ]);
        }
        
        // Estadísticas al final
        fputcsv($handle, []);
        fputcsv($handle, ['RESUMEN', '', '', '', '', '']);
        fputcsv($handle, ['Total Ventas', '', '', $stats['total_sales'], '', '']);
        fputcsv($handle, ['Transacciones', '', '', $stats['total_transactions'], '', '']);
        fputcsv($handle, ['Promedio', '', '', $stats['average_sale'], '', '']);
        
        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);
        
        return response($content)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Reporte de usuarios
     * GET /api/admin/reports/users
     */
    public function users(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());
        $format = $request->get('format', 'json');

        // Usuarios registrados en el período
        $newUsers = User::whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name', 'email', 'user_type', 'company', 'created_at']);

        // Estadísticas de usuarios
        $stats = [
            'total_users' => User::count(),
            'new_users' => $newUsers->count(),
            'users_by_type' => User::select('user_type', DB::raw('count(*) as total'))
                ->groupBy('user_type')
                ->get(),
            'users_with_purchases' => User::has('shopping')->count(),
            'users_without_purchases' => User::doesntHave('shopping')->count()
        ];

        // Top compradores
        $topBuyers = User::select(
                'users.id',
                'users.name',
                'users.email',
                DB::raw('COUNT(shopping.id) as total_purchases'),
                DB::raw('SUM(shopping.total) as total_spent')
            )
            ->join('shopping', 'users.id', '=', 'shopping.user_id')
            ->whereBetween('shopping.purchase_date', [$startDate, $endDate])
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderBy('total_spent', 'desc')
            ->limit(10)
            ->get();

        if ($format === 'csv') {
            return $this->exportUsersToCSV($newUsers, $stats, $startDate, $endDate);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'new_users' => $newUsers,
                'top_buyers' => $topBuyers
            ]
        ]);
    }

    /**
     * Exportar usuarios a CSV
     */
    private function exportUsersToCSV($users, $stats, $startDate, $endDate)
    {
        $filename = "usuarios_{$startDate}_a_{$endDate}.csv";
        $handle = fopen('php://temp', 'w');
        
        fputcsv($handle, ['ID', 'Nombre', 'Email', 'Tipo', 'Empresa', 'Fecha Registro']);
        
        foreach ($users as $user) {
            fputcsv($handle, [
                $user->id,
                $user->name,
                $user->email,
                $user->user_type,
                $user->company ?? 'N/A',
                $user->created_at->format('Y-m-d')
            ]);
        }
        
        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);
        
        return response($content)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Reporte de modelos
     * GET /api/admin/reports/models
     */
    public function models(Request $request)
    {
        $format = $request->get('format', 'json');

        // Modelos con estadísticas
        $models = Model3D::with('category:id,name')
            ->withCount(['reviews', 'shopping'])
            ->withAvg('reviews', 'rating')
            ->orderBy('shopping_count', 'desc')
            ->get()
            ->map(function($model) {
                return [
                    'id' => $model->id,
                    'name' => $model->name,
                    'category' => $model->category->name ?? 'Sin categoría',
                    'price' => $model->price,
                    'format' => $model->format,
                    'size_mb' => $model->size_mb,
                    'sales_count' => $model->shopping_count,
                    'reviews_count' => $model->reviews_count,
                    'avg_rating' => round($model->reviews_avg_rating ?? 0, 1),
                    'featured' => $model->featured,
                    'created_at' => $model->created_at->format('Y-m-d')
                ];
            });

        // Estadísticas generales
        $stats = [
            'total_models' => $models->count(),
            'total_sales' => $models->sum('sales_count'),
            'total_revenue' => $models->sum(function($model) {
                return $model['price'] * $model['sales_count'];
            }),
            'avg_price' => round($models->avg('price'), 2),
            'models_without_sales' => $models->where('sales_count', 0)->count(),
            'models_featured' => $models->where('featured', true)->count()
        ];

        // Modelos por categoría
        $modelsByCategory = Category::withCount('models')
            ->having('models_count', '>', 0)
            ->orderBy('models_count', 'desc')
            ->get(['id', 'name', 'models_count']);

        // Modelos por formato
        $modelsByFormat = Model3D::select('format', DB::raw('count(*) as total'))
            ->groupBy('format')
            ->orderBy('total', 'desc')
            ->get();

        if ($format === 'csv') {
            return $this->exportModelsToCSV($models, $stats);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'models' => $models,
                'models_by_category' => $modelsByCategory,
                'models_by_format' => $modelsByFormat
            ]
        ]);
    }

    /**
     * Exportar modelos a CSV
     */
    private function exportModelsToCSV($models, $stats)
    {
        $filename = "modelos_" . now()->format('Y-m-d') . ".csv";
        $handle = fopen('php://temp', 'w');
        
        fputcsv($handle, ['ID', 'Nombre', 'Categoría', 'Precio', 'Formato', 'Tamaño MB', 'Ventas', 'Reseñas', 'Rating']);
        
        foreach ($models as $model) {
            fputcsv($handle, [
                $model['id'],
                $model['name'],
                $model['category'],
                $model['price'],
                $model['format'],
                $model['size_mb'],
                $model['sales_count'],
                $model['reviews_count'],
                $model['avg_rating']
            ]);
        }
        
        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);
        
        return response($content)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Reporte de ingresos por licencias
     * GET /api/admin/reports/licenses
     */
    public function licenses(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $licenses = UserLicense::with(['user:id,name', 'model:id,name'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($license) {
                return [
                    'id' => $license->id,
                    'user' => $license->user->name,
                    'model' => $license->model->name,
                    'license_type' => $license->license_type,
                    'price_paid' => $license->price_paid,
                    'is_active' => $license->is_active,
                    'expires_at' => $license->expires_at,
                    'purchased_at' => $license->created_at->format('Y-m-d H:i')
                ];
            });

        $stats = [
            'total_licenses' => $licenses->count(),
            'total_revenue' => $licenses->sum('price_paid'),
            'by_type' => [
                'personal' => $licenses->where('license_type', 'personal')->count(),
                'business' => $licenses->where('license_type', 'business')->count(),
                'unlimited' => $licenses->where('license_type', 'unlimited')->count()
            ],
            'active_licenses' => $licenses->where('is_active', true)->count()
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'licenses' => $licenses
            ]
        ]);
    }

    /**
     * Reporte general (todos los reportes en uno)
     * GET /api/admin/reports/summary
     */
    public function summary()
    {
        $now = now();
        
        return response()->json([
            'success' => true,
            'data' => [
                'sales_today' => Shopping::whereDate('purchase_date', $now->today())->sum('total'),
                'sales_week' => Shopping::whereBetween('purchase_date', [$now->startOfWeek(), $now->endOfWeek()])->sum('total'),
                'sales_month' => Shopping::whereMonth('purchase_date', $now->month)->sum('total'),
                'new_users_today' => User::whereDate('created_at', $now->today())->count(),
                'new_users_week' => User::whereBetween('created_at', [$now->startOfWeek(), $now->endOfWeek()])->count(),
                'new_models_month' => Model3D::whereMonth('created_at', $now->month)->count(),
                'top_selling_model' => Model3D::withCount('shopping')
                    ->orderBy('shopping_count', 'desc')
                    ->first(['id', 'name', 'price']),
                'best_rated_model' => Model3D::withAvg('reviews', 'rating')
                    ->orderBy('reviews_avg_rating', 'desc')
                    ->first(['id', 'name'])
            ]
        ]);
    }
}