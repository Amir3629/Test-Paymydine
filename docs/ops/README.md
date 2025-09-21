# Operations Documentation

**Setup, deployment, environment configuration, and observability** for the PayMyDine system.

## 📋 Operations Overview

### System Architecture
- **Backend**: Laravel 8.x (TastyIgniter v3) ↩︎ [composer.json:1-68]
- **Frontend**: Next.js 15.2.4 ↩︎ [frontend/package.json:1-85]
- **Database**: MySQL 8.0 ↩︎ [db/paymydine.sql:1-50]
- **Multi-tenant**: Database-per-tenant isolation ↩︎ [app/Http/Middleware/TenantDatabaseMiddleware.php:1-48]

### Deployment Environments
- **Development**: Local development setup
- **Production**: Multi-tenant production deployment
- **Staging**: **Unknown** - Staging environment not configured

## 📁 Document Structure

| Document | Description |
|----------|-------------|
| [setup.md](setup.md) | Local development setup guide |
| [env.md](env.md) | Environment variables reference |
| [deployment.md](deployment.md) | Production deployment guide |
| [observability.md](observability.md) | Logging, metrics, and debugging |

## 🔗 Related Documentation

- **Architecture**: [../architecture/README.md](../architecture/README.md) - System architecture
- **Database**: [../database/README.md](../database/README.md) - Database operations
- **Tenancy**: [../tenancy/README.md](../tenancy/README.md) - Multi-tenant operations