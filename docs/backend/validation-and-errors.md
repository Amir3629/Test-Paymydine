# Validation and Error Handling

**Request validation layers, error shapes, and error handling patterns** in the PayMyDine backend.

## 📋 Validation Layers

### 1. Form Validation (Admin Panel)
**Location**: `app/admin/controllers/Payments.php:152-177` ↩︎ [app/admin/controllers/Payments.php:152-177]

**Validation Rules**:
```php
$rules = [
    'payment'     => ['sometimes', 'required', 'alpha_dash'],
    'name'        => ['required', 'min:2', 'max:128'],
    'code'        => ['sometimes', 'required', 'alpha_dash', 'unique:payments,code'],
    'priority'    => ['required', 'integer'],
    'description' => ['max:255'],
    'is_default'  => ['required', 'integer'],
    'status'      => ['required', 'integer'],
];
```
↩︎ [app/admin/controllers/Payments.php:154-162]

**Validation Messages**:
```php
$messages = [];
$attributes = [
    'payment'     => lang('admin::lang.payments.label_payments'),
    'name'        => lang('admin::lang.label_name'),
    'code'        => lang('admin::lang.payments.label_code'),
    'priority'    => lang('admin::lang.payments.label_priority'),
    'description' => lang('admin::lang.label_description'),
    'is_default'  => lang('admin::lang.payments.label_default'),
    'status'      => lang('lang:admin::lang.label_status'),
];
```
↩︎ [app/admin/controllers/Payments.php:164-173]

### 2. API Request Validation
**Location**: `routes/api.php:184-187` ↩︎ [routes/api.php:184-187]

**Validation Rules**:
```php
$request->validate([
    'table_id' => 'required|string',
    'message' => 'required|string|max:500'
]);
```
↩︎ [routes/api.php:184-187]

**Usage**: Waiter call endpoint validation ↩︎ [routes/api.php:184-187]

### 3. Order Creation Validation
**Location**: `app/admin/routes.php:248-405` ↩︎ [app/admin/routes.php:248-405]

**Validation Rules**:
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
↩︎ [app/admin/routes.php:248-405]

## 🚨 Error Handling Patterns

### 1. API Error Responses
**Location**: `routes/api.php:200-205` ↩︎ [routes/api.php:200-205]

**Error Format**:
```php
return response()->json([
    'error' => 'Endpoint not found',
    'message' => 'The requested API endpoint does not exist.'
], 404);
```
↩︎ [routes/api.php:200-205]

### 2. Tenant Error Handling
**Location**: `app/Http/Middleware/TenantDatabaseMiddleware.php:35-41` ↩︎ [app/Http/Middleware/TenantDatabaseMiddleware.php:35-41]

**Error Responses**:
```php
// Tenant not found or inactive
return response()->json(['error' => 'Restaurant not found or inactive'], 404);

// No tenant detected from domain
return response()->json(['error' => 'Invalid domain'], 400);
```
↩︎ [app/Http/Middleware/TenantDatabaseMiddleware.php:35-41]

### 3. Order Creation Error Handling
**Location**: `app/admin/routes.php:248-405` ↩︎ [app/admin/routes.php:248-405]

**Error Handling**:
```php
try {
    // Order creation logic
    DB::beginTransaction();
    // ... order creation
    DB::commit();
    
    return response()->json([
        'success' => true,
        'order_id' => $orderId,
        'message' => 'Order placed successfully'
    ]);
} catch (\Exception $e) {
    DB::rollBack();
    
    return response()->json([
        'success' => false,
        'error' => 'Failed to create order',
        'message' => $e->getMessage()
    ], 500);
}
```
↩︎ [app/admin/routes.php:248-405]

## 🔍 Validation Issues

### Critical Issues
1. **Inconsistent Validation**: Different validation rules across endpoints ↩︎ [routes/api.php:1-207]
2. **Missing Validation**: Many API endpoints lack validation ↩︎ [routes/api.php:1-207]
3. **No Input Sanitization**: Limited sanitization of user input
4. **No CSRF Protection**: **Unknown** - CSRF implementation not found

### Performance Issues
1. **No Validation Caching**: Validation rules not cached
2. **Complex Validation**: Some validation rules are overly complex
3. **No Early Validation**: Validation happens after processing

