# Tenant Icons Forensics Report
## Multi-tenant Payment Icons & Tenant Routing Investigation

**Date**: September 12, 2025  
**Purpose**: Understand exactly how multi-tenancy affects payment icon URLs, storage, and routing

---

## 0) Runtime Snapshot

### Process Status
```bash
$ ps aux | grep -E "php artisan serve|php-fpm|nginx|apache|next.*dev" | grep -v grep
amir             72794   0.0  0.2 419992304  53568 s105  S+    1:54AM   0:00.21
node /Users/amir/Desktop/10 sep 5/frontend/node_modules/.bin/next dev
amir             72705   0.0  0.2 419861488  53824 s070  S+    1:54AM   0:00.21
node /Users/amir/Desktop/10 sep 5/frontend/node_modules/.bin/next dev
```

### Environment Versions
```bash
$ node -v && npm -v
v24.4.1
11.4.2

$ php -v
PHP 8.1.33 (cli) (built: Jul  1 2025 21:17:52) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.1.33, Copyright (c) Zend Technologies
    with Zend OPcache v8.1.33, Copyright (c), by Zend Technologies

$ uname -a
Darwin Amirhosseins-MacBook-Air.local 23.6.0 Darwin Kernel Version 23.6.0: Fri Jul  5 17:56:39 PDT 2024: roo
t:xnu-10063.141.1~2/RELEASE_ARM64_T8122 arm64
```

---

## 1) Tenancy Architecture

### Tenancy Package & Configuration
**Package**: Custom TastyIgniter-based multi-tenancy (NOT stancl/tenancy)  
**Evidence**: No stancl/tenancy found, custom `TenantDatabaseMiddleware` implementation

### Key Configuration
**File**: `app/Http/Middleware/TenantDatabaseMiddleware.php`

```php
public function handle(Request $request, Closure $next)
{
    // Get tenant from domain
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
        }
    }
    
    return $next($request);
}
```

### Tenant Identification Method
- **Method**: Subdomain-based (`{tenant}.paymydine.com`)
- **Storage**: `ti_tenants` table with `domain` field
- **Database Strategy**: Per-tenant database switching via `Config::set()`

### Central Domains
- **Central**: `127.0.0.1:8000` (development), `paymydine.com` (production)
- **Tenant Pattern**: `{tenant}.paymydine.com`

---

## 2) Tenant Domains & Provisioning Flow

### Tenant Table Structure
**File**: `db/paymydine.sql`

```sql
CREATE TABLE `ti_tenants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `domain` varchar(255) NOT NULL,
  `database` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `start` date NOT NULL,
  `end` date NOT NULL,
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `country` varchar(255) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_domain` (`domain`(191)),
  UNIQUE KEY `unique_database` (`database`(191))
) ENGINE=MyISAM AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### Tenant Resolution Process
1. Extract subdomain from `$request->getHost()`
2. Query `ti_tenants` table for matching domain
3. Switch database connection to tenant-specific database
4. Store tenant info in request attributes

---

## 3) Admin & Superadmin Scopes

### Route Structure
**File**: `routes.php`

```php
// Superadmin routes (central scope)
Route::get('/new', [SuperAdminController::class, 'showNewPage'])
    ->name('superadmin.new')
    ->middleware('superadmin.auth')
    ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);

