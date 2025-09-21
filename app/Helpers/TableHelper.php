<?php

namespace App\Helpers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class TableHelper
{
    /**
     * Get table information for notifications
     *
     * @param string $tableId
     * @return array|null
     */
    public static function getTableInfo($tableId)
    {
        // Use cache to avoid repeated database queries
        return Cache::remember("table_info_{$tableId}", 300, function() use ($tableId) {
            $table = DB::table('tables')
                ->where('table_id', $tableId)
                ->where('table_status', 1)
                ->first();
                
            if (!$table) {
                return null;
            }
            
            return [
                'table_id' => $table->table_id,
                'table_name' => $table->table_name,
                'qr_code' => $table->qr_code,
                'min_capacity' => $table->min_capacity,
                'max_capacity' => $table->max_capacity,
                'is_joinable' => $table->is_joinable,
                'priority' => $table->priority
            ];
        });
    }
    
    /**
     * Validate table exists and is active
     *
     * @param string $tableId
     * @return bool
     */
    public static function validateTable($tableId)
    {
        return DB::table('tables')
            ->where('table_id', $tableId)
            ->where('table_status', 1)
            ->exists();
    }

    /**
     * Get table name by ID
     *
     * @param string $tableId
     * @return string|null
     */
    public static function getTableName($tableId)
    {
        $tableInfo = self::getTableInfo($tableId);
        return $tableInfo ? $tableInfo['table_name'] : null;
    }

    /**
     * Clear table cache
     *
     * @param string $tableId
     * @return void
     */
    public static function clearTableCache($tableId)
    {
        Cache::forget("table_info_{$tableId}");
    }
}