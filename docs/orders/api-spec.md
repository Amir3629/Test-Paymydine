# API Specification - Order Endpoints

## Overview

**Framework**: TastyIgniter v3 (Laravel 8.x)  
**Base URL**: `http://127.0.0.1:8000`  
**Content-Type**: `application/json`  
**Evidence**: `app/admin/routes.php:L1-762`, `app/admin/controllers/Api/OrderController.php:L1-254`

## Order Submission Endpoint

### POST /api/v1/orders

**Description**: Submit a new order from the frontend  
**File**: `app/admin/routes.php:L248-405`  
**Middleware**: `web`  
**Authentication**: None (public endpoint)

#### Request

**Headers**:
```
Content-Type: application/json
Accept: application/json
```

**Body**:
```json
{
  "customer_name": "John Doe",
  "table_id": "7",
  "table_name": "Table 7",
  "customer_email": "john@example.com",
  "customer_phone": "+1234567890",
  "items": [
    {
      "menu_id": 1,
      "name": "Pasta Carbonara",
      "quantity": 2,
      "price": 15.99,
      "special_instructions": "Extra cheese"
    }
  ],
  "total_amount": 31.98,
  "tip_amount": 5.00,
  "payment_method": "card",
  "special_instructions": "Please bring extra napkins"
}
```

**Validation Rules**:
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

#### Response

**Success (200)**:
```json
{
  "success": true,
  "order_id": 123,
  "message": "Order placed successfully"
}
```

**Error (500)**:
```json
{
  "success": false,
  "error": "Failed to create order",
  "message": "Menu item with ID 999 not found"
}
```

#### cURL Example

```bash
curl -X POST http://127.0.0.1:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "customer_name": "John Doe",
    "table_id": "7",
    "table_name": "Table 7",
    "customer_email": "john@example.com",
    "customer_phone": "+1234567890",
    "items": [
      {
        "menu_id": 1,
        "name": "Pasta Carbonara",
        "quantity": 2,
        "price": 15.99,
        "special_instructions": "Extra cheese"
      }
    ],
    "total_amount": 31.98,
    "tip_amount": 5.00,
    "payment_method": "card",
    "special_instructions": "Please bring extra napkins"
  }'
```

## API Controller Order Endpoint

### POST /api/v1/restaurant/{locationId}/order

**Description**: Create order using structured API controller  
**File**: `app/admin/controllers/Api/OrderController.php:L20-100`  
**Middleware**: `api`  
**Authentication**: None (public endpoint)

#### Request

**Headers**:
```
Content-Type: application/json
Accept: application/json
```

**Body**:
```json
{
  "items": [
    {
      "menu_id": 1,
      "name": "Pasta Carbonara",
      "quantity": 2,
      "price": 15.99,
      "special_instructions": "Extra cheese"
    }
  ],
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+1234567890",
  "table_id": "7",
  "table_name": "Table 7",
  "total_amount": 31.98,
  "tip_amount": 5.00,
  "payment_method": "card",
  "special_instructions": "Please bring extra napkins"
}
```

**Validation Rules**:
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

#### Response

**Success (201)**:
```json
{
  "success": true,
  "order_id": 123,
  "message": "Order placed successfully"
}
```

**Error (500)**:
```json
{
  "success": false,
  "error": "Failed to create order",
  "message": "Menu item with ID 999 not found"
}
```

#### cURL Example

```bash
curl -X POST http://127.0.0.1:8000/api/v1/restaurant/1/order \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "items": [
      {
        "menu_id": 1,
        "name": "Pasta Carbonara",
        "quantity": 2,
        "price": 15.99,
        "special_instructions": "Extra cheese"
      }
    ],
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+1234567890",
    "table_id": "7",
    "table_name": "Table 7",
    "total_amount": 31.98,
    "tip_amount": 5.00,
    "payment_method": "card",
    "special_instructions": "Please bring extra napkins"
  }'
```

## Order Status Endpoints

### GET /api/v1/order-status

**Description**: Get order status by order ID  
**File**: `app/admin/routes.php:L540-600`  
**Middleware**: `web`  
**Authentication**: None (public endpoint)

#### Request

**Query Parameters**:
- `order_id` (required): Order ID to check

#### Response

**Success (200)**:
```json
{
  "success": true,
  "data": {
    "order_id": 123,
    "status_id": 3,
    "status_name": "preparing",
    "customer_status": 1,
    "updated_at": "2025-01-15T14:30:00Z"
  }
}
```

**Error (400)**:
```json
{
  "error": "order_id is required"
}
```

**Error (404)**:
```json
{
  "error": "Order not found"
}
```

#### cURL Example

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/order-status?order_id=123" \
  -H "Accept: application/json"
