# Admin Endpoints Security Analysis & Least Privilege Audit

**Analysis Date**: January 2025  
**Purpose**: Document admin routes, middleware, and ensure least privilege access

## 1. Admin Routes & Middleware Analysis

### Route Structure Overview

**Base Admin Routes**: `app/admin/routes.php`
- **Prefix**: `/admin` (configurable via `system.adminUri`)
- **Base Middleware**: `['web']`
- **Authentication**: Mixed - some protected, many unprotected

### SuperAdmin Routes (Critical)

| Route | Method | Middleware | Auth Required | Risk Level |
|-------|--------|------------|---------------|------------|
| `/admin/new` | GET | `superadmin.auth` | ✅ Yes | 🟡 Medium |
| `/admin/index` | GET | `superadmin.auth` | ✅ Yes | 🟡 Medium |
| `/admin/settings` | GET | `superadmin.auth` | ✅ Yes | 🟡 Medium |
| `/admin/new/store` | GET/POST | None | ❌ No | 🔴 **CRITICAL** |
| `/admin/tenants/update` | GET/POST | None | ❌ No | 🔴 **CRITICAL** |
| `/admin/tenants/delete/{id}` | GET | None | ❌ No | 🔴 **CRITICAL** |
| `/admin/superadmin/login` | GET | None | ❌ No | 🟡 Medium |
| `/admin/superadmin/sign` | POST | None | ❌ No | 🟡 Medium |
| `/admin/superadmin/signout` | GET | None | ❌ No | 🟡 Medium |
| `/admin/superadmin/settings/update` | POST | None | ❌ No | 🔴 **CRITICAL** |
| `/admin/tenant/update-status` | POST | None | ❌ No | 🔴 **CRITICAL** |

### Public API Routes (High Risk)

| Route | Method | Middleware | Auth Required | Risk Level |
|-------|--------|------------|---------------|------------|
| `/api/v1/payments` | GET | `web` | ❌ No | 🟡 Medium |
| `/api/v1/menu` | GET | `web` | ❌ No | 🟢 Low |
| `/api/v1/categories` | GET | `web` | ❌ No | 🟢 Low |
| `/api/v1/restaurant` | GET | `web` | ❌ No | 🟢 Low |
| `/api/v1/settings` | GET | `web` | ❌ No | 🟡 Medium |
| `/api/v1/orders` | POST | `web` | ❌ No | 🔴 **CRITICAL** |
| `/api/v1/order-status` | GET/POST | `web` | ❌ No | 🔴 **CRITICAL** |
| `/api/v1/table-info` | GET | `web` | ❌ No | 🟡 Medium |
| `/api/v1/waiter-call` | POST | `web` | ❌ No | 🟡 Medium |
| `/api/v1/table-notes` | POST | `web` | ❌ No | 🟡 Medium |

### Admin API Routes (Protected)

| Route | Method | Middleware | Auth Required | Risk Level |
|-------|--------|------------|---------------|------------|
| `/admin/notifications-api/count` | GET | `AdminAuthenticate` | ✅ Yes | 🟢 Low |
| `/admin/notifications-api/` | GET | `AdminAuthenticate` | ✅ Yes | 🟢 Low |
| `/admin/notifications-api/{id}` | PATCH | `AdminAuthenticate` | ✅ Yes | 🟢 Low |
| `/admin/notifications-api/mark-all-seen` | PATCH | `AdminAuthenticate` | ✅ Yes | 🟢 Low |

## 2. Authentication & Authorization Analysis

### Authentication Systems

#### 1. SuperAdmin Authentication
**File**: `app/admin/controllers/SuperAdminController.php:31-59`

```php
public function sign(Request $request)
{
    $request->validate([
        'username' => 'required|string',
        'password' => 'required|string',
    ]);

    $superAdmin = DB::connection('mysql')
        ->table('superadmin')
        ->where('username', $request->username)
        ->first();

    if (!$superAdmin || !Hash::check($request->password, $superAdmin->password)) {
        return redirect()->back()->withErrors(['message' => 'Invalid credentials']);
    }

    // Store user session
    Session::put('superadmin_id', $superAdmin->id);
    Session::put('superadmin_username', $superAdmin->username);
    Session::save();
}
```

**Issues**:
- ✅ Password hashing with `Hash::check()`
- ❌ No rate limiting on login attempts
- ❌ No CSRF protection on login form
- ❌ Session management is basic

#### 2. Admin Authentication
**File**: `app/admin/classes/AdminController.php:198-211`

