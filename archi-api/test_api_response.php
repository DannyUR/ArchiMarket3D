<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Review;

// Simular el endpoint público
$modelId = 1657;

$reviews = Review::where('model_id', $modelId)
    ->with('user:id,name')
    ->select('id', 'user_id', 'rating', 'comment', 'created_at', 'approved_at', 'rejected_at', 'admin_reply', 'replied_at')
    ->latest()
    ->get();

echo "Reviews para modelo {$modelId}:\n";
foreach ($reviews as $review) {
    echo "\n=== Review ID {$review->id} ===\n";
    echo "ID: {$review->id}\n";
    echo "Comment: {$review->comment}\n";
    echo "admin_reply: " . ($review->admin_reply ?? 'NULL') . "\n";
    echo "replied_at: " . ($review->replied_at ?? 'NULL') . "\n";
    
    // Transformar como hace el controller
    if ($review->rejected_at !== null) {
        $review->status = 'rejected';
    } elseif ($review->approved_at !== null) {
        $review->status = 'approved';
    } else {
        $review->status = 'pending';
    }

    if ($review->admin_reply && $review->replied_at) {
        $review->reply = [
            'text' => $review->admin_reply,
            'created_at' => $review->replied_at
        ];
    } else {
        $review->reply = null;
    }
    
    echo "Status: {$review->status}\n";
    echo "Reply: " . json_encode($review->reply) . "\n";
}

echo "\n\n=== JSON OUTPUT ===\n";
echo json_encode($reviews, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
