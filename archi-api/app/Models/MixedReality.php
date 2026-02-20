<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MixedReality extends Model
{
    protected $table = 'mixed_reality';

    public function model()
    {
        return $this->belongsTo(Model3D::class);
    }

}
