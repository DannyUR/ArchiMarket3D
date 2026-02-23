<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class License extends Model
{
    protected $table = 'licenses';
    
    protected $fillable = [
        'model_id',
        'type',
        'description'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function model()
    {
        return $this->belongsTo(Model3D::class, 'model_id');
    }
}