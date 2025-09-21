# Frontend Documentation

**Frontend architecture, components, and payment integration** for the PayMyDine Next.js application.

## 📋 Overview

PayMyDine frontend is built on **Next.js 15.2.4** with:
- **Framework**: Next.js 15.2.4 with TypeScript ↩︎ [frontend/package.json:1-85]
- **UI Library**: Radix UI + Tailwind CSS ↩︎ [frontend/components/ui/]
- **State Management**: Zustand stores ↩︎ [frontend/store/]
- **Payment Integration**: Stripe, PayPal, Apple Pay, Google Pay ↩︎ [frontend/components/payment/]

## 🏗️ Frontend Architecture

### Core Components
- **App Router**: Next.js 15 app directory structure ↩︎ [frontend/app/]
- **Components**: Reusable UI components ↩︎ [frontend/components/]
- **Stores**: Zustand state management ↩︎ [frontend/store/]
- **API Client**: Centralized API communication ↩︎ [frontend/lib/api-client.ts:1-596]

### Key Features
- **Multi-tenant Support**: Tenant-specific routing and configuration ↩︎ [frontend/lib/multi-tenant-config.ts:1-77]
- **Payment Processing**: Secure payment integration ↩︎ [frontend/components/payment/]
- **QR Code Scanning**: Table-specific menu access
- **Real-time Updates**: Order status updates
- **Responsive Design**: Mobile-first approach

## 📁 Document Structure

| Document | Description |
|----------|-------------|
| [routing-and-pages.md](routing-and-pages.md) | Next.js app router structure |
| [state-and-stores.md](state-and-stores.md) | Zustand state management |
| [api-client.md](api-client.md) | API client abstraction |
| [payments/README.md](payments/README.md) | Payment system overview |
| [payments/checkout-flow.md](payments/checkout-flow.md) | Checkout process |
| [payments/components.md](payments/components.md) | Payment UI components |
| [payments/error-handling.md](payments/error-handling.md) | Payment error handling |
| [payments/e2e-tests.md](payments/e2e-tests.md) | E2E test specifications |

## 🔗 Related Documentation

- **Backend**: [../backend/README.md](../backend/README.md) - Backend API integration
- **API**: [../api/README.md](../api/README.md) - API specifications
- **Database**: [../database/README.md](../database/README.md) - Database queries