```

### POST /api/v1/order-status

**Description**: Update order status  
**File**: `app/admin/routes.php:L600-650`  
**Middleware**: `web`  
**Authentication**: None (public endpoint)

#### Request

**Body**:
```json
{
  "order_id": 123,
  "status": "preparing"
}
```

**Validation Rules**:
```php
$request->validate([
    'order_id' => 'required|integer',
    'status' => 'required|string|in:pending,confirmed,preparing,ready,delivered,cancelled'
]);
```

#### Response

**Success (200)**:
```json
{
  "success": true,
  "message": "Order status updated successfully"
}
```

**Error (400)**:
```json
{
  "success": false,
  "error": "Failed to update order status"
}
```

#### cURL Example

```bash
curl -X POST http://127.0.0.1:8000/api/v1/order-status \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "order_id": 123,
    "status": "preparing"
  }'
```

## Menu Endpoints

### GET /api/v1/menu

**Description**: Get menu items and categories  
**File**: `app/admin/routes.php:L248-307`  
**Middleware**: `web`  
**Authentication**: None (public endpoint)

#### Response

**Success (200)**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Pasta Carbonara",
        "description": "Creamy pasta with bacon",
        "price": 15.99,
        "category_name": "Main Course",
        "image": "/api/media/pasta.jpg"
      }
    ],
    "categories": [
      {
        "id": 1,
        "name": "Main Course",
        "priority": 1
      }
    ]
  }
}
```

#### cURL Example

```bash
curl -X GET http://127.0.0.1:8000/api/v1/menu \
  -H "Accept: application/json"
```

## Table Endpoints

### GET /api/v1/table-info

**Description**: Get table information  
**File**: `app/admin/routes.php:L650-700`  
**Middleware**: `web`  
**Authentication**: None (public endpoint)

#### Request

**Query Parameters**:
- `table_id` (required): Table ID to check

#### Response

**Success (200)**:
```json
{
  "success": true,
  "data": {
    "table_id": "7",
    "table_name": "Table 7",
    "location_id": 1,
    "status": "available"
  }
}
```

#### cURL Example

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/table-info?table_id=7" \
  -H "Accept: application/json"
```

## Waiter Request Endpoint

### POST /api/v1/waiter-call

**Description**: Request waiter service  
**File**: `app/admin/routes.php:L750-762`  
**Middleware**: `web`  
**Authentication**: None (public endpoint)

#### Request

**Body**:
```json
{
  "table_id": "7",
  "message": "Need more water please"
}
```

**Validation Rules**:
```php
$request->validate([
    'table_id' => 'required|string',
    'message' => 'required|string|max:500'
]);
```

#### Response

**Success (200)**:
```json
{
  "success": true,
  "message": "Waiter called successfully",
  "call_id": "abc123def456"
}
```

#### cURL Example

```bash
curl -X POST http://127.0.0.1:8000/api/v1/waiter-call \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "table_id": "7",
    "message": "Need more water please"
  }'
```

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

### HTTP Status Codes

- **200**: Success
- **201**: Created (order created)
- **400**: Bad Request (validation error)
- **404**: Not Found (order/table not found)
- **500**: Internal Server Error (server error)

## Security Considerations

### ❌ No Authentication
All endpoints are public and require no authentication.

### ❌ No Rate Limiting
Endpoints are not rate limited and vulnerable to abuse.

### ❌ No CSRF Protection
API endpoints lack CSRF protection.

### ❌ No Input Sanitization
Limited input validation and sanitization.

## Performance Considerations

### ❌ No Caching
Menu data is fetched from database on every request.

### ❌ No Pagination
Order listing endpoints don't support pagination.

### ❌ No Compression
API responses are not compressed.

## Critical Issues

### ❌ Missing Method
**Issue**: `$order->addOrderItem($item)` called but method doesn't exist  
**File**: `app/admin/controllers/Api/OrderController.php:L86`  
**Impact**: Order creation will fail with fatal error  
**Fix**: Implement method or use existing `addOrderMenus()`

### ❌ No Database Transactions
**Issue**: Order creation not wrapped in transactions  
**File**: `app/admin/routes.php:L248-405`  
**Impact**: Partial order creation possible on failure  
**Fix**: Wrap in `DB::transaction()`

### ❌ No Error Handling
**Issue**: Limited error handling in order creation  
**Impact**: Poor user experience on failures  
**Fix**: Add comprehensive error handling and rollback

## Recommendations

1. **Fix Critical Bug**: Implement missing `addOrderItem()` method
2. **Add Authentication**: Implement API authentication
3. **Add Rate Limiting**: Prevent abuse of endpoints
4. **Add Transactions**: Wrap order creation in database transactions
5. **Add Caching**: Cache menu data for better performance
6. **Add Validation**: Comprehensive input validation
7. **Add Logging**: Log all API requests for audit trail
8. **Add Compression**: Compress API responses
9. **Add Pagination**: Support pagination for list endpoints
10. **Add Documentation**: Generate OpenAPI/Swagger documentation