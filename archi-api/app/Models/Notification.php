<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $table = 'notifications';
    
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'read_at'
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Relación con el usuario que recibe la notificación
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope para notificaciones no leídas
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope para notificaciones leídas
     */
    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    /**
     * Verificar si la notificación ha sido leída
     */
    public function isRead()
    {
        return !is_null($this->read_at);
    }

    /**
     * Marcar como leída
     */
    public function markAsRead()
    {
        $this->read_at = now();
        $this->save();
    }

    /**
     * Obtener el ícono según el tipo
     */
    public function getIconAttribute()
    {
        return match($this->type) {
            'user' => 'FiUsers',
            'sale' => 'FiShoppingBag',
            'review' => 'FiStar',
            'payment' => 'FiCreditCard',
            'alert' => 'FiAlertCircle',
            'system' => 'FiSettings',
            default => 'FiBell'
        };
    }

    /**
     * Obtener el color según el tipo
     */
    public function getColorAttribute()
    {
        return match($this->type) {
            'user' => '#3b82f6',
            'sale' => '#10b981',
            'review' => '#f59e0b',
            'payment' => '#8b5cf6',
            'alert' => '#ef4444',
            'system' => '#64748b',
            default => '#64748b'
        };
    }
}