## 📊 Error Response Formats

### Success Response
```json
{
    "success": true,
    "data": {
        "order_id": 123,
        "status": "pending"
    },
    "message": "Order created successfully"
}
```

### Error Response
```json
{
    "success": false,
    "error": "Validation failed",
    "message": "The customer name field is required",
    "errors": {
        "customer_name": ["The customer name field is required"]
    }
}
```

### API Error Response
```json
{
    "error": "Endpoint not found",
    "message": "The requested API endpoint does not exist."
}
```

## 🛠️ Validation Improvements

### Recommended Validation Rules
```php
// Comprehensive order validation
$rules = [
    'customer_name' => 'required|string|max:255|min:2',
    'customer_email' => 'nullable|email|max:255',
    'customer_phone' => 'nullable|string|max:20',
    'items' => 'required|array|min:1|max:50',
    'items.*.menu_id' => 'required|integer|exists:menus,menu_id',
    'items.*.name' => 'required|string|max:255',
    'items.*.quantity' => 'required|integer|min:1|max:100',
    'items.*.price' => 'required|numeric|min:0|max:9999.99',
    'total_amount' => 'required|numeric|min:0|max:99999.99',
    'payment_method' => 'required|in:cash,card,paypal,apple_pay,google_pay',
    'special_instructions' => 'nullable|string|max:500',
    'table_id' => 'required|string|max:50',
    'table_name' => 'required|string|max:100'
];
```

### Custom Validation Rules
```php
// Custom validation for order totals
Validator::extend('order_total_matches', function ($attribute, $value, $parameters, $validator) {
    $items = $validator->getData()['items'] ?? [];
    $calculatedTotal = array_sum(array_map(function($item) {
        return $item['price'] * $item['quantity'];
    }, $items));
    
    return abs($value - $calculatedTotal) < 0.01;
});
```

## 🔒 Security Validation

### Input Sanitization
```php
// Sanitize user input
$sanitizedData = [
    'customer_name' => strip_tags($request->customer_name),
    'customer_email' => filter_var($request->customer_email, FILTER_SANITIZE_EMAIL),
    'special_instructions' => strip_tags($request->special_instructions),
];
```

### SQL Injection Prevention
```php
// Use parameterized queries
$orders = DB::table('orders')
    ->where('customer_id', $customerId)
    ->where('status_id', $statusId)
    ->get();
```

### XSS Prevention
```php
// Escape output
echo htmlspecialchars($order->customer_name, ENT_QUOTES, 'UTF-8');
```

## 📈 Error Monitoring

### Error Logging
```php
// Log validation errors
Log::warning('Validation failed', [
    'endpoint' => $request->path(),
    'errors' => $validator->errors(),
    'input' => $request->all()
]);
```

### Error Metrics
- **Validation failure rate**: Track validation errors by endpoint
- **Error response time**: Monitor error handling performance
- **Common validation errors**: Identify frequent validation issues

## 🧪 Testing Validation

### Unit Tests
```php
public function testOrderValidation()
{
    $response = $this->postJson('/api/v1/orders', [
        'customer_name' => '',
        'items' => []
    ]);
    
    $response->assertStatus(422)
        ->assertJsonValidationErrors(['customer_name', 'items']);
}
```

### Integration Tests
```php
public function testOrderCreationWithValidData()
{
    $orderData = [
        'customer_name' => 'John Doe',
        'items' => [
            [
                'menu_id' => 1,
                'name' => 'Pizza',
                'quantity' => 2,
                'price' => 15.99
            ]
        ],
        'total_amount' => 31.98,
        'payment_method' => 'card'
    ];
    
    $response = $this->postJson('/api/v1/orders', $orderData);
    
    $response->assertStatus(200)
        ->assertJson(['success' => true]);
}
```

## 📚 Related Documentation

- **Routes**: [routes.md](routes.md) - Route definitions and validation
- **Services**: [services-and-helpers.md](services-and-helpers.md) - Service validation patterns
- **Security**: [security.md](security.md) - Security validation requirements
- **API**: [../api/README.md](../api/README.md) - API validation specifications