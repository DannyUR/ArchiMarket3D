<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Model3D extends Model
{
    protected $table = 'models';
    protected $casts = [
        'price' => 'float',
        'size_mb' => 'float',
        'metadata' => 'array'
    ];
    protected $fillable = [
        'name',
        'description',
        'price',
        'format',
        'size_mb',
        'category_id',
        'category_type',
        'metadata',
        'featured',
        'publication_date',
        'sketchfab_id',
        'author_name',
        'author_avatar',
        'author_bio',
        'polygon_count',
        'material_count',
        'has_animations',
        'has_rigging',
        'technical_specs'
    ];



    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function licenses()
    {
        return $this->hasMany(License::class, 'model_id');
    }

    public function mixedReality()
    {
        return $this->hasOne(MixedReality::class, 'model_id');
    }

    public function files()
    {
        return $this->hasMany(ModelFile::class, 'model_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'model_id');
    }


    public function shopping()
    {
        return $this->belongsToMany(
            Shopping::class,
            'shopping_details',
            'model_id',
            'shopping_id'
        )->withPivot('unit_price')->withTimestamps();
    }

    public function userLicenses()
    {
        return $this->hasMany(UserLicense::class, 'model_id');
    }

    /**
     * Obtener embed_url desde el campo o desde metadata
     */
    public function getEmbedUrlAttribute($value)
    {
        // Si el campo embed_url tiene valor, devolverlo
        if (!empty($value)) {
            return $value;
        }

        // Si no, intentar extraerlo del metadata
        $metadata = $this->metadata;
        if (is_string($metadata)) {
            $metadata = json_decode($metadata, true);
        }
        
        if (is_array($metadata) && isset($metadata['embed_url'])) {
            $url = $metadata['embed_url'];
            // Limpiar URLs escapadas
            return str_replace('\/', '/', $url);
        }

        return null;
    }

}
