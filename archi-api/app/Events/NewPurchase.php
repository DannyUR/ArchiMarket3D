<?php

namespace App\Events;

use App\Models\Shopping;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewPurchase implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $shopping;
    public $user;

    /**
     * Create a new event instance.
     */
    public function __construct(Shopping $shopping, User $user)
    {
        $this->shopping = $shopping;
        $this->user = $user;
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
        return 'purchase.completed';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith()
    {
        $modelCount = $this->shopping->models()->count();
        $modelNames = $this->shopping->models()->pluck('name')->take(2)->join(', ');
        
        return [
            'id' => uniqid(),
            'type' => 'sale',
            'title' => 'Nueva compra realizada',
            'message' => "{$this->user->name} compró {$modelCount} modelo(s): {$modelNames} por $" . number_format($this->shopping->total, 2),
            'time' => now()->toISOString(),
            'read' => false,
            'icon' => 'FiShoppingBag',
            'color' => '#10b981',
            'link' => '/admin/sales'
        ];
    }
}