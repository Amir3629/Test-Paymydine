# Tenancy & Permissions Documentation

## Multi-Tenant Architecture

**Framework**: TastyIgniter v3 (Laravel 8.x) with custom tenant middleware  
**Evidence**: `app/admin/routes.php:L70`, `composer.json:L1-68`

## Tenant Database Middleware

### Middleware Implementation

**File**: `app/admin/routes.php:L70`

```php
Route::get('/redirect/qr', [QrRedirectController::class, 'handleRedirect'])
->middleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);
```

**Class**: `\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware`  
**Purpose**: Database tenant isolation  
**Evidence**: Referenced in multiple route definitions

### Tenant Resolution Process

**Inferred from usage**:
1. Extract tenant identifier from request (subdomain, domain, or parameter)
2. Switch database connection to tenant-specific database
3. Process request with tenant context
4. Return response

### Tenant Database Configuration

**Evidence**: `app/admin/routes.php:L114-130`

```php
Route::post('/tenant/update-status', function (Request $request) {
    $id = $request->input('id');
    $status = $request->input('status') === 'activate' ? 'active' : 'disabled';

    $updated = DB::connection('mysql')->table('tenants')->where('id', $id)->update(['status' => $status]);

    if ($updated) {
        return response()->json(['success' => true]);
    } else {
        return response()->json(['success' => false, 'error' => 'Failed to update']);
    }
})->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);
```

**Key Points**:
- Uses `DB::connection('mysql')` for tenant management
- Tenant status stored in `tenants` table
- Tenant management routes bypass tenant middleware

## Tenant Database Structure

### Tenants Table

**Inferred from code**:
```sql
CREATE TABLE `tenants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(50) NOT NULL,
  -- other tenant fields
  PRIMARY KEY (`id`)
);
```

### Tenant Status Values

| Status | Description |
|--------|-------------|
| `active` | Tenant is active and accessible |
| `disabled` | Tenant is disabled and inaccessible |

## Permission System

### Admin Panel Permissions

**File**: `app/admin/controllers/Orders.php:L15-20`

```php
protected $requiredPermissions = [
    'Admin.Orders',
    'Admin.AssignOrders',
    'Admin.DeleteOrders',
];
```

### Permission Matrix

| Permission | Description | Required For |
|------------|-------------|--------------|
| `Admin.Orders` | View and manage orders | Order listing, creation, editing |
| `Admin.AssignOrders` | Assign orders to staff | Order assignment |
| `Admin.DeleteOrders` | Delete orders | Order deletion |

### Permission Checks

**File**: `app/admin/controllers/Orders.php:L70-80`

```php
public function index_onDelete()
{
    if (!$this->getUser()->hasPermission('Admin.DeleteOrders'))
        throw new ApplicationException(lang('admin::lang.alert_user_restricted'));

    return $this->asExtension('Admin\Actions\ListController')->index_onDelete();
}
```

**Evidence**: Permission checks implemented for destructive actions only.

## Role-Based Access Control

### User Roles

**Inferred from TastyIgniter framework**:
- **Super Admin**: Full system access
- **Admin**: Restaurant management access
- **Staff**: Limited order management access
- **Customer**: Frontend order creation only

### Role Permissions

| Role | Orders | Assignments | Deletion | Status Updates |
|------|--------|-------------|----------|----------------|
| Super Admin | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Admin | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Staff | ✅ Limited | ❌ No | ❌ No | ✅ Limited |
| Customer | ❌ No | ❌ No | ❌ No | ❌ No |

## Tenant Isolation

### Database Isolation

**Method**: Separate database per tenant  
**Evidence**: `TenantDatabaseMiddleware` switches database connections

### Data Isolation

**Tables**: All order-related tables are tenant-isolated  
**Evidence**: No tenant_id columns found in order tables

### API Isolation

**Method**: Location-based isolation for API routes  
**Evidence**: `app/admin/routes.php:L226-232`

```php
Route::get('restaurant/{locationId}', 'RestaurantController@getRestaurantInfo');
Route::get('restaurant/{locationId}/menu', 'RestaurantController@getMenu');
Route::post('restaurant/{locationId}/order', 'OrderController@createOrder');
Route::get('restaurant/{locationId}/order/{orderId}', 'OrderController@getOrderStatus');
Route::post('restaurant/{locationId}/waiter', 'OrderController@requestWaiter');
```

## Security Considerations

### Tenant Access Control

**Issue**: No explicit tenant access validation  
**Impact**: Potential cross-tenant data access  
**Fix**: Implement tenant access validation

### Permission Validation

**Issue**: Limited permission checks  
**Impact**: Unauthorized access possible  
**Fix**: Implement comprehensive permission checks

### API Security

**Issue**: No authentication for API endpoints  
**Impact**: Public access to order creation  
**Fix**: Implement API authentication

## Tenant Management

### Tenant Creation

**File**: `app/admin/routes.php:L74-90`

```php
Route::get('/new', [SuperAdminController::class, 'showNewPage'])
    ->name('superadmin.new')
    ->middleware('superadmin.auth')
    ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);

