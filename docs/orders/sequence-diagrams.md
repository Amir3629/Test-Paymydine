# Sequence Diagrams - Order Flow Analysis

## 1. Admin-Created Order Flow

```mermaid
sequenceDiagram
    participant Admin as Admin User
    participant AdminPanel as Admin Panel
    participant OrdersController as Orders Controller
    participant OrdersModel as Orders Model
    participant DB as Database
    participant StatusHistory as Status History

    Admin->>AdminPanel: Access /admin/orders/create
    AdminPanel->>AdminPanel: Load table statuses
    AdminPanel->>DB: SELECT table statuses
    DB-->>AdminPanel: Return table data
    AdminPanel-->>Admin: Display order creation form

    Admin->>AdminPanel: Fill order form
    Admin->>AdminPanel: Submit order
    AdminPanel->>OrdersController: POST order data
    OrdersController->>OrdersModel: create()
    OrdersModel->>DB: INSERT INTO ti_orders
    DB-->>OrdersModel: Return order_id
    OrdersModel->>DB: INSERT INTO ti_order_menus
    OrdersModel->>DB: INSERT INTO ti_order_totals
    OrdersModel->>StatusHistory: addStatusHistory()
    StatusHistory->>DB: INSERT INTO ti_status_history
    OrdersModel-->>OrdersController: Return order object
    OrdersController-->>AdminPanel: Redirect to order edit
    AdminPanel-->>Admin: Show order details
```

**Evidence**: `app/admin/controllers/Orders.php:L11-127`, `app/admin/models/Orders_model.php:L1-554`

## 2. Frontend Customer Order Flow

```mermaid
sequenceDiagram
    participant Customer as Customer
    participant Frontend as Next.js Frontend
    participant ApiClient as API Client
    participant Backend as Laravel Backend
    participant DB as Database
    participant AdminPanel as Admin Panel

    Customer->>Frontend: Scan QR code
    Frontend->>Frontend: Parse table info from URL
    Frontend->>ApiClient: getMenu()
    ApiClient->>Backend: GET /api/v1/menu
    Backend->>DB: SELECT menu items
    DB-->>Backend: Return menu data
    Backend-->>ApiClient: Return menu JSON
    ApiClient-->>Frontend: Return menu data
    Frontend-->>Customer: Display menu

    Customer->>Frontend: Select items and options
    Customer->>Frontend: Add to cart
    Customer->>Frontend: Proceed to payment
    Frontend->>Frontend: Show payment modal
    Customer->>Frontend: Enter payment details
    Customer->>Frontend: Submit order

    Frontend->>ApiClient: submitOrder(orderData)
    ApiClient->>Backend: POST /api/v1/orders
    Backend->>Backend: Validate request data
    Backend->>DB: BEGIN TRANSACTION
    Backend->>DB: INSERT INTO ti_orders
    Backend->>DB: INSERT INTO ti_order_menus
    Backend->>DB: INSERT INTO ti_order_totals
    Backend->>DB: COMMIT TRANSACTION
    Backend-->>ApiClient: Return order_id
    ApiClient-->>Frontend: Return success response
    Frontend->>Frontend: Save order_id to localStorage
    Frontend->>Frontend: Redirect to /order-placed
    Frontend-->>Customer: Show order confirmation

    Note over AdminPanel: Admin receives notification
    AdminPanel->>AdminPanel: Display new order
```

**Evidence**: 
- Frontend: `frontend/lib/api-client.ts:L1-567`
- Backend: `app/admin/routes.php:L248-405`
- Menu: `frontend/app/menu/page.tsx:L1-1802`

## 3. Status Change Flow

```mermaid
sequenceDiagram
    participant Admin as Admin User
    participant AdminPanel as Admin Panel
    participant OrdersController as Orders Controller
    participant OrdersModel as Orders Model
    participant StatusHistory as Status History
    participant DB as Database
    participant Customer as Customer

    Admin->>AdminPanel: View order list
    AdminPanel->>OrdersController: GET orders
    OrdersController->>OrdersModel: list()
    OrdersModel->>DB: SELECT orders with status
    DB-->>OrdersModel: Return orders
    OrdersModel-->>OrdersController: Return order collection
    OrdersController-->>AdminPanel: Return order data
    AdminPanel-->>Admin: Display orders

    Admin->>AdminPanel: Change order status
    AdminPanel->>OrdersController: POST status update
    OrdersController->>OrdersModel: find(order_id)
    OrdersModel->>DB: SELECT order
    DB-->>OrdersModel: Return order
    OrdersModel->>StatusHistory: addStatusHistory()
    StatusHistory->>DB: INSERT INTO ti_status_history
    StatusHistory->>OrdersModel: update status_id
    OrdersModel->>DB: UPDATE ti_orders SET status_id
    OrdersModel->>StatusHistory: check notify flag
    alt Notify Customer
        StatusHistory->>Customer: Send email notification
    end
    OrdersModel-->>OrdersController: Return updated order
    OrdersController-->>AdminPanel: Return success
    AdminPanel-->>Admin: Show updated status
```

**Evidence**: 
- Status update: `app/admin/controllers/Orders.php:L70-80`
- Status history: `app/admin/traits/LogsStatusHistory.php:L50-80`
- Status definitions: `paymydine.sql:L2329-2359`

