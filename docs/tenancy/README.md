# Multi-Tenant Architecture

**Multi-tenant architecture implementation** using database-per-tenant isolation with subdomain-based tenant detection.

## 📋 Overview

PayMyDine implements **database-per-tenant** multi-tenancy where each restaurant (tenant) has:
- **Isolated database**: Separate MySQL database per tenant
- **Subdomain routing**: `restaurant.paymydine.com` format
- **Dynamic switching**: Runtime database connection changes
- **Shared tenant registry**: `ti_tenants` table for tenant management

## 🏗️ Architecture Components

### Tenant Detection
- **Subdomain extraction**: From HTTP host header ↩︎ [app/Http/Middleware/TenantDatabaseMiddleware.php:14-48]
- **Database lookup**: Query `ti_tenants` table for tenant info ↩︎ [app/Http/Middleware/TenantDatabaseMiddleware.php:19-22]
- **Connection switching**: Dynamic database connection changes ↩︎ [app/Http/Middleware/TenantDatabaseMiddleware.php:25-30]

### Database Isolation
- **Per-tenant databases**: Each restaurant has isolated data
- **Shared tenant table**: `ti_tenants` for tenant management ↩︎ [db/paymydine.sql:2494-2530]
- **Middleware enforcement**: All requests go through tenant detection

## 📁 Document Structure

| Document | Description |
|----------|-------------|
| [detection-and-routing.md](detection-and-routing.md) | How tenant detection works (subdomain/path) |
| [db-switching.md](db-switching.md) | Database connection switching mechanism |
| [isolation-risks.md](isolation-risks.md) | Security risks and isolation validation |

## 🔗 Related Documentation

- **Architecture**: [../architecture/README.md](../architecture/README.md) - Overall system architecture
- **Database**: [../database/README.md](../database/README.md) - Database design and relationships
- **API**: [../api/README.md](../api/README.md) - API endpoints and tenant context