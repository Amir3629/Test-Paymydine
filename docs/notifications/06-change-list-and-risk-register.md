# Change List and Risk Register

**Implementation plan and risk assessment** for the Admin Header Notifications feature. This document outlines all files to modify/create, implementation phases, and risk mitigation strategies.

## 📋 Implementation Phases

### Phase 1: Database and Models (Week 1)
**Priority**: High
**Dependencies**: None
**Risk Level**: Low

### Phase 2: Backend API (Week 2)
**Priority**: High
**Dependencies**: Phase 1
**Risk Level**: Medium

### Phase 3: Frontend Integration (Week 3)
**Priority**: High
**Dependencies**: Phase 2
**Risk Level**: Medium

### Phase 4: Admin UI (Week 4)
**Priority**: High
**Dependencies**: Phase 3
**Risk Level**: Medium

### Phase 5: Testing and Deployment (Week 5)
**Priority**: High
**Dependencies**: Phase 4
**Risk Level**: Low

## 🗄️ Database Changes

### New Tables
| Table | Purpose | Risk Level | Rollback Strategy |
|-------|---------|------------|-------------------|
| `ti_notifications` | Store notifications | Low | Drop table |
| `ti_notification_recipients` | Store recipients | Low | Drop table |
| `ti_waiter_calls` | Store waiter calls | Low | Drop table |
| `ti_valet_requests` | Store valet requests | Low | Drop table |
| `ti_table_notes` | Store table notes | Low | Drop table |

### Migration Files
| File | Purpose | Risk Level | Rollback Strategy |
|------|---------|------------|-------------------|
| `database/migrations/YYYY_MM_DD_HHMMSS_create_notifications_table.php` | Create notification tables | Low | Run down() method |
| `database/migrations/YYYY_MM_DD_HHMMSS_add_notification_indexes.php` | Add performance indexes | Low | Drop indexes |

### Database Indexes
| Table | Index | Purpose | Risk Level |
|-------|-------|---------|------------|
| `ti_notifications` | `idx_tenant_status` | Query performance | Low |
| `ti_notifications` | `idx_tenant_created` | Pagination | Low |
| `ti_notifications` | `idx_type_status` | Type filtering | Low |
| `ti_notifications` | `idx_table_id` | Table filtering | Low |

## 🏗️ Backend Changes

### New Models
| File | Purpose | Risk Level | Rollback Strategy |
|------|---------|------------|-------------------|
| `app/admin/models/Notifications_model.php` | Notification model | Low | Delete file |
| `app/admin/models/Waiter_calls_model.php` | Waiter call model | Low | Delete file |
| `app/admin/models/Valet_requests_model.php` | Valet request model | Low | Delete file |
| `app/admin/models/Table_notes_model.php` | Table note model | Low | Delete file |

### New Controllers
| File | Purpose | Risk Level | Rollback Strategy |
|------|---------|------------|-------------------|
| `app/admin/controllers/Notifications.php` | Admin notification controller | Medium | Delete file |
| `app/Http/Controllers/Api/NotificationController.php` | API notification controller | Medium | Delete file |
| `app/Http/Controllers/Api/WaiterCallController.php` | Waiter call API controller | Medium | Delete file |
| `app/Http/Controllers/Api/ValetRequestController.php` | Valet request API controller | Medium | Delete file |
| `app/Http/Controllers/Api/TableNoteController.php` | Table note API controller | Medium | Delete file |

### Modified Files
| File | Purpose | Risk Level | Rollback Strategy |
|------|---------|------------|-------------------|
| `routes/api.php` | Add notification endpoints | Medium | Revert changes |
| `app/admin/routes.php` | Add admin notification routes | Medium | Revert changes |
| `app/Http/Middleware/TenantDatabaseMiddleware.php` | Ensure tenant context | High | Revert changes |

### New Helpers
| File | Purpose | Risk Level | Rollback Strategy |
|------|---------|------------|-------------------|
| `app/Helpers/TableHelper.php` | Table information helper | Low | Delete file |
| `app/Helpers/NotificationHelper.php` | Notification helper | Low | Delete file |

## 🎨 Frontend Changes

### New Components
| File | Purpose | Risk Level | Rollback Strategy |
|------|---------|------------|-------------------|
| `frontend/components/waiter-call-button.tsx` | Waiter call component | Medium | Delete file |
| `frontend/components/table-notes.tsx` | Table notes component | Medium | Delete file |
| `frontend/components/valet-request-form.tsx` | Valet request form | Medium | Delete file |

### Modified Files
| File | Purpose | Risk Level | Rollback Strategy |
|------|---------|------------|-------------------|
| `frontend/app/table/[table_id]/page.tsx` | Add waiter call button | Medium | Revert changes |
| `frontend/app/table/[table_id]/valet/page.tsx` | Add API integration | Medium | Revert changes |
| `frontend/lib/api-client.ts` | Add notification methods | Low | Revert changes |

