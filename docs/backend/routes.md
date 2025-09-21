# Backend Routes

**Complete route mapping** with methods, paths, controllers, middleware, and authentication requirements.

## 📋 Route Categories

### Admin Panel Routes
- **Prefix**: `/admin` ↩︎ [app/admin/routes.php:1-925]
- **Middleware**: `web`, `TenantDatabaseMiddleware` ↩︎ [app/admin/routes.php:196-197]
- **Authentication**: Session-based for admin users

### API Routes
- **Prefix**: `/api/v1` ↩︎ [routes/api.php:1-207]
- **Middleware**: `cors` ↩︎ [routes/api.php:22]
- **Authentication**: **Unknown** - No authentication found

### Super Admin Routes
- **Prefix**: `/admin` ↩︎ [app/admin/routes.php:200-203]
- **Middleware**: `superadmin.auth` ↩︎ [app/admin/routes.php:202]
- **Bypass**: `TenantDatabaseMiddleware` ↩︎ [app/admin/routes.php:203]

## 🛣️ Complete Route Table

### Admin Panel Routes

| Method | Path | Controller/Action | Middleware | Auth? | Notes |
|--------|------|-------------------|------------|-------|-------|
| GET | `/admin` | `System\Classes\Controller@runAdmin` | `web` | Yes | Admin entry point |
| GET | `/admin/redirect/qr` | `QrRedirectController@handleRedirect` | `TenantDatabaseMiddleware` | No | QR code redirect |
| GET | `/admin/orders/get-table-statuses` | Closure | `web` | Yes | Table status API |
| GET | `/admin/orders/get-cashier-url` | Closure | `web` | Yes | Cashier URL API |
| GET | `/admin/storefront-url` | Closure | `web` | Yes | Storefront redirect |
| POST | `/admin/orders/save-table-layout` | Closure | `web` | Yes | Table layout save |
| GET | `/admin/orders/get-table-qr-url` | Closure | `web` | Yes | Table QR URL API |
| GET | `/admin/new` | `SuperAdminController@showNewPage` | `superadmin.auth` | Yes | Super admin new |
| GET | `/admin/index` | `SuperAdminController@showIndex` | `superadmin.auth` | Yes | Super admin index |
| GET | `/admin/settings` | `SuperAdminController@settings` | `superadmin.auth` | Yes | Super admin settings |
| POST | `/admin/new/store` | `SuperAdminController@store` | None | No | Super admin store |
| POST | `/admin/tenants/update` | `SuperAdminController@update` | None | No | Tenant update |
| GET | `/admin/tenants/delete/{id}` | `SuperAdminController@delete` | None | No | Tenant delete |
| GET | `/admin/superadmin/login` | `SuperAdminController@login` | None | No | Super admin login |
| POST | `/admin/superadmin/sign` | `SuperAdminController@sign` | None | No | Super admin signin |
| GET | `/admin/superadmin/signout` | `SuperAdminController@signOut` | None | No | Super admin logout |
| POST | `/admin/superadmin/settings/update` | `SuperAdminController@updateSettings` | None | No | Settings update |
| POST | `/admin/tenant/update-status` | Closure | None | No | Tenant status update |

### API Routes (routes/api.php)

| Method | Path | Controller/Action | Middleware | Auth? | Notes |
|--------|------|-------------------|------------|-------|-------|
| GET | `/api/health` | Closure | `cors` | No | Health check |
| GET | `/api/images` | Closure | `cors` | No | Image serving |
| GET | `/api/v1/menu` | `MenuController@index` | `cors` | No | Menu items |
| GET | `/api/v1/menu/categories` | `CategoryController@index` | `cors` | No | Menu categories |
| GET | `/api/v1/menu/items` | `MenuController@items` | `cors` | No | Menu items |
| GET | `/api/v1/menu/categories/{categoryId}/items` | `MenuController@itemsByCategory` | `cors` | No | Category items |
| GET | `/api/v1/categories` | `CategoryController@index` | `cors` | No | Categories |
| GET | `/api/v1/categories/{categoryId}` | `CategoryController@show` | `cors` | No | Category details |
| POST | `/api/v1/orders` | `OrderController@store` | `cors` | No | Create order |
| GET | `/api/v1/orders/{orderId}` | `OrderController@show` | `cors` | No | Get order |
| PATCH | `/api/v1/orders/{orderId}` | `OrderController@update` | `cors` | No | Update order |
| GET | `/api/v1/orders` | `OrderController@index` | `cors` | No | List orders |
| GET | `/api/v1/order-status` | `OrderController@getOrderStatus` | `cors` | No | Order status |
| POST | `/api/v1/order-status` | `OrderController@updateOrderStatus` | `cors` | No | Update status |
| GET | `/api/v1/tables/{qrCode}` | `TableController@getByQrCode` | `cors` | No | Table by QR |
| GET | `/api/v1/tables` | `TableController@index` | `cors` | No | List tables |
| GET | `/api/v1/table-info` | `TableController@getTableInfo` | `cors` | No | Table info |
| GET | `/api/v1/table-menu` | `MenuController@getTableMenu` | `cors` | No | Table menu |
| GET | `/api/v1/restaurant` | Closure | `cors` | No | Restaurant info |
| POST | `/api/v1/waiter-call` | Closure | `cors` | No | Waiter call |

