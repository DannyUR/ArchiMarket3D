<?php

namespace App\Events;

use App\Models\Shopping;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentProcessed implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $shopping;

    /**
     * Create a new event instance.
     */
    public function __construct(Shopping $shopping)
    {
        $this->shopping = $shopping;
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
        return 'payment.processed';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith()
    {
        return [
            'id' => uniqid(),
            'type' => 'payment',
            'title' => 'Pago procesado',
            'message' => "Pago de $" . number_format($this->shopping->total, 2) . " procesado correctamente vía " . strtoupper($this->shopping->payment_provider ?? 'demo'),
            'time' => now()->toISOString(),
            'read' => false,
            'icon' => 'FiDollarSign',
            'color' => '#8b5cf6',
            'link' => '/admin/payments'
        ];
    }
}