<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class License extends Model
{
   public function model()
    {
        return $this->belongsTo(Model3D::class, 'model_id');
    }


}