Route::match(['get', 'post'], '/new/store', [SuperAdminController::class, 'store'])
    ->name('superadmin.store')
    ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);
```

### Tenant Status Management

**File**: `app/admin/routes.php:L114-130`

```php
Route::post('/tenant/update-status', function (Request $request) {
    $id = $request->input('id');
    $status = $request->input('status') === 'activate' ? 'active' : 'disabled';

    $updated = DB::connection('mysql')->table('tenants')->where('id', $id)->update(['status' => $status]);

    if ($updated) {
        return response()->json(['success' => true]);
    } else {
        return response()->json(['success' => false, 'error' => 'Failed to update']);
    }
})->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);
```

## Super Admin Access

### Super Admin Routes

**File**: `app/admin/routes.php:L74-115`

```php
Route::get('/new', [SuperAdminController::class, 'showNewPage'])
    ->name('superadmin.new')
    ->middleware('superadmin.auth')
    ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);

Route::get('/index', [SuperAdminController::class, 'showIndex'])
    ->name('superadmin.index')
    ->middleware('superadmin.auth')
    ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);

Route::get('/settings', [SuperAdminController::class, 'settings'])
    ->name('superadmin.settings')
    ->middleware('superadmin.auth')
    ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);
```

**Key Points**:
- Super admin routes bypass tenant middleware
- Protected by `superadmin.auth` middleware
- Access to tenant management functions

### Super Admin Authentication

**File**: `app/admin/routes.php:L101-115`

```php
Route::get('/superadmin/login', [SuperAdminController::class, 'login'])
    ->name('login.new')
    ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);

Route::post('/superadmin/sign', [SuperAdminController::class, 'sign'])
    ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);

Route::get('/superadmin/signout', [SuperAdminController::class, 'signOut'])
    ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);
```

## Critical Issues

### ❌ No Tenant Access Validation
**Issue**: No explicit validation of tenant access rights  
**Impact**: Potential cross-tenant data access  
**Fix**: Implement tenant access validation

### ❌ No API Authentication
**Issue**: API endpoints require no authentication  
**Impact**: Public access to order creation  
**Fix**: Implement API authentication

### ❌ No Permission Granularity
**Issue**: Limited permission granularity  
**Impact**: Over-privileged access  
**Fix**: Implement fine-grained permissions

### ❌ No Tenant Isolation Validation
**Issue**: No validation of tenant isolation  
**Impact**: Data leakage between tenants  
**Fix**: Implement tenant isolation validation

## Recommendations

1. **Implement Tenant Access Validation**: Validate tenant access rights
2. **Add API Authentication**: Implement API authentication
3. **Add Permission Granularity**: Implement fine-grained permissions
4. **Add Tenant Isolation Validation**: Validate tenant isolation
5. **Add Audit Logging**: Log all tenant and permission changes
6. **Add Security Monitoring**: Monitor for security violations
7. **Add Role Management**: Implement role management system
8. **Add Permission Inheritance**: Implement permission inheritance
9. **Add Multi-Factor Authentication**: Implement MFA for admin access
10. **Add Session Management**: Implement secure session management

## Performance Considerations

1. **No Tenant Caching**: Tenant data not cached
2. **No Permission Caching**: Permission checks not cached
3. **No Database Optimization**: Tenant queries not optimized
4. **No Connection Pooling**: Database connections not pooled
5. **No Load Balancing**: No load balancing for tenants

## Monitoring & Logging

1. **No Tenant Logging**: Tenant access not logged
2. **No Permission Logging**: Permission checks not logged
3. **No Security Monitoring**: No security monitoring
4. **No Audit Trail**: No audit trail for changes
5. **No Performance Monitoring**: No performance metrics