<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'model_id',
        'rating',
        'comment',
        'approved_at',
        'rejected_at',
        'reported',
        'admin_reply',
        'replied_at',
        'replied_by',
        'deleted_by',
        'deletion_reason'
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'replied_at' => 'datetime',
        'deleted_at' => 'datetime',
        'reported' => 'boolean',
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