```php
if ($requireAuthentication) {
    if (!$this->checkUser()) {
        return Request::ajax()
            ? Response::make(lang('admin::lang.alert_user_not_logged_in'), 403)
            : Admin::redirectGuest('login');
    }

    // Check that user has permission to view this page
    if ($this->requiredPermissions && !$this->getUser()->hasAnyPermission($this->requiredPermissions)) {
        return Response::make(Request::ajax()
            ? lang('admin::lang.alert_user_restricted')
            : $this->makeView('access_denied'), 403
        );
    }
}
```

**Issues**:
- ✅ Permission checking implemented
- ❌ CSRF token verification only in `remap()` method
- ❌ No role-based access control granularity

### Permission System

#### Permission Structure
**File**: `app/admin/ServiceProvider.php:660-686`

```php
$manager->registerPermissions('Admin', [
    'Admin.Dashboard' => [
        'label' => 'admin::lang.permissions.dashboard', 'group' => 'admin::lang.permissions.name',
    ],
    'Admin.Allergens' => [
        'label' => 'admin::lang.permissions.allergens', 'group' => 'admin::lang.permissions.name',
    ],
    'Admin.Categories' => [
        'label' => 'admin::lang.permissions.categories', 'group' => 'admin::lang.permissions.name',
    ],
    'Admin.Menus' => [
        'label' => 'admin::lang.permissions.menus', 'group' => 'admin::lang.permissions.name',
    ],
    'Admin.Orders' => [
        'label' => 'admin::lang.permissions.orders', 'group' => 'admin::lang.permissions.name',
    ],
    // ... more permissions
]);
```

#### Staff Roles
**File**: `app/admin/models/Staff_roles_model.php:56-71`

```php
public function setPermissionsAttribute($permissions)
{
    foreach ($permissions ?? [] as $permission => $value) {
        if (!in_array($value = (int)$value, [-1, 0, 1])) {
            throw new InvalidArgumentException(sprintf(
                'Invalid value "%s" for permission "%s" given.', $value, $permission
            ));
        }

        if ($value === 0) {
            unset($permissions[$permission]);
        }
    }

    $this->attributes['permissions'] = !empty($permissions) ? serialize($permissions) : '';
}
```

**Permission Values**:
- `-1`: Deny
- `0`: Not set (inherit)
- `1`: Allow

## 3. Critical Security Issues

### 🔴 **CRITICAL: Unprotected SuperAdmin Routes**

#### 1. Tenant Management (No Authentication)
```php
// app/admin/routes.php:217-226
Route::match(['get', 'post'], '/new/store', [SuperAdminController::class, 'store'])
    ->name('superadmin.store')
    ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);

Route::match(['get', 'post'], '/tenants/update', [SuperAdminController::class, 'update'])
    ->name('tenants.update')
    ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);

Route::get('/tenants/delete/{id}', [SuperAdminController::class, 'delete'])
    ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);
```

**Risk**: Anyone can create, update, or delete tenants without authentication.

#### 2. Settings Update (No Authentication)
```php
// app/admin/routes.php:238
Route::post('/superadmin/settings/update', [SuperAdminController::class, 'updateSettings'])
    ->name('superadmin.update') 
    ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);
```

**Risk**: Anyone can update superadmin settings without authentication.

#### 3. Tenant Status Updates (No Authentication)
```php
// app/admin/routes.php:240-250
Route::post('/tenant/update-status', function (Request $request) {
    $id = $request->input('id');
    $status = $request->input('status') === 'activate' ? 'active' : 'disabled';

    $updated = DB::connection('mysql')->table('tenants')->where('id', $id)->update(['status' => $status]);
    // ...
})->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);
```

**Risk**: Anyone can activate/deactivate tenants without authentication.

### 🔴 **CRITICAL: Unprotected Order Management**

#### Order Creation (No Authentication)
```php
// app/admin/routes.php:569-750
Route::post('/orders', function (Request $request) {
    // Order creation logic with database transactions
    // NO AUTHENTICATION REQUIRED
});
```

**Risk**: Anyone can create orders without authentication.

#### Order Status Updates (No Authentication)
```php
// app/admin/routes.php:800-820
Route::post('/order-status', function (Request $request) {
    $request->validate([
        'order_id' => 'required|integer',
        'status' => 'required|string|in:pending,confirmed,preparing,ready,delivered,cancelled'
    ]);
    // Order status update logic
    // NO AUTHENTICATION REQUIRED
});
```

**Risk**: Anyone can update order status without authentication.

### 🟡 **MEDIUM: Missing CSRF Protection**

#### CSRF Token Verification
**File**: `app/admin/classes/AdminController.php:190-192`

```php
if (!$this->verifyCsrfToken()) {
    return Response::make(lang('admin::lang.alert_invalid_csrf_token'), 403);
}
```

**Issues**:
- CSRF verification only in `remap()` method
- Many routes bypass this verification
- No CSRF protection on API routes

