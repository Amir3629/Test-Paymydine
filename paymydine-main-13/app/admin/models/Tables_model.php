<?php

namespace Admin\Models;

use Admin\Traits\Locationable;
use Igniter\Flame\Database\Model;
use Igniter\Flame\Database\Traits\Sortable;
use Illuminate\Support\Str; 

/**
 * Tables Model Class
 */
class Tables_model extends Model
{
    use Locationable;
    use Sortable;

    const LOCATIONABLE_RELATION = 'locations';

    const SORT_ORDER = 'priority';

    /**
     * @var string The database table name
     */
    protected $table = 'tables';

    /**
     * @var string The database table primary key
     */
    protected $primaryKey = 'table_id';

    protected $casts = [
        'min_capacity' => 'integer',
        'max_capacity' => 'integer',
        'extra_capacity' => 'integer',
        'priority' => 'integer',
        'is_joinable' => 'boolean',
        'table_status' => 'boolean',
        'qr_code' => 'string',
    ];

    public $relation = [
        'morphToMany' => [
            'locations' => ['Admin\Models\Locations_model', 'name' => 'locationable'],
        ],
    ];

    public $timestamps = true;

    public static function getDropdownOptions()
    {
        return self::selectRaw('table_id, concat(table_name, " (", min_capacity, " - ", max_capacity, ")") AS display_name')
            ->dropdown('display_name');
    }

    /**
     * Scope a query to only include enabled location
     *
     * @return $this
     */
    public function scopeIsEnabled($query)
    {
        return $query->where('table_status', 1);
    }

    public function scopeWhereBetweenCapacity($query, $noOfGuests)
    {
        return $query->where('min_capacity', '<=', $noOfGuests)
            ->where('max_capacity', '>=', $noOfGuests);
    }



        /**
     * Function to generate the unique ID with the required format
     * ms-{sequential_number}-{random_string}
     */
    public function generateUniqueId()
    {
        $prefix = 'ms';
        $sequentialNumber = $this->getNextSequentialNumber();
        $randomString = Str::random(6); // Generate a random 5 character alphanumeric string
        return $prefix . $sequentialNumber.$randomString;
    }

    /**
     * Get the next sequential number for the ID
     */
    public function getNextSequentialNumber()
    {
        // Get the latest table_id and increment it
        $latestRecord = self::latest('table_id')->first();
        return $latestRecord ? $latestRecord->table_id + 1 : 1; // Start from 1 if no records exist
    }

    /**
     * Boot method to automatically generate the unique ID before saving the record
     */
    public static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if (empty($model->qr_code)) {
                $model->qr_code = $model->generateUniqueId(); // Set the auto-generated ID to the qr_code field
            }
        });
    }


}
