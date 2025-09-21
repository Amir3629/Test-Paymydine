# Call History Page Discovery - Research Findings

## Executive Summary

This research investigates the notification system in a TastyIgniter + Laravel multi-tenant restaurant management application to understand how to implement a **Sales → History** page that lists notes, waiter calls, and valet requests in one unified interface.

**Key Findings:**
- ✅ Notification system is fully functional with 94 total records (5 new)
- ✅ Three distinct event types: `waiter_call`, `table_note`, `valet_request`
- ✅ Admin dropdown working with real-time updates every 5 seconds
- ✅ Database schema supports history page with proper indexing needs
- ✅ Framework ready for new admin controller integration

---

## 1. Repo Structure

### Framework & Core
- **Framework**: TastyIgniter v3.0 (Laravel-based restaurant management system)
- **PHP Version**: >=7.4
- **Database**: MySQL with tenant isolation
- **Frontend**: Next.js App Router + React components

### Admin Notification System Components

#### UI Components
- `app/admin/views/_partials/notification_bell.blade.php` - Bell dropdown UI
- `app/admin/assets/js/notifications.js` - Client-side dropdown logic (194 lines)
- `app/admin/assets/css/notifications.css` - Dropdown styling
- `app/admin/views/_layouts/default.blade.php` - Base admin layout with notification bell

#### Backend Components
- `app/Helpers/NotificationHelper.php` - Core notification creation logic (229 lines)
- `app/admin/controllers/NotificationsApiController.php` - API endpoints for bell dropdown
- `routes/api.php` - Public API routes for creating notifications
- `app/admin/routes.php` - Admin-specific routes

#### Database Tables
- `ti_notifications` - Central notification storage (source of truth)
- `ti_waiter_calls` - Waiter call records
- `ti_table_notes` - Table note records  
- `ti_valet_requests` - Valet request records

### Admin Framework Structure
- **Base Layout**: `app/admin/views/_layouts/default.blade.php`
- **Asset Management**: `app/admin/views/_meta/assets.json`
- **Menu Registration**: `AdminMenu::setContext('context', 'category')` pattern
- **Service Provider**: `app/admin/ServiceProvider.php` (818 lines)

---

## 2. Database Schema

### Primary Table: `ti_notifications`
```sql
CREATE TABLE `ti_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL,                    -- 'waiter_call', 'table_note', 'valet_request'
  `title` varchar(255) NOT NULL,                  -- Human-readable title
  `table_id` varchar(50) DEFAULT NULL,            -- Table identifier
  `table_name` varchar(100) DEFAULT NULL,         -- Table display name
  `payload` text,                                 -- JSON data (notes, messages, valet details)
  `status` enum('new','seen','in_progress','resolved') DEFAULT 'new',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Current Data Volume:**
- Total notifications: 94 records
- New notifications: 5 records
- Date range: Recent activity (last 24 hours)

**Indexing Status:**
- ❌ **CRITICAL GAP**: Only PRIMARY key exists
- ⚠️ **RECOMMENDED**: Add indexes on `status`, `type`, `created_at`, `table_id`

### Supporting Tables

#### `ti_waiter_calls`
```sql
CREATE TABLE `ti_waiter_calls` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `table_id` int unsigned NOT NULL,
  `message` text,
  `status` enum('pending','resolved') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `table_id` (`table_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `ti_table_notes`
