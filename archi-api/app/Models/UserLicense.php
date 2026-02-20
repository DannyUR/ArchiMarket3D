<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserLicense extends Model
{
    protected $table = 'user_licenses';

    protected $fillable = [
        'user_id',
        'model_id',
        'shopping_id',
        'license_type',
        'price_paid',
        'expires_at'
    ];

    protected $casts = [
        'expires_at' => 'date',
        'price_paid' => 'decimal:2'
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
        if (!$this->expires_at) {
            return true; // No expira
        }
        return now()->lte($this->expires_at);
    }
}