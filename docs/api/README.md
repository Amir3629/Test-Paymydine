# API Documentation

**Public API endpoints, specifications, and integration details** for the PayMyDine restaurant ordering system.

## 📋 Overview

PayMyDine provides **RESTful API endpoints** for:
- **Menu Management**: Menu items, categories, and availability
- **Order Processing**: Order creation, status updates, and management
- **Table Management**: Table information and QR code integration
- **Restaurant Information**: Restaurant details and settings

## 🏗️ API Architecture

### Base URLs
- **Development**: `http://localhost:8000/api/v1` ↩︎ [routes/api.php:122]
- **Production**: `https://{tenant}.paymydine.com/api/v1` ↩︎ [frontend/lib/environment-config.ts:40-50]

### Authentication
**Status**: **Critical Issue** - No authentication implemented ↩︎ [routes/api.php:1-207]

**Risk**: All endpoints are publicly accessible

**Recommendation**: Implement JWT or API key authentication

### Content Type
- **Request**: `application/json`
- **Response**: `application/json`
- **CORS**: Enabled for cross-origin requests ↩︎ [routes/api.php:22]

## 📁 Document Structure

| Document | Description |
|----------|-------------|
| [openapi.yaml](openapi.yaml) | Complete OpenAPI 3.0 specification |

## 🔗 Related Documentation

- **Backend**: [../backend/README.md](../backend/README.md) - Backend API implementation
- **Frontend**: [../frontend/README.md](../frontend/README.md) - Frontend API client
- **Database**: [../database/README.md](../database/README.md) - Database API queries