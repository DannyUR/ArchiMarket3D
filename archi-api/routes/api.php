<?php

use App\Http\Controllers\Api\ModelController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ShoppingController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ModelFileController;
use App\Http\Controllers\Api\LicenseController;
use App\Http\Controllers\Api\MixedRealityController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\ReportController;
use App\Http\Controllers\Api\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Api\Admin\PaymentController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\Admin\AnalyticsController;
use App\Http\Controllers\Api\Admin\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Status
|--------------------------------------------------------------------------
*/
Route::get('/', function() {
    return response()->json([
        'name' => 'ArchiMarket3D API',
        'version' => '1.0.0',
        'status' => 'online',
        'documentation' => url('/api/documentation')
    ]);
});

/*
|--------------------------------------------------------------------------
| Autenticación Pública
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
    Route::post('email/verification-notification', [AuthController::class, 'sendVerificationEmail'])
    ->middleware('auth:sanctum');
    Route::get('verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->name('verification.verify');

    Route::get('reset-password/{token}', [AuthController::class, 'showResetForm'])
        ->name('password.reset');
});

/*
|--------------------------------------------------------------------------
| Rutas Autenticadas
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::prefix('auth')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('logout/all', [AuthController::class, 'logoutAllDevices']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });
    
    // Perfil de usuario
    Route::prefix('profile')->group(function () {
        Route::get('/', [UserController::class, 'profile']);
        Route::put('/', [UserController::class, 'updateProfile']);
        Route::get('/purchases', [UserController::class, 'profilePurchases']);
        Route::get('/reviews', [UserController::class, 'profileReviews']);
    });
    
    // Mis licencias
    Route::get('my-licenses', [UserController::class, 'myLicenses']);
    
    // Compras
    Route::prefix('purchases')->group(function () {
        Route::get('/', [ShoppingController::class, 'index']);
        Route::get('/{id}', [ShoppingController::class, 'show']);
        Route::post('checkout', [ShoppingController::class, 'store']);
        Route::get('/{id}/downloads', [ShoppingController::class, 'downloadLinks']);
    });
    
    // Reseñas
    Route::prefix('reviews')->group(function () {
        Route::post('/models/{modelId}', [ReviewController::class, 'store']);
        Route::put('/{id}', [ReviewController::class, 'update']);
        Route::delete('/{id}', [ReviewController::class, 'destroy']);
    });
    
    // Descargas
    Route::get('/download/{fileId}', [ModelFileController::class, 'download'])->name('download.file');
});

/*
|--------------------------------------------------------------------------
| Rutas Públicas
|--------------------------------------------------------------------------
*/
// Modelos
Route::prefix('models')->group(function () {
    Route::get('/', [ModelController::class, 'index']);
    Route::get('/featured', [ModelController::class, 'featured']);
    Route::get('/latest', [ModelController::class, 'latest']);
    Route::get('/search', [ModelController::class, 'search']);
    Route::get('/{id}', [ModelController::class, 'show']);
    Route::get('/{id}/reviews', [ReviewController::class, 'index']);
    Route::get('/{id}/files/preview', [ModelFileController::class, 'previews']);
});

// Categorías
Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/{id}', [CategoryController::class, 'show']);
    Route::get('/{id}/models', [CategoryController::class, 'models']);
});

// Licencias (público)
Route::get('licenses/model/{modelId}', [LicenseController::class, 'index']);
Route::get('licenses/{id}', [LicenseController::class, 'show']);

