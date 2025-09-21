# QR Code Source Mapping

**Investigation Date**: January 2025  
**Purpose**: Exact code references and explanations for QR creation and URL builder system

## QR Token Generator Function

### app/admin/models/Tables_model.php:79-90
```php
public function generateUniqueId()
{
    $prefix = 'ms';
    $sequentialNumber = $this->getNextSequentialNumber();
    $randomString = Str::random(6); // Generate a random 5 character alphanumeric string
    return $prefix . $sequentialNumber.$randomString;
}
```
**Explanation**: Core QR token generation using `ms` prefix + sequential number + 6 random characters. Sequential number is based on latest table_id + 1, making it predictable.

### app/admin/models/Tables_model.php:91-95
```php
public function getNextSequentialNumber()
{
    // Get the latest table_id and increment it
    $latestRecord = self::latest('table_id')->first();
    return $latestRecord ? $latestRecord->table_id + 1 : 1; // Start from 1 if no records exist
}
```
**Explanation**: Gets next sequential number by finding latest table_id and incrementing. This creates predictable QR codes that can be guessed.

### app/admin/models/Tables_model.php:121-122
```php
if (empty($model->qr_code)) {
    $model->qr_code = $model->generateUniqueId();
}
```
**Explanation**: QR code is auto-generated during model saving if empty. Runs in the `saving` event hook.

## QR URL Builder

### app/admin/views/tables/edit.blade.php:38-45
```php
$qr_redirect_url = $frontend_url . '/table/' . $table_id . '?' . http_build_query([
    'location' => $location_id,
    'guest' => $max_capacity,
    'date' => $date,
    'time' => $time,
    'qr' => $qr_code->qr_code,
    'table' => $table_id
]);
```
**Explanation**: Constructs QR redirect URL with multiple query parameters. Uses `http_build_query()` to properly encode parameters. Frontend URL comes from `env('FRONTEND_URL')`.

### app/admin/views/tables/edit.blade.php:46-50
```php
$qr_code_url = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' . urlencode($qr_redirect_url);
$qr_code_image = file_get_contents($qr_code_url);
$base64_qr_code = base64_encode($qr_code_image);
echo '<img id="qr-code" src="data:image/png;base64,' . $base64_qr_code . '" alt="QR Code" />';
```
**Explanation**: Generates QR image using external service `api.qrserver.com`. Downloads image and converts to base64 for display. No tenant identifier in URL - tenant derived from subdomain.

## API Consumer Endpoint

### app/Http/Controllers/Api/TableController.php:144-170
```php
public function getTableInfo(Request $request)
{
    $tableId = $request->get('table_id');
    $qrCode = $request->get('qr_code');
    
    if (!$tableId && !$qrCode) {
        return response()->json([
            'error' => 'table_id or qr_code is required'
        ], 400);
    }

    try {
        $whereClause = $tableId ? "table_id = ?" : "qr_code = ?";
        $param = $tableId ?: $qrCode;
        
        $table = DB::table('ti_tables')
            ->whereRaw($whereClause, [$param])
            ->where('table_status', 1)
            ->first();
```
**Explanation**: Accepts both `table_id` and `qr_code` parameters. Uses raw SQL query with parameter binding. Queries `ti_tables` table after tenant database switch.

### app/Http/Controllers/Api/TableController.php:170-196
```php
// Get location info for frontend URL construction
$location = DB::table('ti_locations')->first();
$domain = request()->getHost();

return response()->json([
    'success' => true,
    'data' => [
        'table_id' => $table->table_id,
        'table_name' => $table->table_name,
        'qr_code' => $table->qr_code,
        'location_id' => $table->location_id,
        'min_capacity' => $table->min_capacity,
        'max_capacity' => $table->max_capacity,
        'table_status' => $table->table_status,
        'frontend_url' => "http://{$domain}/menu/table-{$table->table_id}"
    ]
]);
```
**Explanation**: Returns table information including QR code. Constructs frontend URL using current domain. No validation on QR code format or uniqueness.

## Tenant Middleware

### app/Http/Middleware/TenantDatabaseMiddleware.php:15-35
```php
$tenant = $this->extractTenantFromDomain($request);

if ($tenant) {
    // Find tenant in main database
    $tenantInfo = DB::connection('mysql')->table('ti_tenants')
        ->where('domain', $tenant . '.paymydine.com')
        ->where('status', 'active')
        ->first();
    
    if ($tenantInfo) {
        // Switch to tenant database
        Config::set('database.connections.mysql.database', $tenantInfo->database);
        
        // Reconnect with new database
        DB::purge('mysql');
        DB::reconnect('mysql');
        
        // Store tenant info in request for later use
        $request->attributes->set('tenant', $tenantInfo);
    } else {
        // Tenant not found or inactive
```
**Explanation**: Extracts tenant from subdomain, queries `ti_tenants` table, switches database connection using `DB::purge()` and `DB::reconnect()`. Ensures all subsequent queries hit tenant database.

### app/Http/Middleware/TenantDatabaseMiddleware.php:40-55
```php
private function extractTenantFromDomain(Request $request)
{
    $hostname = $request->getHost();
    $parts = explode('.', $hostname);
    
    // Extract subdomain (e.g., "rosana" from "rosana.paymydine.com")
    if (count($parts) >= 3 && $parts[1] === 'paymydine') {
        return $parts[0];
    }
    
    // For development/testing, also check for localhost patterns
    if (count($parts) >= 2 && $parts[0] !== 'www') {
        return $parts[0];
    }
    
    return null;
}
```
**Explanation**: Extracts tenant from subdomain using `getHost()`. Supports both production (`tenant.paymydine.com`) and development patterns. Returns null if no tenant detected.

## Route Protection

### routes/api.php:122
```php
Route::prefix('v1')->middleware(['detect.tenant', 'tenant.database'])->group(function () {
    // Table endpoints
    Route::get('/tables/{qrCode}', [TableController::class, 'getByQrCode']);
    Route::get('/tables', [TableController::class, 'index']);
    Route::get('/table-info', [TableController::class, 'getTableInfo']);
    Route::get('/table-menu', [MenuController::class, 'getTableMenu']);
});
```
**Explanation**: All API v1 routes protected with `['detect.tenant', 'tenant.database']` middleware. Ensures tenant detection and database switching before any table queries.

## Database Schema

### db/paymydine.sql:2461-2475
```sql
CREATE TABLE `ti_tables` (
  `table_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `table_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `min_capacity` int NOT NULL,
  `max_capacity` int NOT NULL,
  `table_status` tinyint(1) NOT NULL,
  `extra_capacity` int NOT NULL DEFAULT '0',
  `is_joinable` tinyint(1) NOT NULL DEFAULT '1',
  `priority` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `qr_code` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`table_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```
**Explanation**: `ti_tables` table structure. `qr_code` column is `varchar(30)` with no unique constraint. No indexes on `qr_code` or `table_status` columns.

## Key Findings

1. **QR Token Format**: `ms{sequential}{6chars}` - predictable and vulnerable
2. **URL Parameters**: `location`, `guest`, `date`, `time`, `qr`, `table` - no tenant ID
3. **API Parameters**: Accepts both `table_id` and `qr_code` - flexible lookup
4. **Database Switching**: Properly implemented with `DB::purge()` and `DB::reconnect()`
5. **No Uniqueness**: Database lacks unique constraint on `qr_code` column
6. **External Dependency**: Uses `api.qrserver.com` for QR image generation
7. **Tenant Isolation**: Properly enforced through middleware chain
8. **No Validation**: Limited input validation on QR code format

This source mapping provides exact code references for the complete QR creation and consumption flow.