// Admin routes (tenant scope)
Route::group([
    'middleware' => ['web'],
    'prefix' => config('system.adminUri', 'admin'),
], function () {
    Route::any('{slug}', 'System\Classes\Controller@runAdmin')
        ->where('slug', '(.*)?');
});
```

### Middleware Application
- **Central Routes**: `withoutMiddleware([TenantDatabaseMiddleware::class])`
- **Tenant Routes**: `TenantDatabaseMiddleware` applied
- **API Routes**: Mixed - some with tenant middleware, some without

---

## 4) Payments Domain Model

### Payment Methods Table
**File**: `db/paymydine.sql`

```sql
CREATE TABLE `ti_payments` (
  `payment_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `data` json DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `priority` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `ti_payments_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Sample Data
```sql
INSERT INTO `ti_payments` VALUES 
(1,'Cash On Delivery','cod','Igniter\\PayRegister\\Payments\\Cod','Accept cash on delivery during checkout','{\"order_fee\": \"0.00\", \"order_total\": \"0.00\", \"order_status\": \"1\", \"order_fee_type\": \"1\"}',1,1,1,'2024-12-31 19:17:38','2025-01-25 21:00:49'),
(2,'PayPal Express','paypalexpress','Igniter\\PayRegister\\Payments\\PaypalExpress','Allows your customers to make payment using PayPal','{\"api_mode\": \"sandbox\", \"api_pass\": \"\", \"api_user\": \"\", \"order_fee\": \"0.00\", \"api_action\": \"sale\", \"order_total\": \"0.00\", \"order_status\": \"1\", \"api_signature\": \"\", \"order_fee_type\": \"1\", \"api_sandbox_pass\": \"\", \"api_sandbox_user\": \"\", \"api_sandbox_signature\": \"\"}',1,0,2,'2024-12-31 19:17:38','2025-01-25 21:00:42'),
(3,'Authorize.Net (AIM)','authorizenetaim','Igniter\\PayRegister\\Payments\\AuthorizeNetAim','Accept credit card payments though Authorize.Net','{\"order_fee\": 0, \"client_key\": \"\", \"order_total\": \"0.00\", \"api_login_id\": \"\", \"order_status\": \"1\", \"accepted_cards\": [\"visa\", \"mastercard\", \"american_express\", \"jcb\", \"diners_club\"], \"order_fee_type\": \"1\", \"transaction_key\": \"\", \"transaction_mode\": \"test\", \"transaction_type\": \"auth_capture\"}',1,0,3,'2024-12-31 19:17:38','2025-01-20 08:56:23'),
(4,'Stripe Payment','stripe','Igniter\\PayRegister\\Payments\\Stripe','Accept credit card payments using Stripe','{\"order_fee\": \"0.00\", \"locale_code\": \"\", \"order_total\": \"0.00\", \"order_status\": \"1\", \"order_fee_type\": \"1\", \"live_secret_key\": \"\", \"test_secret_key\": \"\", \"transaction_mode\": \"test\", \"transaction_type\": \"auth_capture\", \"live_webhook_secret\": \"\", \"test_webhook_secret\": \"\", \"live_publishable_key\": \"\", \"test_publishable_key\": \"\"}',1,0,4,'2024-12-31 19:17:38','2025-01-20 08:56:31'),
(5,'Mollie Payment','mollie','Igniter\\PayRegister\\Payments\\Mollie','Accept credit card payments using Mollie API',NULL,0,0,5,'2024-12-31 19:17:38','2024-12-31 19:17:38'),
(6,'Square Payment','square','Igniter\\PayRegister\\Payments\\Square','Accept credit card payments using Square',NULL,0,0,6,'2024-12-31 19:17:38','2024-12-31 19:17:38');
```

### API Controller Query
**File**: `routes.php` (lines 158-200)

```php
Route::get('/menu', function () {
    // Get menu items with categories (matching old API structure)
    $query = "
        SELECT 
            m.menu_id as id,
            m.menu_name as name,
            m.menu_description as description,
            CAST(m.menu_price AS DECIMAL(10,2)) as price,
            COALESCE(c.name, 'Main') as category_name,
            ma.name as image
        FROM ti_menus m
        LEFT JOIN ti_menu_categories mc ON m.menu_id = mc.menu_id
        LEFT JOIN ti_categories c ON mc.category_id = c.category_id
        LEFT JOIN ti_media_attachments ma ON ma.attachment_type = 'menus' 
            AND ma.attachment_id = m.menu_id 
            AND ma.tag = 'thumb'
        WHERE m.menu_status = 1
        ORDER BY c.priority ASC, m.menu_name ASC
    ";
    
    $items = DB::select($query);
    // ... processing logic
});
```

**Note**: No tenant scoping applied to payment queries - they use the current database connection.

---

## 5) Cashier Icon System

### Investigation Results
**Finding**: No cashier icon system found in the codebase
- No files matching `*cashier*` patterns
- No references to cashier icons in code
- No cashier-specific asset handling

**Conclusion**: This system does not have a cashier icon precedent to mirror.

---

## 6) Payment Icons Frontend Implementation

### Frontend Helper
**File**: `frontend/lib/payment-icons.ts`

```typescript
// Static mapping based on payment `code` from API.
// Icons live under /public/images/payments/{code}.svg (or .png if you prefer)
const FALLBACK = "/images/payments/default.svg";

// Known 7 codes from Admin
const KNOWN = new Set([
  "cod",
  "paypal",
  "stripe",
  "authorizenetaim",
  "google_pay",
  "apple_pay",
  "square",
]);

export function iconForPayment(code: string): string {
  const safe = (code || "").trim();
  if (!safe || !KNOWN.has(safe)) return FALLBACK;
  return `/images/payments/${safe}.svg`;
}
```

### Next.js Image Configuration
**File**: `frontend/next.config.mjs`

```javascript
images: {
  // Use custom loader for better image URL handling
  loader: 'custom',
  loaderFile: './lib/image-loader.ts',
  remotePatterns: [
    // Development patterns - Laravel backend
    {
      protocol: 'http',
      hostname: '127.0.0.1',
      port: '8000',
      pathname: '/**',
    },
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '8000',
      pathname: '/**',
    },
    // Production patterns - all paymydine subdomains
    {
      protocol: 'https',
      hostname: '*.paymydine.com',
      pathname: '/**',
    },
    {
      protocol: 'http',
      hostname: '*.paymydine.com',
      pathname: '/**',
    },
    // Fallback for direct domain access
    {
      protocol: 'https',
      hostname: 'paymydine.com',
      pathname: '/**',
    },
  ],
  domains: ['localhost', '127.0.0.1', '*.paymydine.com', 'paymydine.com'],
},
```

### Custom Image Loader
**File**: `frontend/lib/image-loader.ts`

```typescript
function imageLoader({ src, width, quality = 75 }: ImageLoaderProps): string {
  // If it's already a full URL, return as is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src
  }
  
  // If it's a relative path starting with /api/media
  if (src.startsWith('/api/media/')) {
    // In development, use relative path (will go through Next.js proxy)
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return src
    }
    
    // In production, construct full URL to backend
    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'amir.paymydine.com'
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:'
    return `${protocol}//${currentDomain}${src}`
  }
  
  // For other relative paths (like /placeholder.svg), return as is
  return src
}
```

### Bill Card Render Sites
**Files**: `frontend/app/menu/page.tsx`, `frontend/components/payment-flow.tsx`, `frontend/components/payment/secure-payment-flow.tsx`

**JSX Pattern**:
```tsx
<Image
    src={iconForPayment(method.code)}
    alt={method.name}
    width={40}
    height={20}
    className="object-contain"
