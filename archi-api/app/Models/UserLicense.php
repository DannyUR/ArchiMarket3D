<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserLicense extends Model
{
    protected $table = 'user_licenses';
    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'date',
        'activated_at' => 'datetime',
        'price_paid' => 'decimal:2'
    ];

    protected $fillable = [
        'user_id',
        'model_id',
        'shopping_id',
        'license_type',
        'price_paid',
        'expires_at',
        'is_active',
        'activated_at'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function model()
    {
        return $this->belongsTo(Model3D::class, 'model_id');
    }

    public function shopping()
    {
        return $this->belongsTo(Shopping::class);
    }

    // Verificar si la licencia está activa
    public function isValid()
    {
        // Primero, verificar que esté activa
        if (!$this->is_active) {
            return false;
        }
        
        // Luego, verificar la fecha de expiración
        if (!$this->expires_at) {
            return true; // No expira
        }
        return now()->lte($this->expires_at);
    }
}