# Current QR Code Flow Sequence Diagram

**Investigation Date**: January 2025  
**Purpose**: Sequence diagram showing the current QR creation and consumption flow

## Current QR Code Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Frontend
    participant M as Middleware
    participant T as Tenant DB
    participant E as External QR API
    participant G as Guest
    participant API as API Endpoint

    Note over A,G: Table Creation and QR Generation Flow
    
    A->>F: Create new table via admin UI
    F->>M: POST /admin/tables
    M->>M: Extract tenant from subdomain
    M->>T: Query ti_tenants table
    T-->>M: Tenant info + database name
    M->>M: Switch DB connection (DB::purge + DB::reconnect)
    M->>T: INSERT INTO ti_tables
    Note over T: Model boot() generates QR code<br/>Format: ms{sequential}{6chars}
    T-->>M: Table created with qr_code
    M-->>F: Table created successfully
    F->>E: Generate QR image via api.qrserver.com
    Note over E: URL: https://api.qrserver.com/v1/create-qr-code/<br/>Data: http://127.0.0.1:8001/table/28?location=1&guest=4&qr=ms28AeaKPP&table=28
    E-->>F: QR image data (base64)
    F-->>A: Display QR code image

    Note over A,G: QR Scan and Table Lookup Flow
    
    G->>F: Scan QR code
    Note over F: QR contains: /table/28?location=1&guest=4&qr=ms28AeaKPP&table=28
    F->>F: Parse QR parameters
    F->>API: GET /api/v1/table-info?table_id=28
    Note over API: Uses main/routes.php closure<br/>Only accepts table_id parameter
    API->>M: Process request
    M->>M: Extract tenant from subdomain
    M->>T: Query ti_tenants table
    T-->>M: Tenant info + database name
    M->>M: Switch DB connection
    M->>T: SELECT * FROM tables WHERE table_id=28
    Note over T: Queries tenant database<br/>No QR code lookup
    T-->>M: Table data from tenant DB
    M-->>API: Table info
    API-->>F: Table information JSON
    F-->>G: Display table info

    Note over A,G: Key Findings
    
    Note over A: QR Generation Issues:<br/>- Predictable format (ms{sequential}{6chars})<br/>- No uniqueness constraint<br/>- Sequential numbers guessable
    Note over F: URL Construction:<br/>- Multiple query parameters<br/>- No tenant ID in URL<br/>- Points to Next.js frontend
    Note over API: API Consumption:<br/>- Only accepts table_id parameter<br/>- Ignores qr parameter<br/>- No QR code validation
    Note over T: Database Issues:<br/>- No unique constraint on qr_code<br/>- No index on qr_code<br/>- No index on table_status
```

## Flow Analysis

### 1. Table Creation and QR Generation
- **Admin creates table** via admin UI
- **Tenant middleware** extracts subdomain and switches database
- **Model boot()** generates QR code using `ms{sequential}{6chars}` format
- **QR URL construction** includes multiple parameters but no tenant ID
- **External QR service** generates image via api.qrserver.com

### 2. QR Scan and Table Lookup
- **Guest scans QR** containing table information
- **Frontend parses** QR parameters
- **API call** made to `/api/v1/table-info` with `table_id` parameter
- **Tenant middleware** ensures database isolation
- **Database query** retrieves table information from tenant database

### 3. Key Issues Identified
- **QR Generation**: Predictable and vulnerable to guessing
- **API Consumption**: Only accepts `table_id`, ignores `qr` parameter
- **Database**: Missing constraints and indexes
- **URL Structure**: No tenant ID, relies on subdomain for isolation

## Security Concerns

1. **Predictable QR Codes**: Sequential numbers make QR codes guessable
2. **No Uniqueness**: Database lacks unique constraint on qr_code
3. **API Mismatch**: QR codes contain `qr` parameter but API only accepts `table_id`
4. **Missing Indexes**: No performance optimization for QR lookups
5. **External Dependency**: Relies on api.qrserver.com for QR images

## Multi-Tenant Isolation

- **Tenant Detection**: Properly implemented via subdomain extraction
- **Database Switching**: Correctly switches to tenant database
- **URL Structure**: No tenant ID in QR URLs, relies on subdomain
- **API Protection**: All routes protected with tenant middleware

This sequence diagram shows the complete current flow from table creation to QR consumption, highlighting the security issues and implementation details discovered during the investigation.