### Frontend API Routes (app/admin/routes.php)

| Method | Path | Controller/Action | Middleware | Auth? | Notes |
|--------|------|-------------------|------------|-------|-------|
| GET | `/api/v1/restaurant/{locationId}` | `RestaurantController@getRestaurantInfo` | `api` | No | Restaurant info |
| GET | `/api/v1/restaurant/{locationId}/menu` | `RestaurantController@getMenu` | `api` | No | Restaurant menu |
| POST | `/api/v1/restaurant/{locationId}/order` | `OrderController@createOrder` | `api` | No | Create order |
| GET | `/api/v1/restaurant/{locationId}/order/{orderId}` | `OrderController@getOrderStatus` | `api` | No | Order status |
| POST | `/api/v1/restaurant/{locationId}/waiter` | `OrderController@requestWaiter` | `api` | No | Request waiter |

### Custom API Routes (app/admin/routes.php)

| Method | Path | Controller/Action | Middleware | Auth? | Notes |
|--------|------|-------------------|------------|-------|-------|
| GET | `/api/v1/payments` | Closure | `web` | No | Payment methods |
| GET | `/api/v1/menu` | Closure | `web` | No | Menu with categories |
| GET | `/api/v1/categories` | Closure | `web` | No | Categories |
| GET | `/api/v1/images` | Closure | `web` | No | Image serving |
| GET | `/api/v1/restaurant` | Closure | `web` | No | Restaurant info |
| GET | `/api/v1/settings` | Closure | `web` | No | Settings |
| POST | `/api/v1/orders` | Closure | `web` | No | Order submission |
| GET | `/api/v1/order-status` | Closure | `web` | No | Order status |
| POST | `/api/v1/order-status` | Closure | `web` | No | Update status |
| GET | `/api/v1/table-info` | Closure | `web` | No | Table info |
| GET | `/api/v1/current-table` | Closure | `web` | No | Current table |
| POST | `/api/v1/waiter-call` | Closure | `web` | No | Waiter call |

## 🔒 Authentication Requirements

### Admin Panel
- **Type**: Session-based authentication ↩︎ [app/admin/controllers/SuperAdminController.php:1-50]
- **Login**: `/admin/superadmin/login` ↩︎ [app/admin/routes.php:227-229]
- **Session**: Stored in `superadmin_id` and `superadmin_username` ↩︎ [app/admin/controllers/SuperAdminController.php:15-20]

### API Endpoints
- **Type**: **Unknown** - No authentication found ↩︎ [routes/api.php:1-207]
- **Security**: **Critical Issue** - All API endpoints are public
- **Recommendation**: Implement API authentication (JWT or API keys)

### Super Admin
- **Type**: Session-based with `superadmin.auth` middleware ↩︎ [app/admin/routes.php:202]
- **Bypass**: Tenant middleware bypassed ↩︎ [app/admin/routes.php:203]
- **Access**: Full system access

## 🛡️ Middleware Stack

### Web Middleware
- **CORS**: Cross-origin resource sharing ↩︎ [routes/api.php:22]
- **Session**: Session management
- **CSRF**: **Unknown** - CSRF implementation not found

### API Middleware
- **CORS**: Cross-origin resource sharing ↩︎ [routes/api.php:22]
- **Rate Limiting**: **Unknown** - Rate limiting not implemented
- **Authentication**: **Unknown** - No API authentication

### Tenant Middleware
- **TenantDatabaseMiddleware**: Database switching per tenant ↩︎ [app/Http/Middleware/TenantDatabaseMiddleware.php:1-48]
- **Bypass**: Super admin routes bypass tenant middleware ↩︎ [app/admin/routes.php:203]

## 🚨 Security Issues

### Critical Issues
1. **No API Authentication**: All API endpoints are public ↩︎ [routes/api.php:1-207]
2. **No Rate Limiting**: Endpoints vulnerable to abuse
3. **No CSRF Protection**: **Unknown** - CSRF implementation not found
4. **No Input Validation**: Limited validation on API endpoints

### Recommendations
1. **Implement API Authentication**: Add JWT or API key authentication
2. **Add Rate Limiting**: Prevent API abuse
3. **Add CSRF Protection**: Secure form submissions
4. **Add Input Validation**: Comprehensive request validation

## 📊 Route Performance

### High-Traffic Routes
- **GET /api/v1/menu**: Menu data (no caching)
- **GET /api/v1/orders**: Order listing (no pagination)
- **POST /api/v1/orders**: Order creation (no transactions)

### Performance Issues
1. **No Caching**: Menu data fetched on every request
2. **No Pagination**: Large datasets not paginated
3. **No Transactions**: Order creation not atomic

## 📚 Related Documentation

- **Services**: [services-and-helpers.md](services-and-helpers.md) - Important services and helpers
- **Validation**: [validation-and-errors.md](validation-and-errors.md) - Request validation and error handling
- **Security**: [security.md](security.md) - Authentication, CSRF, rate limiting
- **API**: [../api/README.md](../api/README.md) - API specifications