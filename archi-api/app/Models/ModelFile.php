<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModelFile extends Model
{
    public function model()
    {
        return $this->belongsTo(Model3D::class);
    }

}
