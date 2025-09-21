# Backend Documentation

**Backend architecture, routes, services, and security** for the PayMyDine Laravel/TastyIgniter application.

## 📋 Overview

PayMyDine backend is built on **TastyIgniter v3** (Laravel 8.x) with custom multi-tenant middleware:
- **Framework**: TastyIgniter v3 based on Laravel 8.x ↩︎ [composer.json:1-68]
- **Modules**: `admin`, `main`, `system` ↩︎ [app/admin/, app/main/, app/system/]
- **Multi-tenant**: Database-per-tenant isolation ↩︎ [app/Http/Middleware/TenantDatabaseMiddleware.php:1-48]
- **API**: RESTful endpoints for frontend communication

## 🏗️ Architecture Components

### Core Modules
- **Admin Module**: Restaurant management interface ↩︎ [app/admin/]
- **Main Module**: Customer-facing functionality ↩︎ [app/main/]
- **System Module**: Core framework components ↩︎ [app/system/]

### Key Services
- **PaymentGateways**: Payment processing management ↩︎ [app/admin/classes/PaymentGateways.php:1-50]
- **BasePaymentGateway**: Payment gateway base class ↩︎ [app/admin/classes/BasePaymentGateway.php:1-50]
- **TenantDatabaseMiddleware**: Multi-tenant database switching ↩︎ [app/Http/Middleware/TenantDatabaseMiddleware.php:1-48]

## 📁 Document Structure

| Document | Description |
|----------|-------------|
| [routes.md](routes.md) | All routes with middleware and authentication |
| [services-and-helpers.md](services-and-helpers.md) | Important services and helpers |
| [validation-and-errors.md](validation-and-errors.md) | Request validation and error handling |
| [security.md](security.md) | Authentication, CSRF, rate limiting |

## 🔗 Related Documentation

- **API**: [../api/README.md](../api/README.md) - API endpoints and specifications
- **Database**: [../database/README.md](../database/README.md) - Database design and relationships
- **Tenancy**: [../tenancy/README.md](../tenancy/README.md) - Multi-tenant architecture