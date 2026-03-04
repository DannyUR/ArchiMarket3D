<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'user_id',
        'model_id',
        'rating',
        'comment'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function model()
    {
        return $this->belongsTo(Model3D::class);
    }

    public function likes()
    {
        return $this->hasMany(ReviewLike::class);
    }

    public function replies()
    {
        return $this->hasMany(ReviewReply::class);
    }

}
