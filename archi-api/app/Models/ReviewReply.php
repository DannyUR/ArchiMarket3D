<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReviewReply extends Model
{
    protected $fillable = [
        'review_id',
        'user_id',
        'comment',
        'parent_reply_id'
    ];

    public function review()
    {
        return $this->belongsTo(Review::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parentReply()
    {
        return $this->belongsTo(ReviewReply::class, 'parent_reply_id');
    }

    public function nestedReplies()
    {
        return $this->hasMany(ReviewReply::class, 'parent_reply_id');
    }

    public function likes()
    {
        return $this->hasMany(ReviewReplyLike::class, 'reply_id');
    }
}
