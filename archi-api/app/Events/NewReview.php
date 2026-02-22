<?php

namespace App\Events;

use App\Models\Review;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewReview implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $review;

    /**
     * Create a new event instance.
     */
    public function __construct(Review $review)
    {
        $this->review = $review;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn()
    {
        return new Channel('admin-notifications');
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs()
    {
        return 'review.added';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith()
    {
        $stars = str_repeat('⭐', $this->review->rating);
        
        return [
            'id' => uniqid(),
            'type' => 'review',
            'title' => 'Nueva reseña',
            'message' => "{$this->review->user->name} calificó {$this->review->model->name} con {$this->review->rating} estrellas",
            'time' => now()->toISOString(),
            'read' => false,
            'icon' => 'FiStar',
            'color' => '#f59e0b',
            'link' => '/admin/reviews'
        ];
    }
}