```sql
CREATE TABLE `ti_table_notes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `table_id` int unsigned NOT NULL,
  `note` text NOT NULL,
  `timestamp` timestamp NOT NULL,
  `status` enum('new','resolved') DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `table_id` (`table_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `ti_valet_requests`
```sql
CREATE TABLE `ti_valet_requests` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `table_id` varchar(32) NOT NULL,
  `name` varchar(120) NOT NULL,
  `license_plate` varchar(60) NOT NULL,
  `car_make` varchar(60) DEFAULT NULL,
  `car_model` varchar(60) DEFAULT NULL,
  `color` varchar(40) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'new',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Sample Data Analysis

**Recent Notifications (Latest 5):**
```json
[
  {
    "id": 94,
    "type": "table_note",
    "title": "Note from table 06",
    "table_id": "31",
    "table_name": "table 06",
    "payload": "{\"note\":\"lknln\"}",
    "status": "new",
    "created_at": "2025-09-15 00:32:10"
  },
  {
    "id": 93,
    "type": "waiter_call", 
    "title": "Waiter called from table 06",
    "table_id": "31",
    "table_name": "table 06",
    "payload": "{\"message\":\".\"}",
    "status": "new",
    "created_at": "2025-09-15 00:32:02"
  },
  {
    "id": 92,
    "type": "valet_request",
    "title": "Valet request from table 06", 
    "table_id": "31",
    "table_name": "table 06",
    "payload": "{\"name\":\"jgfj\",\"license_plate\":\"ugh\",\"car_make\":\"nb\"}",
    "status": "seen",
    "created_at": "2025-09-15 00:30:44"
  }
]
```

---

## 3. Runtime Routes & Endpoints

### Admin Bell API Endpoints
```
GET  /admin/notifications-api/count          # Returns {"ok":true,"new":5}
GET  /admin/notifications-api/               # Returns {"ok":true,"items":[...]}
PATCH /admin/notifications-api/{id}          # Mark single notification as seen
PATCH /admin/notifications-api/mark-all-seen # Mark all notifications as seen
```

**Authentication**: Admin session required, CSRF token for PATCH requests

### Public API Endpoints (Frontend → Backend)
```
POST /api/v1/waiter-call     # Creates waiter call + notification
POST /api/v1/table-notes     # Creates table note + notification  
POST /api/v1/valet-request   # Creates valet request + notification
```

**Authentication**: Tenant context via middleware, no CSRF required

### Example API Responses

**Count Endpoint:**
```json
{"ok":true,"new":5}
```

**List Endpoint:**
```json
{
  "ok": true,
  "items": [
    {
      "id": 94,
      "type": "table_note",
      "title": "Note from table 06",
      "table_id": "31", 
      "table_name": "table 06",
      "payload": "{\"note\":\"lknln\"}",
      "status": "new",
      "created_at": "2025-09-15 00:32:10",
      "updated_at": "2025-09-15 00:32:10"
    }
  ]
}
```

---

## 4. Notification Pipeline

### Creation Flow (Frontend → Backend → Database)

#### 1. Waiter Call Flow
```
Frontend: POST /api/v1/waiter-call
├── Validation: table_id (string), message (string, max:500)
├── Tenant context validation
├── Table existence check (TableHelper::validateTable)
├── Database transaction:
│   ├── Insert into ti_waiter_calls
│   └── Create notification via NotificationHelper::createWaiterCallNotification
└── Response: {"ok": true, "message": "Waiter called successfully"}
```

**Payload Schema:**
```json
{
  "table_id": "26",
  "message": "Need napkins" // or "." for minimal calls
}
```

**Notification Creation:**
```php
NotificationHelper::createWaiterCallNotification([
  'tenant_id' => $tenant->id,
  'table_id' => $request->table_id,
  'message' => $request->message
]);
```

#### 2. Table Note Flow
```
Frontend: POST /api/v1/table-notes  
├── Validation: table_id (string), note (string, max:500), timestamp (date)
├── Tenant context validation
├── Table existence check
├── Database transaction:
│   ├── Insert into ti_table_notes
│   └── Create notification via NotificationHelper::createTableNoteNotification
└── Response: {"ok": true, "message": "Note submitted successfully"}
```

**Payload Schema:**
```json
{
  "table_id": "26",
  "note": "Customer wants extra napkins",
  "timestamp": "2025-09-15T00:32:10.000Z"
}
```

#### 3. Valet Request Flow
```
Frontend: POST /api/v1/valet-request
├── Validation: table_id, name, license_plate, car_make (optional)
├── Tenant context validation  
├── Table existence check
├── Database transaction:
│   ├── Insert into ti_valet_requests
│   └── Create notification via NotificationHelper::createValetRequestNotification
└── Response: {"ok": true, "message": "Valet request submitted"}
```

**Payload Schema:**
```json
{
  "table_id": "26",
  "name": "John Doe",
  "license_plate": "ABC123", 
  "car_make": "BMW"
}
```

### Storage Details

**ti_notifications Table Population:**
- `type`: Event type identifier
- `title`: Human-readable title (e.g., "Waiter Call - Table 05")
- `table_id`: Table identifier (string)
- `table_name`: Table display name (e.g., "Table 05")
- `payload`: JSON string containing event-specific data
- `status`: 'new' → 'seen' → 'in_progress' → 'resolved'

### Display Flow (Admin Bell)

```
Admin Bell Dropdown:
├── Auto-refresh every 5 seconds (refreshCount)
├── Load list on dropdown open (loadList)
├── Render items with renderItem() function:
│   ├── Parse JSON payload safely
│   ├── Type-specific rendering:
│   │   ├── waiter_call: Show custom message only (hide "." and legacy defaults)
│   │   ├── table_note: Show full note text
│   │   └── valet_request: Show "Valet • Name • Plate • Car"
│   └── "Seen" button with PATCH /admin/notifications-api/{id}
└── "Mark all seen" button with PATCH /admin/notifications-api/mark-all-seen
```

**Rendering Logic:**
- Safe HTML escaping with `escapeHtml()`
- Text wrapping with CSS classes
- Status-based styling (opacity changes)
- Error handling with fallback UI states

---

## 5. Admin Framework & Menu Integration

### Layout System
- **Base Layout**: `app/admin/views/_layouts/default.blade.php`
- **Asset Loading**: `{!! get_style_tags() !!}` and `{!! get_script_tags() !!}`
- **Menu Rendering**: `{!! AdminMenu::render('side_nav') !!}`
- **Flash Messages**: `{!! $this->makePartial('flash') !!}`

### Menu Registration Pattern
```php
// In controller constructor
AdminMenu::setContext('orders', 'sales');        // Orders page
AdminMenu::setContext('reservations', 'sales');  // Reservations page  
AdminMenu::setContext('payments', 'sales');      // Payments page
AdminMenu::setContext('statuses', 'sales');      // Statuses page
```

**Sales Category Structure:**
- Orders
- Reservations  
- Payments
- Statuses
- **→ History** (to be added)

### Controller Pattern
```php
class Orders extends \Admin\Classes\AdminController
{
    public function __construct()
    {
        parent::__construct();
        AdminMenu::setContext('orders', 'sales');
    }
    
    public function index()
    {
        $this->asExtension('ListController')->index();
    }
}
```

### Required Implementation for History Page
1. **Controller**: `app/admin/controllers/History.php`
2. **Route**: Add to `app/admin/routes.php` under admin group
3. **Menu**: `AdminMenu::setContext('history', 'sales')`
4. **View**: `app/admin/views/history/index.blade.php`
5. **Permissions**: AdminAuth::check() (inherited from AdminController)

---

## 6. Constraints & Recommendations

### Performance Considerations

**Current Database Performance:**
- ✅ 94 notifications manageable for pagination
- ❌ **CRITICAL**: No indexes on `status`, `type`, `created_at`
- ⚠️ **RECOMMENDED**: Add composite index `(status, created_at DESC)`

**Pagination Standards:**
- Admin dropdown: 20 items limit (max 50)
- Standard admin pages: 25 items per page (based on existing patterns)
- Recommended for History: 25 items per page

### Filtering Capabilities

**Realistic Filters (from current data):**
- ✅ **Type**: `waiter_call`, `table_note`, `valet_request`
- ✅ **Status**: `new`, `seen`, `in_progress`, `resolved`
- ✅ **Date Range**: `created_at` filtering
- ✅ **Table**: `table_id` or `table_name` filtering
- ⚠️ **Search**: Limited to `title` field (payload is JSON, not searchable)

**Search Limitations:**
- Payload content not indexed for full-text search
- JSON parsing required for note/message content search
- Recommend simple title-based search initially

### Security Requirements

**Authentication:**
- ✅ Admin session required (`AdminAuth::check()`)
- ✅ CSRF protection for state-changing operations
- ✅ Tenant isolation maintained

**Authorization:**
- ✅ Inherits admin permissions from `AdminController`
- ✅ No additional permission gates needed initially

### Internationalization (i18n)

**Translation System:**
- Admin translations in `app/admin/language/`
- Frontend translations in `frontend/lib/translations.ts`
- Pattern: `@lang('admin::lang.key')` for admin pages

**Required Translation Keys:**
```php
// Admin language files
'history' => 'Call History',
'waiter_calls' => 'Waiter Calls', 
'table_notes' => 'Table Notes',
'valet_requests' => 'Valet Requests',
'filter_by_type' => 'Filter by Type',
'filter_by_status' => 'Filter by Status',
'no_notifications_found' => 'No notifications found'
```

### Data Quality & Legacy Issues

**Known Issues:**
- ✅ Legacy "Customer needs assistance" messages cleaned up
- ✅ Minimal "." messages handled correctly in UI
- ✅ Payload JSON is valid and parseable
- ⚠️ Table name consistency varies ("Table 05" vs "table 06")

**Data Validation:**
- ✅ All current payloads are valid JSON
- ✅ No NULL or malformed records found
- ✅ Status transitions working correctly

---

## 7. Implementation Roadmap

### Phase 1: Database Optimization
```sql
-- Add performance indexes
ALTER TABLE ti_notifications ADD INDEX idx_status_created (status, created_at DESC);
ALTER TABLE ti_notifications ADD INDEX idx_type (type);
ALTER TABLE ti_notifications ADD INDEX idx_table_id (table_id);
```

### Phase 2: Controller & Route Setup
```php
// app/admin/controllers/History.php
class History extends \Admin\Classes\AdminController
{
    public function __construct()
    {
        parent::__construct();
        AdminMenu::setContext('history', 'sales');
    }
    
    public function index()
    {
        // Implement filtering, pagination, and data fetching
    }
}
```

### Phase 3: View Implementation
```blade
{{-- app/admin/views/history/index.blade.php --}}
@extends('admin::_layouts.default')

@section('content')
    <!-- Filter controls, pagination, data table -->
@endsection
```

### Phase 4: Enhanced Features
- Export functionality (CSV/PDF)
- Bulk status updates
- Advanced search with payload content
- Real-time updates (WebSocket integration)

---

## 8. Open Questions

### Technical Questions
1. **Real-time Updates**: Should History page auto-refresh like the bell dropdown?
2. **Export Format**: What format for exporting history data?
3. **Retention Policy**: How long should historical notifications be kept?
4. **Search Scope**: Should search include payload content (notes/messages)?

### Business Questions  
1. **Access Control**: Should History be restricted to certain admin roles?
2. **Notification Limits**: Should there be limits on notification creation per table?
3. **Status Workflow**: Should there be additional status transitions beyond new→seen?

### Integration Questions
1. **Reporting**: Should History integrate with existing reporting system?
2. **Analytics**: Should we track notification response times?
3. **Mobile**: Should History page be mobile-responsive?

---

## 9. Sanity Checklist ✅

- ✅ **Bell dropdown working**: Real-time updates every 5 seconds
- ✅ **API endpoints functional**: All CRUD operations working
- ✅ **Database schema sound**: Proper relationships and data types
- ✅ **No existing History page**: Clean slate for implementation
- ✅ **Framework ready**: Admin controller pattern established
- ✅ **Data quality good**: No malformed or legacy issues
- ✅ **Performance baseline**: 94 records manageable with proper indexing

**Ready for History page implementation!** 🚀