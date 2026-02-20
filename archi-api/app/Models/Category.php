<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    public function models()
    {
        return $this->hasMany(Model3D::class, 'category_id');
    }

}
