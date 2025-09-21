# QR Code Grep Index

**Investigation Date**: January 2025  
**Purpose**: Comprehensive code mapping for QR creation and URL builder system

## Commands Used

```bash
# QR-related functions and variables
grep -r "qr_code\|qrcode\|generateUniqueId\|generateQr\|Uuid\|Str::random" --include="*.php" .

# Table-related controllers and models
grep -r "Tables_model\|Table\|table-info\|TableController\|Tables\.php" --include="*.php" .

# QR generation and display
grep -r "edit\.blade\|print\|qr\|qrserver\|create-qr-code" --include="*.php" .

# Tenant middleware and database switching
grep -r "tenant\|TenantDatabaseMiddleware\|getHost\|DB::purge\|DB::reconnect" --include="*.php" .

# Database tables and relationships
grep -r "ti_tables\|locationables\|locations\|table_status" --include="*.php" .
```

## QR Code Generation and Storage

### Core QR Generation Logic
- **File**: `app/admin/models/Tables_model.php:79-90`
  - `generateUniqueId()` method
  - Uses `Str::random(6)` for randomness
  - Format: `ms{sequential}{6chars}`

### QR Code Storage
- **File**: `app/admin/models/Tables_model.php:40`
  - Cast as string: `'qr_code' => 'string'`
- **File**: `app/admin/models/Tables_model.php:121-122`
  - Auto-generation in model boot: `$model->qr_code = $model->generateUniqueId()`

### QR Code Usage in Views
- **File**: `app/admin/views/tables/edit.blade.php:15-50`
  - QR code retrieval: `DB::table('tables')->select('qr_code')->where('table_id', $id)->first()`
  - QR URL construction with query parameters
  - External QR image generation via `api.qrserver.com`

## Table Controllers and API Endpoints

### Main Table Controller
- **File**: `app/Http/Controllers/Api/TableController.php:45-86`
  - `getByQrCode($qrCode)` method
  - Supports both QR code and table ID lookup
  - Returns table information with QR code

### Table Info API
- **File**: `app/Http/Controllers/Api/TableController.php:144-170`
  - `getTableInfo(Request $request)` method
  - Accepts both `table_id` and `qr_code` parameters
  - Queries `ti_tables` table with tenant database

### Admin Table Controller
- **File**: `app/admin/controllers/Api/RestaurantController.php:160-210`
  - `getTableInfo(Request $request, $locationId)` method
  - Similar functionality to main controller
  - Includes location information

## Route Definitions

### API Routes with Tenant Middleware
- **File**: `routes/api.php:122`
  - All v1 API routes protected with `['detect.tenant', 'tenant.database']`
  - Includes table endpoints: `/tables/{qrCode}`, `/table-info`

### Admin Routes
- **File**: `app/admin/routes.php:58,323,333`
  - Contains QR code references in various contexts
  - Includes cashier table with QR code

## QR URL Construction

### Blade Template QR Builder
- **File**: `app/admin/views/tables/edit.blade.php:38-45`
  - Constructs QR redirect URL with multiple parameters
  - Parameters: `location`, `guest`, `date`, `time`, `qr`, `table`
  - Uses `http_build_query()` for URL construction

### External QR Image Generation
- **File**: `app/admin/views/tables/edit.blade.php:46-50`
  - Uses `https://api.qrserver.com/v1/create-qr-code/`
  - Generates base64 encoded QR image
  - Provides download functionality

## Tenant Middleware and Database Switching

### Tenant Detection Middleware
- **File**: `app/Http/Middleware/TenantDatabaseMiddleware.php:15-35`
  - Extracts tenant from subdomain
  - Queries `ti_tenants` table for tenant info
  - Switches database connection with `DB::purge()` and `DB::reconnect()`

### Subdomain Extraction
- **File**: `app/Http/Middleware/TenantDatabaseMiddleware.php:40-55`
  - `extractTenantFromDomain()` method
  - Supports both production and development patterns
  - Handles `tenant.paymydine.com` format

### Database Configuration
- **File**: `config/database.php:63-71`
  - Tenant database configuration
  - Separate connection for tenant databases
  - Environment variable based configuration

## Database Schema References

### Table Structure
- **File**: `db/paymydine.sql:2461-2475`
  - `ti_tables` table definition
  - Includes `qr_code` column as `varchar(30)`
  - No unique constraint on `qr_code` column

### Location Relationships
- **File**: `app/admin/models/Tables_model.php:43-47`
  - Polymorphic relationship with locations
  - Uses `locationables` junction table

### Helper Functions
- **File**: `app/Helpers/TableHelper.php:16-77`
  - `getTableInfo($tableId)` method
  - Caching for table information
  - Validation functions

## Frontend Integration

### Theme Integration
- **File**: `themes/Amir-theme/_partials/categories/default.blade.php:15-19`
  - QR parameter handling in frontend
  - Session storage for QR codes
  - URL parameter processing

### Control Panel
- **File**: `themes/Amir-theme/_partials/localbox/control.blade.php:12-14`
  - QR session management
  - Table session handling
  - Modal integration

## Security and Validation

### Input Validation
- **File**: `app/Http/Controllers/Api/TableController.php:144-170`
  - Basic parameter validation
  - Error handling for missing parameters
  - Database query error handling

### Tenant Isolation
- **File**: `routes/api.php:122`
  - All table endpoints protected by tenant middleware
  - Ensures database isolation between tenants
  - Prevents cross-tenant data access

## Key Findings Summary

1. **QR Generation**: Uses predictable `ms{sequential}{6chars}` format
2. **Database**: No unique constraint on `qr_code` column
3. **URL Construction**: Multiple query parameters included in QR URLs
4. **Tenant Isolation**: Properly implemented with middleware
5. **External Dependency**: Relies on `api.qrserver.com` for QR images
6. **Multiple Controllers**: Several controllers handle table/QR functionality
7. **Session Management**: Frontend uses sessions for QR code storage
8. **Location Integration**: Tables linked to locations via polymorphic relationship

## Files with QR Code References

### Core Files
- `app/admin/models/Tables_model.php` - QR generation logic
- `app/admin/views/tables/edit.blade.php` - QR URL construction
- `app/Http/Controllers/Api/TableController.php` - API endpoints
- `app/Http/Middleware/TenantDatabaseMiddleware.php` - Tenant isolation

### Supporting Files
- `app/Helpers/TableHelper.php` - Helper functions
- `app/admin/controllers/Api/RestaurantController.php` - Admin API
- `routes/api.php` - Route definitions
- `themes/Amir-theme/_partials/categories/default.blade.php` - Frontend integration

### Database Files
- `db/paymydine.sql` - Database schema
- `app/admin/database/migrations/2025_01_27_000000_add_cashier_table.php` - Migration

This grep index provides a comprehensive map of all QR-related code in the system, showing the complete flow from generation to consumption.