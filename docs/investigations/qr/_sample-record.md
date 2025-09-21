# Sample QR Record

**Investigation Date**: January 2025  
**Purpose**: Sample QR code and URL from existing database

## Sample Table Record

Based on the database sample data from `ti_tables_sample.txt`:

### Table ID 29 (Most Recent)
- **Table Name**: Table 5
- **QR Code**: `ms01995a68-22a6-712a-90e9-5fe5`
- **Min Capacity**: 5
- **Max Capacity**: 5
- **Status**: 1 (Active)
- **Created**: 2025-09-18 02:19:58

### Table ID 28
- **Table Name**: Table 4
- **QR Code**: `ms28AeaKPP`
- **Min Capacity**: 4
- **Max Capacity**: 4
- **Status**: 1 (Active)
- **Created**: 2025-09-18 02:07:46

### Table ID 27 (Cashier)
- **Table Name**: Cashier
- **QR Code**: `cashier`
- **Min Capacity**: 1
- **Max Capacity**: 1
- **Status**: 1 (Active)
- **Created**: 2025-09-18 01:30:44

## QR URL Construction

Based on the code in `app/admin/views/tables/edit.blade.php:38-45`, the QR URL would be constructed as:

```
http://127.0.0.1:8001/table/29?location=1&guest=5&date=2025-01-15&time=14:30&qr=ms01995a68-22a6-712a-90e9-5fe5&table=29
```

### URL Parameters:
- **Base URL**: `http://127.0.0.1:8001` (from `env('FRONTEND_URL')`)
- **Path**: `/table/29` (table_id)
- **Query Parameters**:
  - `location=1` (location_id)
  - `guest=5` (max_capacity)
  - `date=2025-01-15` (current date)
  - `time=14:30` (current time)
  - `qr=ms01995a68-22a6-712a-90e9-5fe5` (qr_code)
  - `table=29` (table_id)

## QR Code Analysis

### Format Analysis
- **Prefix**: `ms` (consistent)
- **Sequential**: `01`, `28` (based on table_id)
- **Random**: `995a68-22a6-712a-90e9-5fe5`, `AeaKPP` (6 characters)

### Security Observations
1. **Predictable Pattern**: Sequential numbers make QR codes guessable
2. **No Uniqueness**: Database lacks unique constraint on qr_code
3. **Mixed Formats**: Some QR codes are UUID-like (`ms01995a68-22a6-712a-90e9-5fe5`), others are simple (`ms28AeaKPP`)
4. **Special Cases**: Cashier table uses `cashier` as QR code

### QR Image Generation
Based on `app/admin/views/tables/edit.blade.php:46-50`:

```php
$qr_code_url = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' . urlencode($qr_redirect_url);
$qr_code_image = file_get_contents($qr_code_url);
$base64_qr_code = base64_encode($qr_code_image);
```

The QR image would be generated using:
- **Service**: `https://api.qrserver.com/v1/create-qr-code/`
- **Size**: 150x150 pixels
- **Data**: URL-encoded redirect URL
- **Format**: Base64 encoded PNG image

## Multi-Tenant Context

### Tenant Detection
- **Subdomain**: Tenant derived from subdomain (e.g., `tenant.paymydine.com`)
- **Database**: Switched to tenant-specific database before queries
- **Isolation**: QR codes are tenant-specific through database isolation

### URL Structure
- **No Tenant ID**: QR URLs contain no tenant identifier
- **Subdomain Based**: Tenant context derived from subdomain
- **Frontend URL**: Points to Next.js frontend, not Laravel backend

## API Consumption

### Expected Parameters
Based on `app/Http/Controllers/Api/TableController.php:144-170`:

```php
$tableId = $request->get('table_id');
$qrCode = $request->get('qr_code');
```

The API accepts both:
- `table_id` parameter
- `qr_code` parameter

### Database Query
```php
$whereClause = $tableId ? "table_id = ?" : "qr_code = ?";
$param = $tableId ?: $qrCode;

$table = DB::table('ti_tables')
    ->whereRaw($whereClause, [$param])
    ->where('table_status', 1)
    ->first();
```

## Key Findings

1. **QR Format**: `ms{sequential}{6chars}` - predictable and vulnerable
2. **URL Structure**: Multiple query parameters, no tenant ID
3. **Database**: No unique constraint on qr_code column
4. **External Service**: Depends on api.qrserver.com for QR images
5. **Tenant Isolation**: Properly implemented through subdomain and database switching
6. **Mixed Formats**: Some QR codes are UUID-like, others are simple strings
7. **Special Cases**: Cashier table uses special QR code format

This sample record demonstrates the current QR code generation and URL construction system in action.