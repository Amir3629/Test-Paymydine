# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2024-01-15

### Added
- **Admin Header Notifications System**
  - Real-time notification bell in admin header with animated badge counter
  - Notification dropdown panel with loading, empty, and list states
  - Support for multiple notification types: waiter calls, valet requests, table notes
  - Notification management actions: Mark as Seen, In Progress, Resolve
  - Bulk "Mark All Seen" functionality
  - Real-time polling every 15 seconds for new notifications
  - Optimistic UI updates for better user experience

- **Customer Service Features**
  - Waiter call button with optional message input
  - Valet parking request form with customer and vehicle details
  - Table notes functionality for customer feedback
  - All customer actions create admin notifications automatically

- **Database Schema**
  - `ti_notifications` table for storing notification data
  - `ti_notification_recipients` table for per-user notification tracking
  - `ti_waiter_calls` table for waiter call requests
  - `ti_valet_requests` table for valet parking requests
  - `ti_table_notes` table for table-specific notes
  - Proper foreign key constraints and performance indexes

- **API Endpoints**
  - `POST /api/v1/waiter-call` - Enhanced with persistence and notification creation
  - `POST /api/v1/valet-request` - New endpoint for valet requests
  - `POST /api/v1/table-notes` - New endpoint for table notes
  - `GET /admin/api/notifications` - List notifications with filtering and pagination
  - `GET /admin/api/notifications/count` - Get notification counts for badge
  - `PATCH /admin/api/notifications/{id}` - Update notification status
  - `PATCH /admin/api/notifications/mark-all-seen` - Mark all notifications as seen

- **Multi-tenant Support**
  - All notification operations use tenant-specific databases
  - Tenant isolation safeguards to prevent cross-tenant data access
  - Automatic tenant context detection and validation

- **Security & Performance**
  - Input validation and sanitization for all endpoints
  - Rate limiting (max 5 notifications per table per hour)
  - Idempotency protection (duplicate prevention within 60 seconds)
  - Database transaction support for data consistency
  - Comprehensive error logging and monitoring

- **Frontend Components**
  - `WaiterCallButton` - Modal-based waiter call interface
  - `TableNotes` - Note submission form for customers
  - Enhanced valet request page with API integration
  - Responsive design with smooth animations

- **Documentation**
  - Complete OpenAPI specification for all notification endpoints
  - Comprehensive documentation in `docs/notifications/` directory
  - Implementation guides and acceptance criteria
  - Risk assessment and rollback strategies

### Changed
- Enhanced existing waiter call endpoint with persistence and notification creation
- Updated admin header to include notification bell (preserves existing tenant expiry warnings)
- Improved error handling and logging across notification system
- Updated frontend table page to include service buttons

### Fixed
- Fixed tenant database isolation issues in existing notification implementation
- Resolved potential cross-tenant data access vulnerabilities
- Improved error handling for missing tenant context

### Technical Details
- **Backend**: Laravel 8.x with Eloquent ORM
- **Frontend**: Next.js 15.2.4 with TypeScript and Tailwind CSS
- **Database**: MySQL 8.0 with proper indexing and foreign keys
- **Real-time**: AJAX polling (15-second intervals)
- **Authentication**: Session-based admin authentication with permission checks
- **Multi-tenancy**: Database-per-tenant architecture with middleware protection

### Migration Notes
- Run database migrations to create notification tables
- Ensure tenant databases are properly configured
- Update admin panel templates to include notification bell
- Configure notification polling intervals if needed

### Breaking Changes
- None - all changes are additive and backward compatible

### Dependencies
- No new external dependencies required
- Uses existing Laravel and Next.js infrastructure
- Compatible with current multi-tenant architecture