# Admin Panel Documentation

**Admin panel architecture, navigation, and payment system management** for the PayMyDine restaurant management system.

## 📋 Overview

PayMyDine admin panel is built on **TastyIgniter v3** framework with:
- **Framework**: TastyIgniter v3 (Laravel 8.x) ↩︎ [composer.json:1-68]
- **Modules**: `admin`, `main`, `system` ↩︎ [app/admin/, app/main/, app/system/]
- **Authentication**: Session-based authentication ↩︎ [app/admin/controllers/SuperAdminController.php:1-50]
- **Multi-tenant**: Database-per-tenant isolation ↩︎ [app/Http/Middleware/TenantDatabaseMiddleware.php:1-48]

## 🏗️ Admin Architecture

### Core Components
- **Controllers**: Admin panel controllers ↩︎ [app/admin/controllers/]
- **Models**: Data models and business logic ↩︎ [app/admin/models/]
- **Views**: Admin panel templates ↩︎ [app/admin/views/]
- **Form Widgets**: Reusable UI components ↩︎ [app/admin/formwidgets/]

### Key Features
- **Payment Management**: Payment gateway configuration ↩︎ [app/admin/controllers/Payments.php:1-177]
- **Order Management**: Order processing and status updates
- **Table Management**: Table configuration and QR codes
- **Menu Management**: Menu items and categories
- **Multi-tenant Support**: Tenant-specific data isolation

## 📁 Document Structure

| Document | Description |
|----------|-------------|
| [navigation-and-modules.md](navigation-and-modules.md) | Menu structure and module boundaries |
| [payments/README.md](payments/README.md) | Payment system overview |
| [payments/settings.md](payments/settings.md) | Payment configuration UI |
| [payments/providers-stripe.md](payments/providers-stripe.md) | Stripe integration details |
| [payments/webhooks.md](payments/webhooks.md) | Webhook handling |
| [payments/refunds-and-reconciliation.md](payments/refunds-and-reconciliation.md) | Refund processing |
| [payments/permissions-and-roles.md](payments/permissions-and-roles.md) | Payment permissions |
| [payments/troubleshooting.md](payments/troubleshooting.md) | Common issues and diagnostics |
| [orders-and-cashier.md](orders-and-cashier.md) | Order management and cashier flow |

## 🔗 Related Documentation

- **Backend**: [../backend/README.md](../backend/README.md) - Backend API implementation
- **Database**: [../database/README.md](../database/README.md) - Database design
- **Tenancy**: [../tenancy/README.md](../tenancy/README.md) - Multi-tenant architecture