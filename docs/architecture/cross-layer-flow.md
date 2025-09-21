# Cross-Layer Flow Diagrams

**Sequence diagrams showing data flow across Frontend → API → Database layers** for key system operations.

## 🍽️ Order Placement Flow

### Complete Order Lifecycle
```mermaid
sequenceDiagram
    participant C as Customer
    participant F as Frontend
    participant A as API
    participant M as Middleware
    participant D as Database
    participant P as Payment
    
    Note over C,P: Order Placement Flow
    
    C->>F: Scan QR Code
    F->>A: GET /api/v1/menu
    A->>M: Tenant Detection
    M->>D: Query ti_tenants
    D-->>M: Tenant info
    M->>D: Switch to tenant DB
    D-->>M: Connection established
    M-->>A: Tenant context
    A->>D: Query menu items
    D-->>A: Menu data
    A-->>F: JSON response
    F-->>C: Display menu
    
    C->>F: Add items to cart
    F->>F: Update cart state
    
    C->>F: Proceed to checkout
    F->>F: Calculate totals
    
    C->>F: Enter payment details
    F->>P: Process payment
    P-->>F: Payment result
    
    F->>A: POST /api/v1/orders
    A->>M: Tenant Detection
    M->>D: Switch to tenant DB
    A->>D: Create order record
    D-->>A: Order ID
    A->>D: Create order items
    D-->>A: Success
    A-->>F: Order confirmation
    F-->>C: Order placed
```

## 💳 Payment Processing Flow

### Stripe Payment Integration
```mermaid
sequenceDiagram
    participant C as Customer
    participant F as Frontend
    participant A as API
    participant S as Stripe
    participant D as Database
    
    Note over C,D: Stripe Payment Flow
    
    C->>F: Enter card details
    F->>A: POST /api/payments/create-intent
    A->>S: Create PaymentIntent
    S-->>A: client_secret
    A-->>F: Payment intent created
    
    F->>S: Confirm payment
    S->>S: Process payment
    S-->>F: Payment result
    
    alt Payment Success
        F->>A: POST /api/v1/orders
        A->>D: Create order with payment
        D-->>A: Order created
        A-->>F: Success response
        F-->>C: Order confirmed
    else Payment Failed
        F-->>C: Payment error
    end
```

## 🔧 Admin Order Management Flow

### Order Status Updates
```mermaid
sequenceDiagram
    participant A as Admin
    participant P as Admin Panel
    participant B as Backend
    participant D as Database
    participant F as Frontend
    
    Note over A,F: Admin Order Management
    
    A->>P: View orders
    P->>B: GET /admin/orders
    B->>D: Query orders
    D-->>B: Order list
    B-->>P: Orders with status
    P-->>A: Display orders
    
    A->>P: Update order status
    P->>B: PATCH /admin/orders/{id}
    B->>D: Update order status
    D-->>B: Status updated
    B->>D: Log status history
    D-->>B: History logged
    B-->>P: Order updated
    P-->>A: Status changed
    
    Note over F: Real-time updates (if implemented)
    B->>F: WebSocket/SSE update
    F->>F: Update order status
```

## 🏢 Multi-Tenant Database Switching

### Tenant Detection and Database Switch
```mermaid
sequenceDiagram
    participant R as Request
    participant M as Middleware
    participant D as Main DB
    participant T as Tenant DB
    participant C as Controller
    
    Note over R,C: Multi-Tenant Database Switching
    
    R->>M: HTTP Request (subdomain)
    M->>M: Extract subdomain
    M->>D: Query ti_tenants table
    D-->>M: Tenant configuration
    
    alt Tenant Found
        M->>M: Switch DB connection
        M->>T: Connect to tenant DB
        T-->>M: Connection established
        M->>C: Process with tenant context
        C->>T: Query tenant data
        T-->>C: Tenant data
        C-->>M: Response
        M-->>R: HTTP Response
    else Tenant Not Found
        M-->>R: 404 Error
    end
```

