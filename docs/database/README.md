# Database Documentation

**Database architecture, schema design, and data relationships** for the PayMyDine multi-tenant restaurant ordering system.

## 📋 Overview

PayMyDine uses **MySQL 8.0** with **database-per-tenant** multi-tenancy:
- **Main Database**: Shared tenant registry and system data
- **Tenant Databases**: Isolated data per restaurant
- **Schema**: TastyIgniter-based restaurant management schema
- **Isolation**: Complete data separation between tenants

## 🗄️ Database Architecture

### Multi-Tenant Structure
```
Main Database (paymydine)
├── ti_tenants (tenant registry)
├── ti_users (system users)
└── ti_settings (global settings)

Tenant Database (restaurant-specific)
├── ti_orders (restaurant orders)
├── ti_menus (restaurant menu)
├── ti_tables (restaurant tables)
├── ti_customers (restaurant customers)
└── ti_locations (restaurant locations)
```

### Database Engine
- **MySQL 8.0** with InnoDB engine ↩︎ [db/paymydine.sql:1-50]
- **UTF8MB4** character set for full Unicode support
- **InnoDB** for ACID compliance and foreign key support

## 📁 Document Structure

| Document | Description |
|----------|-------------|
| [erd.md](erd.md) | Entity relationship diagram |
| [schema-review.md](schema-review.md) | Schema analysis and missing constraints |
| [migrations.md](migrations.md) | Migration sources and data flow |

## 🔗 Related Documentation

- **Tenancy**: [../tenancy/README.md](../tenancy/README.md) - Multi-tenant database switching
- **API**: [../api/README.md](../api/README.md) - API endpoints and database queries
- **Backend**: [../backend/README.md](../backend/README.md) - Backend data access patterns