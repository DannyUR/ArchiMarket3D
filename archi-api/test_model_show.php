<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Model3D;

// Simular el endpoint show para el modelo 1657
$model = Model3D::with([
    'category:id,name',
    'files:id,model_id,file_url,file_type',
    'licenses:id,model_id,type,description',
    'reviews' => function($q) {
        $q->with('user:id,name')
        ->select('id', 'user_id', 'model_id', 'rating', 'comment', 'created_at', 'approved_at', 'rejected_at', 'admin_reply', 'replied_at')
        ->latest()
        ->limit(5);
    }
])
->select(
    'id', 'name', 'description', 'price', 'format', 
    'size_mb', 'publication_date', 'category_id', 'featured',
    'metadata', 'preview_url', 'embed_url', 'sketchfab_url',
    'author_name', 'author_avatar', 'author_bio'
)
->find(1657);

if ($model) {
    // Transformar reviews
    $model->reviews = $model->reviews->map(function ($review) {
        // Determinar estado
        if ($review->rejected_at !== null) {
            $review->status = 'rejected';
        } elseif ($review->approved_at !== null) {
            $review->status = 'approved';
        } else {
            $review->status = 'pending';
        }

        // Formatar respuesta del admin si existe
        if ($review->admin_reply && $review->replied_at) {
            $review->reply = [
                'text' => $review->admin_reply,
                'created_at' => $review->replied_at
            ];
        } else {
            $review->reply = null;
        }

        return $review;
    });

    echo "=== Modelo 1657 Reviews ===\n";
    foreach ($model->reviews as $review) {
        echo "\nReview ID {$review->id}:\n";
        echo "  Comment: {$review->comment}\n";
        echo "  Status: {$review->status}\n";
        echo "  Reply: " . json_encode($review->reply) . "\n";
    }
    
    echo "\n\n=== FULL JSON OUTPUT ===\n";
    echo json_encode($model->reviews, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
} else {
    echo "Model not found\n";
}
