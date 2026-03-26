<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Review;

// Buscar la review ID 7 (que supuestamente tiene respuesta)
$review = Review::find(7);

if ($review) {
    echo "Review ID 7:\n";
    echo "  - Comment: " . $review->comment . "\n";
    echo "  - admin_reply: " . ($review->admin_reply ?? 'NULL') . "\n";
    echo "  - replied_at: " . ($review->replied_at ?? 'NULL') . "\n";
    echo "  - replied_by: " . ($review->replied_by ?? 'NULL') . "\n";
    echo "  - approved_at: " . ($review->approved_at ?? 'NULL') . "\n";
    echo "  - rejected_at: " . ($review->rejected_at ?? 'NULL') . "\n";
    echo "\n";
    
    // Status calculado
    if ($review->rejected_at !== null) {
        $status = 'rejected';
    } elseif ($review->approved_at !== null) {
        $status = 'approved';
    } else {
        $status = 'pending';
    }
    
    echo "Calculated status: " . $status . "\n";
    echo "Full review object:\n";
    echo json_encode($review->toArray(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
} else {
    echo "Review no encontrada\n";
}

// Listar todas las reviews con sus datos
echo "\n\n═══ TODAS LAS REVIEWS ═══\n\n";
$allReviews = Review::all();
foreach ($allReviews as $r) {
    echo "Review ID {$r->id}: reply=" . ($r->admin_reply ? "YES" : "NO") . ", status=" . 
        ($r->rejected_at ? "rejected" : ($r->approved_at ? "approved" : "pending")) . "\n";
}