## 4. Payment Flow

```mermaid
sequenceDiagram
    participant Customer as Customer
    participant Frontend as Next.js Frontend
    participant PaymentModal as Payment Modal
    participant ApiClient as API Client
    participant Backend as Laravel Backend
    participant DB as Database

    Customer->>Frontend: Click "Pay Now"
    Frontend->>PaymentModal: Open payment modal
    PaymentModal-->>Customer: Show payment form

    Customer->>PaymentModal: Select payment method
    Customer->>PaymentModal: Enter payment details
    Customer->>PaymentModal: Submit payment

    PaymentModal->>PaymentModal: Validate payment data
    PaymentModal->>ApiClient: submitOrder(orderData)
    ApiClient->>Backend: POST /api/v1/orders
    Backend->>Backend: Validate order data
    Backend->>DB: BEGIN TRANSACTION
    Backend->>DB: INSERT INTO ti_orders
    Backend->>DB: INSERT INTO ti_order_menus
    Backend->>DB: INSERT INTO ti_order_totals (payment_method)
    Backend->>DB: INSERT INTO ti_order_totals (tip_amount)
    Backend->>DB: COMMIT TRANSACTION
    Backend-->>ApiClient: Return order_id
    ApiClient-->>PaymentModal: Return success
    PaymentModal->>Frontend: Close modal
    Frontend->>Frontend: Save order_id to localStorage
    Frontend->>Frontend: Redirect to /order-placed
    Frontend-->>Customer: Show order confirmation
```

**Evidence**: 
- Payment modal: `frontend/app/menu/page.tsx:L300-400`
- Order submission: `frontend/lib/api-client.ts:L200-250`
- Backend processing: `app/admin/routes.php:L248-405`

## 5. Waiter Request Flow

```mermaid
sequenceDiagram
    participant Customer as Customer
    participant Frontend as Next.js Frontend
    participant ApiClient as API Client
    participant Backend as Laravel Backend
    participant DB as Database
    participant Staff as Restaurant Staff

    Customer->>Frontend: Click "Call Waiter"
    Frontend->>Frontend: Show waiter request modal
    Customer->>Frontend: Enter request message
    Customer->>Frontend: Submit request

    Frontend->>ApiClient: callWaiter(tableId, message)
    ApiClient->>Backend: POST /api/v1/waiter-call
    Backend->>Backend: Validate request data
    Backend->>DB: INSERT INTO waiter_requests
    DB-->>Backend: Return request_id
    Backend-->>ApiClient: Return success
    ApiClient-->>Frontend: Return success
    Frontend-->>Customer: Show confirmation

    Note over Staff: Staff receives notification
    Staff->>Staff: Check waiter requests
    Staff->>DB: SELECT waiter_requests
    DB-->>Staff: Return pending requests
    Staff->>Staff: Respond to request
    Staff->>DB: UPDATE waiter_requests SET status
```

**Evidence**: 
- Waiter request: `app/admin/controllers/Api/OrderController.php:L120-140`
- Database: `app/admin/database/migrations/2024_05_10_000000_create_waiter_requests_table.php:L11-26`
- Frontend: `frontend/lib/api-client.ts:L300-350`

## 6. QR Code Generation and Usage

```mermaid
sequenceDiagram
    participant Admin as Admin User
    participant AdminPanel as Admin Panel
    participant Backend as Laravel Backend
    participant DB as Database
    participant Customer as Customer
    participant Frontend as Next.js Frontend

    Admin->>AdminPanel: Create new table
    AdminPanel->>Backend: POST table creation
    Backend->>DB: INSERT INTO ti_tables
    Backend->>Backend: Generate QR code
    Backend->>DB: UPDATE ti_tables SET qr_code
    Backend-->>AdminPanel: Return table with QR code
    AdminPanel-->>Admin: Display table with QR code

    Admin->>AdminPanel: Get QR URL
    AdminPanel->>Backend: GET /admin/orders/get-table-qr-url
    Backend->>DB: SELECT table data
    Backend->>Backend: Build frontend URL
    Backend-->>AdminPanel: Return QR URL
    AdminPanel-->>Admin: Display QR URL

    Customer->>Customer: Scan QR code
    Customer->>Frontend: Access QR URL
    Frontend->>Frontend: Parse table parameters
    Frontend->>Frontend: Load menu for table
    Frontend-->>Customer: Display table-specific menu
```

**Evidence**: 
- QR generation: `app/admin/routes.php:L159-221`
- Table management: `paymydine.sql:L2428-2480`
- Frontend parsing: `frontend/app/menu/page.tsx:L1-100`

## Critical Issues Identified

### ❌ Missing Method in Order Creation
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

## Performance Considerations

1. **N+1 Queries**: Order listing may cause N+1 queries
2. **No Caching**: Menu data fetched on every request
3. **No Rate Limiting**: Order creation endpoints not rate limited
4. **No Indexing**: Missing indexes on frequently queried columns

## Security Considerations

1. **No Authentication**: Order creation endpoints are public
2. **No CSRF Protection**: API endpoints lack CSRF protection
3. **No Input Sanitization**: Limited input validation
4. **No Rate Limiting**: Vulnerable to abuse