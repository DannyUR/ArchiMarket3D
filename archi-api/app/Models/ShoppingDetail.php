<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShoppingDetail extends Model
{
    protected $table = 'shopping_details';

    protected $fillable = [
        'shopping_id', // 👈 ESTA FALTABA
        'model_id',
        'unit_price'
    ];

    public function shopping()
    {
        return $this->belongsTo(Shopping::class);
    }

    public function model()
    {
        return $this->belongsTo(Model3D::class);
    }

}
