<?php

namespace Admin\Models;

use Igniter\Flame\Database\Model;

class History_model extends Model
{
    protected $table = 'notifications';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'type','title','table_id','table_name','payload','status','created_at','updated_at',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function getDetailsAttribute(): array
    {
        $p = $this->payload ?? [];

        switch ($this->type) {
            case 'waiter_call':
                $msg = trim((string)($p['message'] ?? ''));
                $full = $msg && $msg !== '.' ? $msg : 'Waiter Call';
                break;

            case 'table_note':
                $note = trim((string)($p['note'] ?? ''));
                $full = $note !== '' ? $note : 'Table Note';
                break;

            case 'valet_request':
                $name  = trim((string)($p['name'] ?? ''));
                $plate = trim((string)($p['license_plate'] ?? ''));
                $make  = trim((string)($p['car_make'] ?? ''));
                $parts = array_filter([$name, $plate, $make], fn($v) => $v !== '');
                $full = $parts ? ('Valet • '.implode(' • ', $parts)) : 'Valet Request';
                break;

            default:
                $full = $this->title ?: ($p ? json_encode($p) : '');
        }

        // Normalize whitespace
        $full = preg_replace('/\s+/u', ' ', (string)$full);
        
        // Build preview (120 chars max)
        $preview = mb_strlen($full) <= 120 ? $full : mb_substr($full, 0, 120).'…';
        
        // Check if truncated (length > 120 OR unbroken run >= 30)
        $isTruncated = mb_strlen($full) > 120 || (bool)preg_match('/\S{30,}/u', $full);

        return [
            'preview'       => $preview,
            'full'          => $full,
            'is_truncated'  => $isTruncated,
            'metadata'      => [
                'type'    => $this->type,
                'table'   => $this->table_name,
                'created' => $this->created_at,
            ]
        ];
    }

}