# Order-Related Routes Documentation

## Route Mapping Overview

**Framework**: TastyIgniter v3 (Laravel 8.x)  
**Evidence**: `app/admin/routes.php:L1-762`, `routes/api.php:L1-200`

## Admin Panel Routes

### Order Management Routes

| Method | Path | Middleware | Controller@Method | File:Lines | Description |
|--------|------|------------|-------------------|------------|-------------|
| GET | `/admin/orders/get-table-statuses` | `web` | Closure | `app/admin/routes.php:L23-62` | Get table statuses for order creation |
| POST | `/admin/orders/save-table-layout` | `web` | Closure | `app/admin/routes.php:L130-159` | Save table layout configuration |
| GET | `/admin/orders/get-table-qr-url` | `web` | Closure | `app/admin/routes.php:L159-221` | Generate QR code URL for table |

### Admin Panel Entry Points

| Method | Path | Middleware | Controller@Method | File:Lines | Description |
|--------|------|------------|-------------------|------------|-------------|
| ANY | `/admin/{slug}` | `web` | `System\Classes\Controller@runAdmin` | `app/admin/routes.php:L64-67` | Admin panel catch-all |
| ANY | `/admin` | `web` | `System\Classes\Controller@runAdmin` | `app/admin/routes.php:L69` | Admin panel entry |

**Note**: The admin panel uses TastyIgniter's standard admin interface. The actual order management is handled by the `Orders` controller (`app/admin/controllers/Orders.php:L11`) which implements:
- `ListController` - Order listing
- `FormController` - Order creation/editing
- `LocationAwareController` - Location-based filtering
- `AssigneeController` - Staff assignment

## API Routes

### Frontend API Routes (No Tenant Required)

| Method | Path | Middleware | Controller@Method | File:Lines | Description |
|--------|------|------------|-------------------|------------|-------------|
| GET | `/api/v1/menu` | `web` | Closure | `app/admin/routes.php:L248-307` | Get menu items and categories |
| GET | `/api/v1/categories` | `web` | Closure | `app/admin/routes.php:L433-468` | Get menu categories |
| GET | `/api/v1/restaurant` | `web` | Closure | `app/admin/routes.php:L505-525` | Get restaurant information |
| GET | `/api/v1/settings` | `web` | Closure | `app/admin/routes.php:L525-540` | Get system settings |
| **POST** | **`/api/v1/orders`** | **`web`** | **Closure** | **`app/admin/routes.php:L248-405`** | **Order submission endpoint** |
| GET | `/api/v1/order-status` | `web` | Closure | `app/admin/routes.php:L540-600` | Get order status |
| POST | `/api/v1/order-status` | `web` | Closure | `app/admin/routes.php:L600-650` | Update order status |
| GET | `/api/v1/table-info` | `web` | Closure | `app/admin/routes.php:L650-700` | Get table information |
| GET | `/api/v1/current-table` | `web` | Closure | `app/admin/routes.php:L700-750` | Get current table from URL params |
| POST | `/api/v1/waiter-call` | `web` | Closure | `app/admin/routes.php:L750-762` | Call waiter service |

### Tenant-Aware API Routes

| Method | Path | Middleware | Controller@Method | File:Lines | Description |
|--------|------|------------|-------------------|------------|-------------|
| GET | `/api/v1/restaurant/{locationId}` | `api` | `RestaurantController@getRestaurantInfo` | `app/admin/routes.php:L226` | Get restaurant info by location |
| GET | `/api/v1/restaurant/{locationId}/menu` | `api` | `RestaurantController@getMenu` | `app/admin/routes.php:L227` | Get menu by location |
| **POST** | **`/api/v1/restaurant/{locationId}/order`** | **`api`** | **`OrderController@createOrder`** | **`app/admin/routes.php:L230`** | **Create order (API controller)** |
| GET | `/api/v1/restaurant/{locationId}/order/{orderId}` | `api` | `OrderController@getOrderStatus` | `app/admin/routes.php:L231` | Get order status |
| POST | `/api/v1/restaurant/{locationId}/waiter` | `api` | `OrderController@requestWaiter` | `app/admin/routes.php:L232` | Request waiter service |

## Frontend Routes (Next.js)

### Menu and Order Routes

| Method | Path | Component | File:Lines | Description |
|--------|------|-----------|------------|-------------|
| GET | `/menu` | `MenuPage` | `frontend/app/menu/page.tsx:L1-1802` | Main menu page |
| GET | `/order-placed` | `OrderPlacedPage` | `frontend/app/order-placed/page.tsx` | Order confirmation page |
| GET | `/table/{tableId}` | `TablePage` | `frontend/app/table/[tableId]/page.tsx` | Table-specific menu |

## Route Analysis

### Order Creation Routes

#### 1. Frontend API Route (Primary)
**Path**: `POST /api/v1/orders`  
**File**: `app/admin/routes.php:L248-405`  
**Middleware**: `web`  
**Description**: Direct order submission from frontend

