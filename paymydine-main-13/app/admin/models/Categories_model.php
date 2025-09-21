<?php

namespace Admin\Models;

use Igniter\Flame\Database\Traits\HasPermalink;
use Igniter\Flame\Database\Traits\Purgeable;
use Igniter\Flame\Exception\ValidationException;
use Model;

/**
 * Categories Model Class
 */
class Categories_model extends Model
{
    use HasPermalink;
    use Purgeable;

    /**
     * @var string The database table name
     */
    protected $table = 'categories';

    /**
     * @var string The primary key column
     */
    protected $primaryKey = 'category_id';

    /**
     * @var array The model table column to convert to dates on insert/update
     */
    public $timestamps = true;

    /**
     * @var array The model table column to convert to dates on insert/update
     */
    protected $dates = ['created_at', 'updated_at'];

    /**
     * @var array The model table column to convert to dates on insert/update
     */
    protected $casts = [
        'category_id' => 'integer',
        'parent_id' => 'integer',
        'priority' => 'integer',
        'status' => 'boolean',
    ];

    /**
     * @var array The model table column to convert to dates on insert/update
     */
    public $relation = [
        'belongsTo' => [
            'parent_cat' => ['Admin\Models\Categories_model', 'foreignKey' => 'parent_id'],
        ],
        'morphToMany' => [
            'locations' => ['Admin\Models\Locations_model', 'name' => 'locationable'],
        ],
    ];

    /**
     * @var array The model table column to convert to dates on insert/update
     */
    public $permalinkable = [
        'permalink_slug' => [
            'source' => 'name',
            'controller' => 'local',
        ],
    ];

    /**
     * @var array The model table column to convert to dates on insert/update
     */
    protected static $allowedSortingColumns = [
        'category_id asc', 'category_id desc',
        'name asc', 'name desc',
        'priority asc', 'priority desc',
        'created_at asc', 'created_at desc',
    ];

    /**
     * @var array The model table column to convert to dates on insert/update
     */
    public $fillable = [
        'name',
        'description',
        'permalink_slug',
        'parent_id',
        'priority',
        'status',
        'thumb',
    ];

    /**
     * @var array The model table column to convert to dates on insert/update
     */
    protected $purgeable = ['thumb'];

    /**
     * @var array The model table column to convert to dates on insert/update
     */
    public static function getDropdownOptions()
    {
        return static::isEnabled()->dropdown('name');
    }

    /**
     * @var array The model table column to convert to dates on insert/update
     */
    public static function isEnabled()
    {
        return static::where('status', 1);
    }

    /**
     * @var array The model table column to convert to dates on insert/update
     */
    public function getParentNameAttribute()
    {
        return $this->parent_cat ? $this->parent_cat->name : null;
    }

    /**
     * @var array The model table column to convert to dates on insert/update
     */
    public function getLocationNameAttribute()
    {
        return $this->locations ? $this->locations->pluck('location_name')->implode(', ') : null;
    }

    /**
     * @var array The model table column to convert to dates on insert/update
     */
    public function scopeWhereHasLocation($query)
    {
        return $query->whereHas('locations');
    }
} 