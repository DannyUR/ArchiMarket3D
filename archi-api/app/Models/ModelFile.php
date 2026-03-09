<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModelFile extends Model
{
    protected $table = 'model_files';
    
    protected $fillable = [
        'model_id',
        'file_url',
        'file_type',
        'origin'
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