## 📱 QR Code Menu Access Flow

### Table-Specific Menu Loading
```mermaid
sequenceDiagram
    participant C as Customer
    participant F as Frontend
    participant A as API
    participant D as Database
    
    Note over C,D: QR Code Menu Access
    
    C->>F: Scan QR code
    F->>F: Parse QR data
    F->>A: GET /api/v1/table-menu?table_id=X
    A->>D: Query table info
    D-->>A: Table details
    A->>D: Query menu items
    D-->>A: Menu data
    A-->>F: Menu with table context
    F->>F: Set table context
    F-->>C: Display table-specific menu
    
    Note over C: Customer can now place orders for this table
```

## 🔄 Real-Time Updates Flow

### Order Status Notifications
```mermaid
sequenceDiagram
    participant A as Admin
    participant B as Backend
    participant D as Database
    participant F as Frontend
    participant C as Customer
    
    Note over A,C: Real-Time Order Updates
    
    A->>B: Update order status
    B->>D: Update order
    D-->>B: Status updated
    B->>D: Log status change
    D-->>B: Change logged
    
    par Admin Panel Update
        B-->>A: Status updated
    and Frontend Update
        B->>F: WebSocket/SSE
        F->>F: Update order status
        F-->>C: Show status change
    end
```

## 🚨 Error Handling Flow

### Payment Failure Recovery
```mermaid
sequenceDiagram
    participant C as Customer
    participant F as Frontend
    participant A as API
    participant P as Payment Gateway
    participant D as Database
    
    Note over C,D: Payment Error Handling
    
    C->>F: Submit payment
    F->>A: Process payment
    A->>P: Charge card
    P-->>A: Payment failed
    
    alt Retryable Error
        A-->>F: Payment error (retryable)
        F-->>C: Show retry option
        C->>F: Retry payment
        F->>A: Process payment
        A->>P: Charge card
        P-->>A: Payment success
        A->>D: Create order
        D-->>A: Order created
        A-->>F: Success
        F-->>C: Order confirmed
    else Fatal Error
        A-->>F: Payment error (fatal)
        F-->>C: Show error message
        C->>F: Choose different payment
    end
```

## 🔍 Database Transaction Flow

### Order Creation with Items
```mermaid
sequenceDiagram
    participant A as API
    participant D as Database
    participant T as Transaction
    
    Note over A,T: Database Transaction Flow
    
    A->>T: Begin transaction
    T->>D: START TRANSACTION
    
    A->>D: INSERT order
    D-->>A: Order ID
    
    loop For each item
        A->>D: INSERT order_item
        D-->>A: Item created
    end
    
    A->>D: INSERT order_totals
    D-->>A: Totals created
    
    A->>T: Commit transaction
    T->>D: COMMIT
    D-->>T: Transaction committed
    T-->>A: Success
    
    Note over A: Order creation completed atomically
```

## 📊 Performance Monitoring Flow

### Request Performance Tracking
```mermaid
sequenceDiagram
    participant R as Request
    participant M as Middleware
    participant C as Controller
    participant L as Logger
    participant D as Database
    
    Note over R,D: Performance Monitoring
    
    R->>M: HTTP Request
    M->>M: Start timer
    M->>C: Process request
    C->>D: Query database
    D-->>C: Query result
    C-->>M: Response
    M->>M: Calculate duration
    M->>L: Log performance metrics
    L->>D: Store metrics
    M-->>R: HTTP Response
    
    Note over L: Metrics available for monitoring
```

## 🔗 Related Documentation

- **Architecture Overview**: [overview.md](overview.md) - High-level system architecture
- **Tenancy**: [../tenancy/README.md](../tenancy/README.md) - Multi-tenant implementation details
- **API**: [../api/README.md](../api/README.md) - API endpoint specifications
- **Database**: [../database/README.md](../database/README.md) - Database design and relationships