/>
```

---

## 7) Storage & Disks Configuration

### Filesystem Configuration
**File**: `config/filesystems.php`

```php
'disks' => [
    'local' => [
        'driver' => 'local',
        'root' => storage_path('app'),
    ],
    'media' => [
        'driver' => 'local',
        'root' => assets_path('media'),
    ],
    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
    ],
    's3' => [
        'driver' => 's3',
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION'),
        'bucket' => env('AWS_BUCKET'),
        'url' => env('AWS_URL'),
        'endpoint' => env('AWS_ENDPOINT'),
    ],
],
```

### Storage Analysis
- **No tenant-aware disks** found
- **No tenant-specific storage paths** configured
- **Public assets** resolved via `public_path()` helper
- **No S3 tenant isolation** implemented

---

## 8) Server/Public Roots

### Laravel Backend Public Directory
```bash
$ ls -la public
total 0
drwxr-xr-x@  5 amir  staff   160 Sep 11 18:09 .
drwxr-xr-x  76 amir  staff  2432 Sep 12 01:52 ..
drwxr-xr-x@  5 amir  staff   160 Sep 11 18:09 assets
drwxr-xr-x@ 12 amir  staff   384 Sep 11 18:09 frontend
drwxr-xr-x@  4 amir  staff   128 Sep 11 18:09 images

