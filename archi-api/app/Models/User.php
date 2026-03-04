<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Shopping;
use App\Models\Model3D;
use App\Models\Review;
use App\Models\UserLicense;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function shopping()
    {
        return $this->hasMany(Shopping::class);
    }

    public function models()
    {
        return $this->hasManyThrough(
            Model3D::class,
            Shopping::class,
            'user_id', // Clave foránea en shopping (user_id)
            'id',      // Clave local en models (id)
            'id',      // Clave local en users (id)
            'model_id' // Clave foránea en shopping_model (model_id) ??? Esto es complicado...
        );
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function licenses()
    {
        return $this->hasMany(\App\Models\UserLicense::class);
    }

    public function getActiveLicenses()
    {
        return $this->licenses()->where(function($q) {
            $q->whereNull('expires_at')
            ->orWhere('expires_at', '>=', now());
        })->get();
    }

    public function purchasedModels()
    {
        return $this->belongsToMany(
            Model3D::class,
            'shopping_model',
            'shopping_id',
            'model_id'
        )
        ->whereIn('shopping_id', function($query) {
            $query->select('id')
                ->from('shopping')
                ->where('shopping.user_id', $this->id);
        })
        ->withPivot('license_type', 'unit_price', 'quantity')
        ->withTimestamps();
    }
}