### New API Methods
| Method | Purpose | Risk Level | Rollback Strategy |
|--------|---------|------------|-------------------|
| `callWaiter()` | Call waiter API | Medium | Remove method |
| `submitValetRequest()` | Submit valet request | Medium | Remove method |
| `submitTableNote()` | Submit table note | Medium | Remove method |

## 🔔 Admin UI Changes

### New Templates
| File | Purpose | Risk Level | Rollback Strategy |
|------|---------|------------|-------------------|
| `app/admin/views/notifications/index.blade.php` | Notification list view | Medium | Delete file |
| `app/admin/views/notifications/_partials/notification_item.blade.php` | Notification item partial | Medium | Delete file |
| `app/admin/views/notifications/_partials/notification_bell.blade.php` | Notification bell partial | Medium | Delete file |

### Modified Files
| File | Purpose | Risk Level | Rollback Strategy |
|------|---------|------------|-------------------|
| `app/admin/views/_partials/top_nav.blade.php` | Add notification bell | High | Revert changes |
| `app/admin/views/_layouts/default.blade.php` | Add notification scripts | Medium | Revert changes |
| `app/admin/widgets/Menu.php` | Add notification menu item | Medium | Revert changes |

### New JavaScript
| File | Purpose | Risk Level | Rollback Strategy |
|------|---------|------------|-------------------|
| `app/admin/assets/js/notifications.js` | Notification manager | Medium | Delete file |
| `app/admin/assets/css/notifications.css` | Notification styles | Low | Delete file |

## 🚨 Risk Register

### High Risk Items

#### 1. Tenant Database Middleware Modification
**Risk**: Breaking existing tenant functionality
**Impact**: High - Could break multi-tenant system
**Probability**: Medium
**Mitigation**: 
- Thorough testing in staging environment
- Gradual rollout with feature flags
- Immediate rollback plan
- Database backup before changes

**Rollback Strategy**:
```bash
# Revert middleware changes
git checkout HEAD~1 app/Http/Middleware/TenantDatabaseMiddleware.php
php artisan config:clear
php artisan cache:clear
```

#### 2. Admin Header Template Modification
**Risk**: Breaking admin panel layout
**Impact**: High - Could break admin panel UI
**Probability**: Medium
**Mitigation**:
- Test in isolated environment
- Use feature flags for gradual rollout
- Maintain backward compatibility
- CSS isolation to prevent conflicts

**Rollback Strategy**:
```bash
# Revert template changes
git checkout HEAD~1 app/admin/views/_partials/top_nav.blade.php
php artisan view:clear
```

### Medium Risk Items

#### 3. API Route Modifications
**Risk**: Breaking existing API functionality
**Impact**: Medium - Could break frontend integration
**Probability**: Medium
**Mitigation**:
- Version API endpoints
- Maintain backward compatibility
- Comprehensive API testing
- Monitor API usage

**Rollback Strategy**:
```bash
# Revert API changes
git checkout HEAD~1 routes/api.php
php artisan route:clear
```

#### 4. Database Schema Changes
**Risk**: Data loss or corruption
**Impact**: High - Could lose notification data
**Probability**: Low
**Mitigation**:
- Database backup before migration
- Test migration on staging
- Rollback migration available
- Monitor database performance

**Rollback Strategy**:
```bash
# Rollback database migration
php artisan migrate:rollback --step=1
```

#### 5. Frontend Component Integration
**Risk**: Breaking existing frontend functionality
**Impact**: Medium - Could break customer experience
**Probability**: Medium
**Mitigation**:
- Component isolation
- Feature flags for gradual rollout
- Comprehensive frontend testing
- Monitor user interactions

**Rollback Strategy**:
```bash
# Revert frontend changes
git checkout HEAD~1 frontend/
npm run build
```

### Low Risk Items

#### 6. New Model Creation
**Risk**: Minimal impact on existing functionality
**Impact**: Low - New functionality only
**Probability**: Low
**Mitigation**:
- Follow existing patterns
- Comprehensive unit testing
- Code review process

#### 7. New Helper Functions
**Risk**: Minimal impact on existing functionality
**Impact**: Low - New functionality only
**Probability**: Low
**Mitigation**:
- Follow existing patterns
- Comprehensive unit testing
- Code review process

## 🔄 Rollback Strategy

### Database Rollback
```bash
# 1. Stop application
sudo systemctl stop nginx
sudo systemctl stop php8.1-fpm

# 2. Restore database backup
mysql -u root -p paymydine < backup_before_notifications.sql

# 3. Revert code changes
git checkout HEAD~1

# 4. Clear caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# 5. Restart application
sudo systemctl start php8.1-fpm
sudo systemctl start nginx
```

