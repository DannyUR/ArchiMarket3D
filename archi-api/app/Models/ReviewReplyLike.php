<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ReviewReplyLike extends Model
{
    use HasFactory;

    protected $fillable = ['reply_id', 'user_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reply()
    {
        return $this->belongsTo(ReviewReply::class);
    }
}