### 🟡 **MEDIUM: Insufficient Input Validation**

#### Order Creation Validation
```php
$validationRules = [
    'customer_name' => 'required|string|max:255',
    'items' => 'required|array|min:1',
    'items.*.menu_id' => 'required|integer|exists:menus,menu_id',
    'items.*.name' => 'required|string|max:255',
    'items.*.quantity' => 'required|integer|min:1',
    'items.*.price' => 'required|numeric|min:0',
    'total_amount' => 'required|numeric|min:0',
    'payment_method' => 'required|in:cash,card,paypal'
];
```

**Issues**:
- No rate limiting on order creation
- No validation of order totals against menu prices
- No protection against duplicate orders

## 4. Required Permission Mapping

### Current Permission Structure

| Permission | Description | Required For |
|------------|-------------|--------------|
| `Admin.Dashboard` | Access to admin dashboard | Dashboard access |
| `Admin.Orders` | Order management | Order CRUD operations |
| `Admin.Menus` | Menu management | Menu CRUD operations |
| `Admin.Categories` | Category management | Category CRUD operations |
| `Admin.Tables` | Table management | Table CRUD operations |
| `Admin.Locations` | Location management | Location CRUD operations |
| `Admin.Staff` | Staff management | Staff CRUD operations |
| `Admin.Settings` | System settings | Settings modification |

### Missing Permissions

| Permission | Description | Required For |
|------------|-------------|--------------|
| `Admin.Tenants` | Tenant management | SuperAdmin operations |
| `Admin.SuperAdmin` | SuperAdmin access | SuperAdmin operations |
| `Admin.Orders.Create` | Create orders | Order creation |
| `Admin.Orders.Update` | Update orders | Order status updates |
| `Admin.Orders.Delete` | Delete orders | Order deletion |
| `Admin.Payments` | Payment management | Payment operations |
| `Admin.Notifications` | Notification management | Notification operations |

## 5. Patch Suggestions

### 1. Add Authentication to Critical Routes

```php
// Fix: Add authentication to tenant management
Route::match(['get', 'post'], '/new/store', [SuperAdminController::class, 'store'])
    ->name('superadmin.store')
    ->middleware('superadmin.auth')
    ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);

Route::match(['get', 'post'], '/tenants/update', [SuperAdminController::class, 'update'])
    ->name('tenants.update')
    ->middleware('superadmin.auth')
    ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);

Route::get('/tenants/delete/{id}', [SuperAdminController::class, 'delete'])
    ->middleware('superadmin.auth')
    ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);
```

### 2. Add Authentication to Order Management

```php
// Fix: Add authentication to order routes
Route::post('/orders', function (Request $request) {
    // Order creation logic
})->middleware(['web', 'AdminAuthenticate', 'permission:Admin.Orders.Create']);

Route::post('/order-status', function (Request $request) {
    // Order status update logic
})->middleware(['web', 'AdminAuthenticate', 'permission:Admin.Orders.Update']);
```

### 3. Add CSRF Protection

```php
// Fix: Add CSRF protection to all POST routes
Route::group(['middleware' => ['web', 'csrf']], function () {
    Route::post('/orders', function (Request $request) {
        // Order creation logic
    });
    
    Route::post('/order-status', function (Request $request) {
        // Order status update logic
    });
});
```

### 4. Add Rate Limiting

```php
// Fix: Add rate limiting to sensitive endpoints
Route::post('/orders', function (Request $request) {
    // Order creation logic
})->middleware(['throttle:10,1']); // 10 requests per minute

Route::post('/superadmin/sign', [SuperAdminController::class, 'sign'])
    ->middleware(['throttle:5,1']); // 5 login attempts per minute
```

### 5. Add Input Validation

```php
// Fix: Add comprehensive input validation
Route::post('/orders', function (Request $request) {
    $request->validate([
        'customer_name' => 'required|string|max:255',
        'items' => 'required|array|min:1|max:20', // Limit items
        'items.*.menu_id' => 'required|integer|exists:menus,menu_id',
        'items.*.quantity' => 'required|integer|min:1|max:10', // Limit quantity
        'items.*.price' => 'required|numeric|min:0|max:1000', // Limit price
        'total_amount' => 'required|numeric|min:0|max:10000', // Limit total
        'payment_method' => 'required|in:cash,card,paypal',
        'table_id' => 'required|string|max:50',
        'table_name' => 'required|string|max:100',
    ]);
    
    // Additional validation: verify total amount
    $calculatedTotal = 0;
    foreach ($request->items as $item) {
        $calculatedTotal += $item['price'] * $item['quantity'];
    }
    
    if (abs($request->total_amount - $calculatedTotal) > 0.01) {
        return response()->json(['error' => 'Total amount mismatch'], 400);
    }
    
    // Order creation logic
});
```

