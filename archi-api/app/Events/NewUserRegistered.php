<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewUserRegistered implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;

    /**
     * Create a new event instance.
     */
    public function __construct(User $user)
    {
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
        return 'user.registered';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith()
    {
        return [
            'id' => uniqid(),
            'type' => 'user',
            'title' => 'Nuevo usuario registrado',
            'message' => "{$this->user->name} se ha registrado como " . 
                        ($this->user->user_type === 'architect' ? 'Arquitecto' : 
                        ($this->user->user_type === 'engineer' ? 'Ingeniero' : 
                        ($this->user->user_type === 'company' ? 'Empresa' : 'Usuario'))),
            'time' => now()->toISOString(),
            'read' => false,
            'icon' => 'FiUsers',
            'color' => '#3b82f6',
            'link' => '/admin/users'
        ];
    }
}