// Realidad Mixta
Route::get('mixed-reality/model/{modelId}', [MixedRealityController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Rutas de Administración
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    
    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('stats', [DashboardController::class, 'stats']);
        Route::get('sales-stats', [DashboardController::class, 'salesStats']);
        Route::get('popular-models', [DashboardController::class, 'popularModels']);
        Route::get('user-stats', [DashboardController::class, 'userStats']);
    });
    
    // Modelos
    Route::prefix('models')->group(function () {
        Route::get('/', [ModelController::class, 'adminIndex']);  
        Route::post('/', [ModelController::class, 'store']);
        Route::put('/{id}', [ModelController::class, 'update']);
        Route::delete('/{id}', [ModelController::class, 'destroy']);
        Route::post('/{id}/toggle-featured', [ModelController::class, 'toggleFeatured']);
    });
    
    // Categorías
    Route::prefix('categories')->group(function () {
        Route::post('/', [CategoryController::class, 'store']);
        Route::put('/{id}', [CategoryController::class, 'update']);
        Route::delete('/{id}', [CategoryController::class, 'destroy']);
    });
    
    // Archivos
    Route::prefix('models/{modelId}/files')->group(function () {
        Route::post('/', [ModelFileController::class, 'store']);
        Route::post('/multiple', [ModelFileController::class, 'uploadMultiple']);
        Route::delete('/{fileId}', [ModelFileController::class, 'destroy']);
        Route::put('/{fileId}', [ModelFileController::class, 'update']);
    });
    
    // Licencias (admin)
    Route::prefix('licenses')->group(function () {
        Route::get('/', [LicenseController::class, 'adminIndex']);
        Route::get('/{id}', [LicenseController::class, 'show']);
        Route::post('/', [LicenseController::class, 'store']);
        Route::post('models/{modelId}/licenses', [LicenseController::class, 'storeForModel']);
        Route::put('{id}', [LicenseController::class, 'update']);
        Route::delete('{id}', [LicenseController::class, 'destroy']);
    });
    
    // Realidad Mixta
    Route::prefix('mixed-reality')->group(function () {
        Route::post('models/{modelId}', [MixedRealityController::class, 'store']);
        Route::put('{id}', [MixedRealityController::class, 'update']);
        Route::delete('{id}', [MixedRealityController::class, 'destroy']);
    });
    
    // Usuarios
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::get('/{id}/licenses', [UserController::class, 'userLicenses']); // 👈 NUEVO
        Route::put('/{id}/role', [UserController::class, 'updateRole']);
        Route::delete('/{id}', [UserController::class, 'destroy']);
        Route::put('/{id}/toggle-status', [UserController::class, 'toggleStatus']);
    });
    
    // Reportes (COMPLETO)
    Route::prefix('reports')->group(function () {
        Route::get('sales', [ReportController::class, 'sales']);
        Route::get('users', [ReportController::class, 'users']);
        Route::get('models', [ReportController::class, 'models']);
        Route::get('licenses', [ReportController::class, 'licenses']); // 👈 NUEVO
        Route::get('summary', [ReportController::class, 'summary']);   // 👈 NUEVO
    });

    // Analytics (COMPLETO)
    Route::prefix('analytics')->group(function () {
        Route::get('user-behavior', [AnalyticsController::class, 'userBehavior']);
        Route::get('trending-models', [AnalyticsController::class, 'trendingModels']);
        Route::get('abandoned-carts', [AnalyticsController::class, 'abandonedCarts']);
        Route::get('peak-hours', [AnalyticsController::class, 'peakHours']);
        Route::get('user-segments', [AnalyticsController::class, 'userSegments']);
        Route::get('retention', [AnalyticsController::class, 'retention']);
    });

    // Pagos (COMPLETO)
    Route::prefix('payments')->group(function () {
        Route::get('/', [PaymentController::class, 'index']);
        Route::get('/stats', [PaymentController::class, 'stats']);
        Route::get('/{id}', [PaymentController::class, 'show']);
        Route::post('/{id}/refund', [PaymentController::class, 'refund']);
        Route::post('/{id}/resend-receipt', [PaymentController::class, 'resendReceipt']);
    });
    
    // Reseñas (COMPLETO)
    Route::prefix('reviews')->group(function () {
        Route::get('/', [AdminReviewController::class, 'index']);
        Route::get('/stats', [AdminReviewController::class, 'stats']);
        Route::post('/{id}/approve', [AdminReviewController::class, 'approve']);
        Route::post('/{id}/reject', [AdminReviewController::class, 'reject']);
        Route::post('/{id}/reply', [AdminReviewController::class, 'reply']);
        Route::post('/{id}/toggle-report', [AdminReviewController::class, 'toggleReport']);
        Route::delete('/{id}', [AdminReviewController::class, 'destroy']);
    });

    // Notificaciones
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });

});

/*
|--------------------------------------------------------------------------
| Webhooks
|--------------------------------------------------------------------------
*/
Route::prefix('webhooks')->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])->group(function () {
    Route::post('payment', [WebhookController::class, 'handlePayment']);
    Route::post('stripe', [WebhookController::class, 'handleStripe']);
    Route::post('paypal', [WebhookController::class, 'handlePayPal']);
    Route::post('mercadopago', [WebhookController::class, 'handleMercadoPago']);
});

/*
|--------------------------------------------------------------------------
| Fallback
|--------------------------------------------------------------------------
*/
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'Ruta no encontrada'
    ], 404);
});