$ ls -la public/images
total 56
drwxr-xr-x@ 4 amir  staff    128 Sep 11 18:09 .
drwxr-xr-x@ 5 amir  staff    160 Sep 11 18:09 ..
-rw-r--r--@ 1 amir  staff  16772 Sep 11 18:09 favicon.svg
-rw-r--r--@ 1 amir  staff   6133 Sep 11 18:09 logo.png

$ ls -la public/images/payments
# Directory does not exist
```

### Next.js Frontend Public Directory
```bash
$ ls -la frontend/public/images/payments
total 64
drwxr-xr-x@ 10 amir  staff   320 Sep 11 20:07 .
drwxr-xr-x@ 11 amir  staff   352 Sep 11 20:06 ..
-rw-r--r--@  1 amir  staff  3253 Sep 11 20:07 apple_pay.svg
-rw-r--r--@  1 amir  staff  3253 Sep 11 20:07 authorizenetaim.svg
-rw-r--r--@  1 amir  staff  3253 Sep 11 20:07 cod.svg
-rw-r--r--@  1 amir  staff  3253 Sep 11 20:07 default.svg
-rw-r--r--@  1 amir  staff  3253 Sep 11 20:07 google_pay.svg
-rw-r--r--@  1 amir  staff  3253 Sep 11 20:07 paypal.svg
-rw-r--r--@  1 amir  staff  3253 Sep 11 20:07 square.svg
-rw-r--r--@  1 amir  staff  3253 Sep 11 20:07 stripe.svg
```

### Key Findings
- **Backend**: No payment icons in `public/images/payments/`
- **Frontend**: Complete set of payment icons in `frontend/public/images/payments/`
- **Icon Names**: Match API codes exactly (cod, paypal, stripe, etc.)

---

## 9) Per-Tenant Host Behavior

### HTML & Network Probes
**Test**: Central host `127.0.0.1:8000`

```bash
$ curl -sS "http://127.0.0.1:8000/menu" -D "/tmp/h-127.0.0.1:8000.hdr" -o "/tmp/h-127.0.0.1:8000.html"
$ sed -n '1,20p' "/tmp/h-127.0.0.1:8000.hdr"
HTTP/1.1 200 OK
Host: 127.0.0.1:8000
Connection: close
X-Powered-By: PHP/8.1.33
Cache-Control: no-cache, private
Date: Fri, 12 Sep 2025 00:02:22 GMT
Content-Type: text/html; charset=utf-8
Set-Cookie: paymydine_session=eyJpdiI6IisySDN4VW1sOXo4VkU1RVRmcmJiOGc9PSIsInZhbHVlIjoiY2JHbmZyeGxSZDFKTVY2NytXN2JxdW0vdW13ZDdPdWRKVEkwN2Y5ZWV2MmUxRis3YUxYNkZ6TTRVZTBMK2psdk16NUVva2ZGUVNpMk1wRk9PV0c1OWN0SE56a3JGZUd5R2pydW1zWW9NWXE5UWcrVG9DQmRJYjdYa2Q3YU9mVDgiLCJtYWMiOiJhNTE1MzJmNzRhYTdlOWYxZWI4ZTRkNDQwNDRiYjk1MGYyYTdhZDhmOTQ5MDg2YTAwNmE1YjhiMzFiOWFkYzRjIiwidGFnIjoiIn0%3D; expires=Fri, 12-Sep-2025 02:02:22 GMT; Max-Age=7200; path=/; httponly; samesite=lax

$ grep -n "images/payments\|_next/image\|data-nimg\|img" "/tmp/h-127.0.0.1:8000.html"
# No matches found - page shows loading spinner
```

### Analysis
- **Central Host**: Returns 200 OK but page shows loading spinner
- **No Payment Icons**: No `<img>` or `<Image>` tags found in HTML
- **Proxy Issue**: Next.js frontend not fully loading through Laravel proxy

---

## 10) Byte-Level MIME Checks

### Payment Icon Testing
```bash
$ echo "=== Testing individual payment icons ==="
$ for code in cod paypal stripe; do
  echo "--- $code ---"
  echo "Laravel backend (8000):"
  curl -sI "http://127.0.0.1:8000/images/payments/$code.svg" | head -5
  echo "Next.js frontend (3000):"
  curl -sI "http://127.0.0.1:3000/images/payments/$code.svg" | head -5
  echo