**Request Validation**:
```php
$request->validate([
    'customer_name' => 'required|string|max:255',
    'table_id' => 'required|string|max:50',
    'table_name' => 'required|string|max:100',
    'items' => 'required|array|min:1',
    'items.*.menu_id' => 'required|integer|exists:menus,menu_id',
    'items.*.name' => 'required|string|max:255',
    'items.*.quantity' => 'required|integer|min:1',
    'items.*.price' => 'required|numeric|min:0',
    'total_amount' => 'required|numeric|min:0',
    'payment_method' => 'required|in:cash,card,paypal'
]);
```

**Database Operations**:
- `DB::table('orders')->insertGetId()` - Create order
- `DB::table('order_menus')->insert()` - Add order items
- `DB::table('order_totals')->insert()` - Add totals and payment method

#### 2. API Controller Route (Secondary)
**Path**: `POST /api/v1/restaurant/{locationId}/order`  
**File**: `app/admin/controllers/Api/OrderController.php:L20-100`  
**Middleware**: `api`  
**Description**: Structured order creation using models

**Request Validation**:
```php
$request->validate([
    'items' => 'required|array|min:1',
    'items.*.menu_id' => 'required|integer',
    'items.*.name' => 'required|string',
    'items.*.quantity' => 'required|integer|min:1',
    'items.*.price' => 'required|numeric|min:0',
    'customer_name' => 'required|string|max:255',
    'customer_email' => 'nullable|email',
    'customer_phone' => 'nullable|string|max:20',
    'table_id' => 'nullable|string',
    'table_name' => 'nullable|string',
    'total_amount' => 'required|numeric|min:0',
    'tip_amount' => 'nullable|numeric|min:0',
    'payment_method' => 'required|string|in:cash,card,paypal',
    'special_instructions' => 'nullable|string|max:500'
]);
```

**Model Operations**:
- `Orders_model::create()` - Create order
- `$order->addOrderItem()` - Add order items (⚠️ **BUG: Method doesn't exist**)
- `DB::table('ti_order_totals')->insert()` - Add totals

### Status Management Routes

#### Order Status Retrieval
**Path**: `GET /api/v1/order-status`  
**File**: `app/admin/routes.php:L540-600`  
**Parameters**: `order_id` (required)

#### Order Status Update
**Path**: `POST /api/v1/order-status`  
**File**: `app/admin/routes.php:L600-650`  
**Parameters**: `order_id`, `status`

### Table Management Routes

#### Table Status Retrieval
**Path**: `GET /admin/orders/get-table-statuses`  
**File**: `app/admin/routes.php:L23-62`  
**Description**: Get current status of all tables based on recent orders

#### QR Code URL Generation
**Path**: `GET /admin/orders/get-table-qr-url`  
**File**: `app/admin/routes.php:L159-221`  
**Parameters**: `table_id` (required)  
**Description**: Generate frontend menu URL for table

## Middleware Analysis

### Web Middleware
- **Applied to**: Frontend API routes
- **Purpose**: Session management, CSRF protection
- **Evidence**: `app/admin/routes.php:L248`

### API Middleware
- **Applied to**: Tenant-aware API routes
- **Purpose**: API authentication, rate limiting
- **Evidence**: `app/admin/routes.php:L221-225`

### Tenant Database Middleware
- **Applied to**: QR redirect route
- **Purpose**: Database tenant isolation
- **Evidence**: `app/admin/routes.php:L70`

## Route Security

### CORS Configuration
**File**: `app/admin/controllers/Api/OrderController.php:L15-20`
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

### CSRF Protection
- **Web routes**: CSRF token required
- **API routes**: No CSRF protection (stateless)

### Authentication
- **Admin routes**: Session-based authentication
- **API routes**: No authentication (public endpoints)

## Critical Issues

### ❌ Missing Method
**Issue**: `$order->addOrderItem($item)` called but method doesn't exist  
**File**: `app/admin/controllers/Api/OrderController.php:L86`  
**Impact**: Order creation will fail  
**Fix**: Implement `addOrderItem()` method or use `addOrderMenus()`

### ❌ No Database Transactions
**Issue**: Order creation not wrapped in transactions  
**File**: `app/admin/routes.php:L248-405`  
**Impact**: Partial order creation possible on failure  
**Fix**: Wrap order creation in `DB::transaction()`

### ❌ No Foreign Key Constraints
**Issue**: Referential integrity not enforced  
**Impact**: Orphaned records possible  
**Fix**: Add foreign key constraints to database schema

## Recommendations

1. **Fix Critical Bug**: Implement missing `addOrderItem()` method
2. **Add Transactions**: Wrap order creation in database transactions
3. **Add Authentication**: Implement API authentication for order endpoints
4. **Add Rate Limiting**: Prevent abuse of order creation endpoints
5. **Add Validation**: Server-side validation for all order data
6. **Add Logging**: Log all order creation attempts for audit trail