# PayMyDine Documentation

**Multi-tenant restaurant ordering and management system** built on TastyIgniter v3 (Laravel 8.x) with Next.js frontend.

## 📋 Quick Start

- **Setup**: See [ops/setup.md](ops/setup.md) for local development
- **Architecture**: Start with [architecture/overview.md](architecture/overview.md)
- **API Reference**: Check [api/openapi.yaml](api/openapi.yaml)
- **Payments**: Admin [admin/payments/README.md](admin/payments/README.md) | Frontend [frontend/payments/README.md](frontend/payments/README.md)

## 🏗️ Architecture & Tenancy

| Document | Description |
|----------|-------------|
| [architecture/overview.md](architecture/overview.md) | High-level system architecture and request lifecycle |
| [architecture/cross-layer-flow.md](architecture/cross-layer-flow.md) | Sequence diagrams across Frontend → API → Database |
| [tenancy/README.md](tenancy/README.md) | Multi-tenant architecture overview |
| [tenancy/detection-and-routing.md](tenancy/detection-and-routing.md) | How tenant detection works (subdomain/path) |
| [tenancy/db-switching.md](tenancy/db-switching.md) | Database connection switching per tenant |
| [tenancy/isolation-risks.md](tenancy/isolation-risks.md) | Security risks and isolation validation |

## 🗄️ Database

| Document | Description |
|----------|-------------|
| [database/README.md](database/README.md) | Database architecture overview |
| [database/erd.md](database/erd.md) | Entity relationship diagram |
| [database/schema-review.md](database/schema-review.md) | Schema analysis and missing constraints |
| [database/migrations.md](database/migrations.md) | Migration sources and data flow |

## 🔧 Backend & API

| Document | Description |
|----------|-------------|
| [backend/README.md](backend/README.md) | Backend architecture overview |
| [backend/routes.md](backend/routes.md) | All routes with middleware and auth |
| [backend/services-and-helpers.md](backend/services-and-helpers.md) | Important services and helpers |
| [backend/validation-and-errors.md](backend/validation-and-errors.md) | Request validation and error handling |
| [backend/security.md](backend/security.md) | Authentication, CSRF, rate limiting |
| [api/README.md](api/README.md) | Public API overview |
| [api/openapi.yaml](api/openapi.yaml) | Complete API specification |

## 💳 Admin Panel - Payments

| Document | Description |
|----------|-------------|
| [admin/README.md](admin/README.md) | Admin panel overview |
| [admin/navigation-and-modules.md](admin/navigation-and-modules.md) | Menu structure and module boundaries |
| [admin/payments/README.md](admin/payments/README.md) | Payment system overview |
| [admin/payments/settings.md](admin/payments/settings.md) | Payment configuration UI |
| [admin/payments/providers-stripe.md](admin/payments/providers-stripe.md) | Stripe integration details |
| [admin/payments/webhooks.md](admin/payments/webhooks.md) | Webhook endpoints and verification |
| [admin/payments/refunds-and-reconciliation.md](admin/payments/refunds-and-reconciliation.md) | Refund processing and reconciliation |
| [admin/payments/permissions-and-roles.md](admin/payments/permissions-and-roles.md) | Payment permissions and access control |
| [admin/payments/troubleshooting.md](admin/payments/troubleshooting.md) | Common issues and diagnostics |
| [admin/orders-and-cashier.md](admin/orders-and-cashier.md) | Order management and cashier flow |

## 🎨 Frontend - Payments & Checkout

| Document | Description |
|----------|-------------|
| [frontend/README.md](frontend/README.md) | Frontend architecture overview |
| [frontend/routing-and-pages.md](frontend/routing-and-pages.md) | Next.js app router structure |
| [frontend/state-and-stores.md](frontend/state-and-stores.md) | Zustand state management |
| [frontend/api-client.md](frontend/api-client.md) | API client abstraction |
| [frontend/payments/README.md](frontend/payments/README.md) | Payment system overview |
| [frontend/payments/checkout-flow.md](frontend/payments/checkout-flow.md) | End-to-end checkout process |
| [frontend/payments/components.md](frontend/payments/components.md) | Payment UI components |
| [frontend/payments/error-handling.md](frontend/payments/error-handling.md) | Payment error handling and UX |
| [frontend/payments/e2e-tests.md](frontend/payments/e2e-tests.md) | Suggested E2E test flows |

## 🍽️ Core Domain

| Document | Description |
|----------|-------------|
| [domain/README.md](domain/README.md) | Core business domain overview |
| [domain/orders.md](domain/orders.md) | Order state machine and lifecycle |
| [domain/menus-and-categories.md](domain/menus-and-categories.md) | Menu management and caching |
| [domain/tables-and-qr.md](domain/tables-and-qr.md) | Table management and QR codes |

## 🚀 Operations

| Document | Description |
|----------|-------------|
| [ops/README.md](ops/README.md) | Operations overview |
| [ops/setup.md](ops/setup.md) | Local development setup |
| [ops/env.md](ops/env.md) | Environment variables reference |
| [ops/deployment.md](ops/deployment.md) | Production deployment guide |
| [ops/observability.md](ops/observability.md) | Logging, metrics, and debugging |

## 🔍 Quality & Roadmap

| Document | Description |
|----------|-------------|
| [quality/README.md](quality/README.md) | Code quality overview |
| [quality/testing-status.md](quality/testing-status.md) | Testing frameworks and coverage |
| [quality/hotspots.md](quality/hotspots.md) | Known issues and critical bugs |
| [roadmap/refactor-30-60-90.md](roadmap/refactor-30-60-90.md) | Prioritized refactoring plan |

## ❓ Unknowns

| Document | Description |
|----------|-------------|
| [unknowns/README.md](unknowns/README.md) | Unresolved questions requiring clarification |

## 📚 Documentation Standards

- [Contributing Guide](_contrib.md) - How to contribute to documentation
- [Style Guide](_style.md) - Writing standards and conventions
- [Table of Contents](_toc.md) - Complete file index

---

**Last Updated**: Generated from codebase analysis  
**Framework**: TastyIgniter v3 (Laravel 8.x) + Next.js 15.2.4  
**Database**: MySQL 8.0 with multi-tenant isolation