### Code Rollback
```bash
# 1. Revert to previous commit
git checkout HEAD~1

# 2. Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# 3. Rebuild frontend
cd frontend
npm run build

# 4. Restart services
sudo systemctl restart php8.1-fpm
sudo systemctl restart nginx
```

### Configuration Rollback
```bash
# 1. Revert environment changes
git checkout HEAD~1 .env

# 2. Clear configuration cache
php artisan config:clear

# 3. Restart application
sudo systemctl restart php8.1-fpm
```

## 🧪 Testing Plan

### Unit Tests
| Component | Test Coverage | Risk Level |
|-----------|---------------|------------|
| Notification Model | 100% | Low |
| API Controllers | 100% | Medium |
| Helper Functions | 100% | Low |
| Validation Rules | 100% | Medium |

### Integration Tests
| Flow | Test Coverage | Risk Level |
|------|---------------|------------|
| Waiter Call Flow | 100% | Medium |
| Valet Request Flow | 100% | Medium |
| Table Note Flow | 100% | Medium |
| Admin Notification Flow | 100% | High |

### E2E Tests
| Scenario | Test Coverage | Risk Level |
|----------|---------------|------------|
| Customer submits waiter call | 100% | Medium |
| Admin sees notification | 100% | High |
| Admin marks notification as seen | 100% | High |
| Multi-tenant isolation | 100% | High |

### Performance Tests
| Metric | Target | Risk Level |
|--------|--------|------------|
| API Response Time | < 200ms | Medium |
| Database Query Time | < 100ms | Medium |
| Memory Usage | < 100MB | Low |
| CPU Usage | < 10% | Low |

## 📊 Monitoring Plan

### Application Monitoring
| Metric | Threshold | Action |
|--------|-----------|--------|
| API Response Time | > 500ms | Alert |
| Database Query Time | > 200ms | Alert |
| Memory Usage | > 200MB | Alert |
| CPU Usage | > 20% | Alert |
| Error Rate | > 1% | Alert |

### Business Monitoring
| Metric | Threshold | Action |
|--------|-----------|--------|
| Notification Delivery | < 99% | Alert |
| User Satisfaction | < 90% | Alert |
| System Uptime | < 99.9% | Alert |
| Security Incidents | > 0 | Alert |

### Database Monitoring
| Metric | Threshold | Action |
|--------|-----------|--------|
| Table Size | > 1GB | Alert |
| Index Usage | < 80% | Alert |
| Query Performance | > 100ms | Alert |
| Connection Pool | > 80% | Alert |

## 📚 Related Files

### Implementation Files
- `docs/notifications/00-overview.md` - Current state analysis
- `docs/notifications/01-sources-and-events.md` - Event mapping
- `docs/notifications/02-data-model-and-storage.md` - Database design
- `docs/notifications/03-admin-ui-and-api-spec.md` - UI and API spec
- `docs/notifications/04-ingestion-pipeline.md` - Event processing
- `docs/notifications/05-acceptance-criteria.md` - Requirements

### Configuration Files
- `config/database.php` - Database configuration
- `config/logging.php` - Logging configuration
- `config/queue.php` - Queue configuration

### Monitoring Files
- `app/Http/Middleware/LogNotificationActivity.php` - Logging middleware
- `app/Providers/NotificationServiceProvider.php` - Service provider
- `app/Console/Commands/NotificationCleanup.php` - Cleanup command

## 📋 Summary

**Implementation Phases**:
1. **Phase 1**: Database and Models (Week 1)
2. **Phase 2**: Backend API (Week 2)
3. **Phase 3**: Frontend Integration (Week 3)
4. **Phase 4**: Admin UI (Week 4)
5. **Phase 5**: Testing and Deployment (Week 5)

**High Risk Items**:
1. **Tenant Database Middleware**: Could break multi-tenant system
2. **Admin Header Template**: Could break admin panel UI

**Medium Risk Items**:
1. **API Route Modifications**: Could break frontend integration
2. **Database Schema Changes**: Could cause data loss
3. **Frontend Component Integration**: Could break customer experience

**Low Risk Items**:
1. **New Model Creation**: Minimal impact
2. **New Helper Functions**: Minimal impact

**Rollback Strategy**:
- Database backup and restore
- Code reversion to previous commit
- Configuration rollback
- Service restart

**Testing Plan**:
- Unit tests for all components
- Integration tests for all flows
- E2E tests for user scenarios
- Performance tests for metrics

**Monitoring Plan**:
- Application metrics monitoring
- Business metrics monitoring
- Database metrics monitoring
- Alert thresholds and actions