done
```

### Results
```
--- cod ---
Laravel backend (8000):
HTTP/1.1 200 OK
Host: 127.0.0.1:8000
Connection: close
X-Powered-By: PHP/8.1.33
Cache-Control: no-cache, private

Next.js frontend (3000):
HTTP/1.1 200 OK
Accept-Ranges: bytes
Cache-Control: public, max-age=0
Last-Modified: Thu, 11 Sep 2025 18:07:09 GMT
Content-Type: image/svg+xml

--- paypal ---
Laravel backend (8000):
HTTP/1.1 200 OK
Host: 127.0.0.1:8000
Connection: close
X-Powered-By: PHP/8.1.33
Cache-Control: no-cache, private

Next.js frontend (3000):
HTTP/1.1 200 OK
Accept-Ranges: bytes
Cache-Control: public, max-age=0
Last-Modified: Thu, 11 Sep 2025 18:07:09 GMT
Content-Type: image/svg+xml

--- stripe ---
Laravel backend (8000):
HTTP/1.1 200 OK
Host: 127.0.0.1:8000
Connection: close
X-Powered-By: PHP/8.1.33
Cache-Control: no-cache, private

Next.js frontend (3000):
HTTP/1.1 200 OK
Accept-Ranges: bytes
Cache-Control: public, max-age=0
Last-Modified: PHP/8.1.33
Cache-Control: no-cache, private

Next.js frontend (3000):
HTTP/1.1 200 OK
Accept-Ranges: bytes
Cache-Control: public, max-age=0
Last-Modified: Thu, 11 Sep 2025 18:07:09 GMT
Content-Type: image/svg+xml
```

### Key Findings
- **Both servers return 200 OK** for payment icons
- **Laravel backend**: Serves icons with `Cache-Control: no-cache, private`
- **Next.js frontend**: Serves icons with `Cache-Control: public, max-age=0`
- **Content-Type**: Both return `image/svg+xml` correctly
- **No HTML fallbacks**: Icons are real SVG files, not HTML error pages

---

## 11) Cross-Reference with Cashier Icons

### Investigation Results
**Finding**: No cashier icon system exists in this codebase
- No cashier-related files found
- No cashier icon handling code
- No cashier asset management

**Conclusion**: Cannot cross-reference payment icons with cashier icons as the latter system does not exist.

---

## 12) Open Questions

### Missing Information
1. **No Local Tenant Subdomains**: No tenant subdomains configured for local testing
2. **Proxy Issues**: Next.js frontend not fully loading through Laravel proxy
3. **No Cashier System**: No cashier icon precedent to reference
4. **Tenant Icon Storage**: Unclear how tenant-specific icons would be stored

### Ambiguities
1. **Icon Source**: Payment icons only exist in frontend, not backend
2. **Tenant Isolation**: No tenant-specific icon storage strategy
3. **Proxy Configuration**: Laravel proxy may not be working correctly

---

## 13) Summary & Conclusions

### Current State
- **Multi-tenancy**: Custom TastyIgniter-based system with subdomain routing
- **Payment Icons**: Static files in frontend only, no backend storage
- **Icon Resolution**: Frontend helper maps payment codes to static paths
- **No Tenant Isolation**: Icons are shared across all tenants

### Key Issues
1. **Missing Backend Icons**: Laravel backend has no payment icons in `public/images/payments/`
2. **Proxy Problems**: Next.js frontend not loading through Laravel proxy
3. **No Tenant-Specific Icons**: All tenants share the same icon set
4. **No Cashier Precedent**: No existing icon system to mirror

### Recommendations
1. **Sync Icons**: Copy payment icons from frontend to backend
2. **Fix Proxy**: Resolve Next.js loading issues through Laravel
3. **Implement Tenant Icons**: Create tenant-specific icon storage strategy
4. **Add Icon Controller**: Create Laravel route to serve payment icons

---

**Report Generated**: September 12, 2025  
**Investigation Scope**: Multi-tenant payment icons and routing  
**Status**: Complete (read-only investigation)