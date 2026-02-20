<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shopping extends Model
{
    protected $table = 'shopping'; // 👈 ¡ESTO ES CLAVE!
    
    protected $fillable = [
        'user_id',
        'purchase_date',
        'total',
        'status',
        'payment_id',
        'payment_provider'
    ];

    protected $casts = [
        'purchase_date' => 'datetime',
        'total' => 'decimal:2'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function models()
    {
        return $this->belongsToMany(
            Model3D::class,
            'shopping_details',
            'shopping_id',
            'model_id'
        )->withPivot('unit_price')->withTimestamps();
    }

    public function details()
    {
        return $this->hasMany(ShoppingDetail::class);
    }
}