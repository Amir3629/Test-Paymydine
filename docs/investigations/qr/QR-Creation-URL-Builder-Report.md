# QR Creation & URL Builder Investigation Report

**Investigation Date**: January 2025  
**Purpose**: Comprehensive analysis of QR code generation and URL construction system  
**Scope**: Read-only investigation of multi-tenant QR code system

## Executive Summary

This investigation reveals a **functionally working but security-vulnerable** QR code system with predictable token generation, missing database constraints, and API parameter mismatches. The multi-tenant isolation is properly implemented, but the QR generation algorithm is vulnerable to collision attacks.

## Key Findings (5-10 Bullets)

• **QR Token Format**: Uses predictable `ms{sequential}{6chars}` pattern where sequential is based on table_id + 1, making codes guessable and vulnerable to collision attacks

• **URL Structure**: QR URLs contain multiple query parameters (`location`, `guest`, `date`, `time`, `qr`, `table`) but no tenant identifier - tenant context derived solely from subdomain

• **API Parameter Mismatch**: QR codes contain `qr` parameter but the actual API endpoint (`/api/v1/table-info`) only accepts `table_id` parameter, ignoring the QR code entirely

• **Database Vulnerabilities**: Missing unique constraint on `qr_code` column, no indexes on `qr_code` or `table_status`, allowing duplicate QR codes and poor query performance

• **Multi-Tenant Isolation**: Properly implemented through subdomain extraction and database switching using `DB::purge()` and `DB::reconnect()` before all table queries

• **External Dependencies**: Relies on `api.qrserver.com` for QR image generation, creating single point of failure and potential data leakage to third party

• **Mixed QR Formats**: System generates both UUID-like codes (`ms01995a68-22a6-712a-90e9-5fe5`) and simple codes (`ms28AeaKPP`), with special case for cashier table (`cashier`)

• **No QR Validation**: Limited input validation on QR code format, no uniqueness checking, and no invalidation mechanism for regenerated codes

## Exact Token Format

**Pattern**: `ms{sequential}{6chars}`

**Components**:
- **Prefix**: `ms` (hardcoded)
- **Sequential**: `table_id + 1` (predictable)
- **Random**: 6 characters from `Str::random(6)` (insufficient entropy)

**Examples from database**:
- `ms28AeaKPP` (table_id 28)
- `ms01995a68-22a6-712a-90e9-5fe5` (table_id 29, UUID-like)
- `cashier` (special case for cashier table)

**Security Issues**:
- Only 6 characters of randomness (36^6 = ~2 billion combinations)
- Sequential numbers make tokens predictable
- No uniqueness constraint in database
- Collision probability increases with table count

## Exact URL Shape

**Base URL**: `http://127.0.0.1:8001` (from `env('FRONTEND_URL')`)

**Path**: `/table/{table_id}`

