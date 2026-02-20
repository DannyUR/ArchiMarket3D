<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebhookLog extends Model
{
    protected $table = 'webhook_logs';

    protected $fillable = [
        'provider',
        'event_type',
        'payload',
        'status',
        'response',
        'error_message',
        'ip_address'
    ];

    protected $casts = [
        'payload' => 'array', // Convierte automáticamente JSON a array
        'response' => 'array'
    ];

    // Scopes útiles
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeByProvider($query, $provider)
    {
        return $query->where('provider', $provider);
    }
}
