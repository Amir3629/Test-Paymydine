# Architecture Documentation

This section covers the high-level system architecture, component interactions, and multi-tenant design patterns used in PayMyDine.

## 📋 Overview

PayMyDine is a **multi-tenant restaurant ordering system** built on:
- **Backend**: TastyIgniter v3 (Laravel 8.x) with custom multi-tenant middleware
- **Frontend**: Next.js 15.2.4 with TypeScript and Tailwind CSS
- **Database**: MySQL 8.0 with database-per-tenant isolation
- **Payments**: Stripe, PayPal, Apple Pay, Google Pay integration

## 🏗️ System Architecture

### High-Level Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Laravel)     │◄──►│   (MySQL)       │
│                 │    │                 │    │                 │
│ • QR Scanner    │    │ • API Routes    │    │ • Multi-tenant  │
│ • Order Flow    │    │ • Admin Panel   │    │ • Tenant DBs    │
│ • Payment UI    │    │ • Middleware    │    │ • Shared Tables │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Request Flow
1. **Customer** scans QR code → **Frontend** loads table-specific menu
2. **Frontend** submits order → **API** processes with tenant context
3. **Backend** switches to tenant database → **Order** created
4. **Admin Panel** manages orders → **Status** updates sent to frontend

## 📁 Document Structure

| Document | Description |
|----------|-------------|
| [overview.md](overview.md) | High-level architecture and request lifecycle |
| [cross-layer-flow.md](cross-layer-flow.md) | Sequence diagrams across Frontend → API → Database |

## 🔗 Related Documentation

- **Tenancy**: [../tenancy/README.md](../tenancy/README.md) - Multi-tenant architecture details
- **Database**: [../database/README.md](../database/README.md) - Database design and relationships
- **API**: [../api/README.md](../api/README.md) - API endpoints and specifications
- **Frontend**: [../frontend/README.md](../frontend/README.md) - Frontend architecture and components