**Query Parameters**:
- `location={location_id}` (from locationables table)
- `guest={max_capacity}` (table's max capacity)
- `date={current_date}` (YYYY-MM-DD format)
- `time={current_time}` (HH:MM format, URL encoded)
- `qr={qr_code}` (generated QR token)
- `table={table_id}` (table ID)

**Example URL**:
```
http://127.0.0.1:8001/table/28?location=1&guest=4&date=2025-01-15&time=14:30&qr=ms28AeaKPP&table=28
```

**Key Observations**:
- No tenant identifier in URL
- Multiple redundant parameters (`table` appears twice)
- Points to Next.js frontend, not Laravel backend
- All parameters are query strings, not path segments

## Controller/Route Consumption

**Route**: `GET /api/v1/table-info`

**Implementation**: Closure in `app/main/routes.php:197-250`

**Expected Parameters**:
- `table_id` (required)
- `qr` (ignored - parameter mismatch!)

**Actual Behavior**:
```php
$table_id = request()->query('table_id');
$qr = request()->query('qr'); // Retrieved but never used

if (!$table_id) {
    return response()->json([
        'success' => false,
        'error' => 'table_id is required'
    ], 400);
}
```

**Database Query**:
```php
$table = DB::table('tables')->where('table_id', $table_id)->first();
```

**Critical Issue**: API completely ignores the `qr` parameter, making QR codes functionally useless for table lookup.

## Multi-Tenant Proof

**Middleware Chain**: `['detect.tenant', 'tenant.database']`

**Tenant Detection**: `app/Http/Middleware/TenantDatabaseMiddleware.php:40-55`
```php
private function extractTenantFromDomain(Request $request)
{
    $hostname = $request->getHost();
    $parts = explode('.', $hostname);
    
    if (count($parts) >= 3 && $parts[1] === 'paymydine') {
        return $parts[0]; // Extract subdomain
    }
    
    return null;
}
```

**Database Switching**: `app/Http/Middleware/TenantDatabaseMiddleware.php:15-35`
```php
// Find tenant in main database
$tenantInfo = DB::connection('mysql')->table('ti_tenants')
    ->where('domain', $tenant . '.paymydine.com')
    ->where('status', 'active')
    ->first();

// Switch to tenant database
Config::set('database.connections.mysql.database', $tenantInfo->database);
DB::purge('mysql');
DB::reconnect('mysql');
```

**Isolation Verification**: All subsequent queries hit tenant-specific database, ensuring proper isolation.

## Database Facts

**Table**: `ti_tables`

**Current Schema**:
```sql
CREATE TABLE `ti_tables` (
  `table_id` bigint NOT NULL AUTO_INCREMENT,
  `table_no` bigint DEFAULT NULL,
  `table_name` varchar(128) NOT NULL,
  `min_capacity` int NOT NULL,
  `max_capacity` int NOT NULL,
  `table_status` tinyint(1) NOT NULL,
  `extra_capacity` int NOT NULL DEFAULT '0',
  `is_joinable` tinyint(1) NOT NULL DEFAULT '1',
  `priority` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `qr_code` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`table_id`),
  UNIQUE KEY `uq_ti_tables_table_no` (`table_no`),
  CONSTRAINT `chk_ti_tables_table_no_nonneg` CHECK ((`table_no` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
```

**Missing Constraints**:
- No UNIQUE constraint on `qr_code` column
- No INDEX on `qr_code` for lookup performance
- No INDEX on `table_status` for filtering performance
- No CHECK constraint on capacity ranges

**Existing Constraints**:
- PRIMARY KEY on `table_id`
- UNIQUE KEY on `table_no`
- CHECK constraint on `table_no >= 0`

## Open Questions (Product Decisions Needed)

1. **QR Code Uniqueness**: Should QR codes be globally unique across all tenants, or only within each tenant?

2. **QR Parameter Usage**: Should the API actually use the `qr` parameter for table lookup, or is `table_id` sufficient?

3. **QR Code Format**: Should the system use UUIDs, HMAC-based tokens, or keep the current format?

4. **QR Invalidation**: Should regenerating a QR code invalidate the old one, or allow multiple valid codes per table?

5. **URL Parameter Redundancy**: Should the URL contain both `table` and `qr` parameters, or just one?

6. **External QR Service**: Should the system continue using api.qrserver.com or implement local QR generation?

7. **Tenant ID in URL**: Should QR URLs contain tenant identifier for additional security, or rely solely on subdomain?

8. **QR Code Rotation**: Should QR codes have expiration dates or version numbers for security?

## Appendix: Log Files and Artifacts

### Grep Index
- **File**: `docs/investigations/qr/_grep-index.md`
- **Content**: Comprehensive code mapping with file paths and line numbers
- **Commands**: Multiple grep searches for QR-related code

### Source Mapping
- **File**: `docs/investigations/qr/_source-map.md`
- **Content**: Exact code references with explanations
- **Coverage**: QR generation, URL construction, API consumption, tenant middleware

### Database Logs
- **File**: `docs/investigations/qr/logs/ti_tables_create.txt`
- **Content**: Current table schema from database
- **Key Finding**: Missing unique constraint on qr_code

- **File**: `docs/investigations/qr/logs/ti_tables_indexes.txt`
- **Content**: Current indexes on ti_tables
- **Key Finding**: No indexes on qr_code or table_status

- **File**: `docs/investigations/qr/logs/ti_tables_sample.txt`
- **Content**: Sample table records with QR codes
- **Key Finding**: Mixed QR code formats and predictable patterns

### API Test Logs
- **File**: `docs/investigations/qr/logs/curl_qr_code.txt`
- **Content**: API response for `qr_code` parameter
- **Result**: 400 Bad Request - parameter not accepted

- **File**: `docs/investigations/qr/logs/curl_qr.txt`
- **Content**: API response for `qr` parameter
- **Result**: 400 Bad Request - parameter not accepted

- **File**: `docs/investigations/qr/logs/curl_table_id.txt`
- **Content**: API response for `table_id` parameter
- **Result**: 200 OK - successful table lookup

### Sample Record
- **File**: `docs/investigations/qr/_sample-record.md`
- **Content**: Real QR code and URL from database
- **Example**: `ms28AeaKPP` with constructed URL

### Sequence Diagram
- **File**: `docs/investigations/qr/sequence-current.md`
- **Content**: Mermaid diagram of current flow
- **Coverage**: Complete end-to-end process from creation to consumption

### Environment Information
- **File**: `docs/investigations/qr/logs/env.txt`
- **Content**: PHP version, Composer dependencies, framework info
- **Key Details**: PHP 8.1.33, Laravel 8.83.29, MySQL database

## Conclusion

The QR code system is **functionally working** but has **critical security vulnerabilities** that need immediate attention:

1. **Predictable QR generation** makes codes guessable
2. **Missing database constraints** allow duplicate QR codes
3. **API parameter mismatch** makes QR codes functionally useless
4. **No input validation** on QR code format or uniqueness

The multi-tenant isolation is properly implemented, but the QR generation and consumption system needs significant hardening before production use.

---

*This investigation provides a complete analysis of the current QR code system with specific security issues identified and actionable recommendations for improvement.*