### 6. Add Permission Middleware

```php
// Fix: Create permission middleware
class PermissionMiddleware
{
    public function handle($request, Closure $next, $permission)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        if (!auth()->user()->hasPermission($permission)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        
        return $next($request);
    }
}

// Register middleware
Route::middleware(['web', 'AdminAuthenticate', 'permission:Admin.Orders.Create'])
    ->post('/orders', function (Request $request) {
        // Order creation logic
    });
```

### 7. Add Audit Logging

```php
// Fix: Add audit logging for sensitive operations
Route::post('/orders', function (Request $request) {
    // Order creation logic
    
    // Log the action
    Log::info('Order created', [
        'user_id' => auth()->id(),
        'order_id' => $orderId,
        'customer_name' => $request->customer_name,
        'total_amount' => $request->total_amount,
        'ip_address' => $request->ip(),
        'user_agent' => $request->userAgent(),
    ]);
    
    return response()->json(['success' => true, 'order_id' => $orderId]);
});
```

## 6. Complete Route Security Table

### Fixed Route Security

| Route | Method | Middleware | Auth Required | Permission Required | CSRF | Rate Limit | Risk Level |
|-------|--------|------------|---------------|-------------------|------|------------|------------|
| `/admin/new` | GET | `superadmin.auth` | ✅ Yes | SuperAdmin | ✅ Yes | ❌ No | 🟡 Medium |
| `/admin/index` | GET | `superadmin.auth` | ✅ Yes | SuperAdmin | ✅ Yes | ❌ No | 🟡 Medium |
| `/admin/settings` | GET | `superadmin.auth` | ✅ Yes | SuperAdmin | ✅ Yes | ❌ No | 🟡 Medium |
| `/admin/new/store` | POST | `superadmin.auth` | ✅ Yes | SuperAdmin | ✅ Yes | ✅ Yes | 🟢 Low |
| `/admin/tenants/update` | POST | `superadmin.auth` | ✅ Yes | SuperAdmin | ✅ Yes | ✅ Yes | 🟢 Low |
| `/admin/tenants/delete/{id}` | GET | `superadmin.auth` | ✅ Yes | SuperAdmin | ✅ Yes | ✅ Yes | 🟢 Low |
| `/admin/superadmin/sign` | POST | `throttle:5,1` | ❌ No | None | ✅ Yes | ✅ Yes | 🟡 Medium |
| `/api/v1/orders` | POST | `AdminAuthenticate,permission:Admin.Orders.Create` | ✅ Yes | Orders.Create | ✅ Yes | ✅ Yes | 🟢 Low |
| `/api/v1/order-status` | POST | `AdminAuthenticate,permission:Admin.Orders.Update` | ✅ Yes | Orders.Update | ✅ Yes | ✅ Yes | 🟢 Low |
| `/api/v1/menu` | GET | `web` | ❌ No | None | ❌ No | ✅ Yes | 🟢 Low |
| `/api/v1/waiter-call` | POST | `web` | ❌ No | None | ✅ Yes | ✅ Yes | 🟡 Medium |

## 7. Implementation Priority

### **Phase 1: Critical Security (Immediate)**
1. Add authentication to tenant management routes
2. Add authentication to order management routes
3. Add CSRF protection to all POST routes
4. Add rate limiting to sensitive endpoints

### **Phase 2: Enhanced Security (Week 1)**
1. Implement granular permission system
2. Add comprehensive input validation
3. Add audit logging for sensitive operations
4. Implement role-based access control

### **Phase 3: Monitoring & Compliance (Week 2)**
1. Add security monitoring
2. Implement access logging
3. Add security headers
4. Implement security testing

## 8. Security Headers

### Required Security Headers

```php
// Add to all admin routes
Route::group(['middleware' => ['web', 'security.headers']], function () {
    // Admin routes
});

// Security headers middleware
class SecurityHeadersMiddleware
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);
        
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Content-Security-Policy', "default-src 'self'");
        
        return $response;
    }
}
```

## 9. Testing Checklist

### Security Testing

- [ ] Test unauthenticated access to protected routes
- [ ] Test CSRF token validation
- [ ] Test rate limiting on sensitive endpoints
- [ ] Test permission-based access control
- [ ] Test input validation and sanitization
- [ ] Test audit logging functionality
- [ ] Test session management and timeout
- [ ] Test password policy enforcement

### Functional Testing

- [ ] Test order creation with valid data
- [ ] Test order creation with invalid data
- [ ] Test order status updates
- [ ] Test tenant management operations
- [ ] Test menu management operations
- [ ] Test user role and permission changes

---

*This analysis provides comprehensive documentation of admin endpoint security issues with specific patch suggestions and implementation priorities.*