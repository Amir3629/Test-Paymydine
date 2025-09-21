# Admin UI and API Specification

**Admin panel UI components and API endpoints** for the Admin Header Notifications feature. This document defines the notification bell UI, dropdown panel, and admin API endpoints for notification management.

## 📋 Admin Header Template Analysis

### Current Header Structure
**Main header template**: `app/admin/views/_partials/top_nav.blade.php` ↩︎ [app/admin/views/_partials/top_nav.blade.php:1-32]

**Key components**:
- **Logo section**: Lines 8-13 ↩︎ [app/admin/views/_partials/top_nav.blade.php:8-13]
- **Page title**: Lines 15-17 ↩︎ [app/admin/views/_partials/top_nav.blade.php:15-17]
- **Right navbar**: Lines 19-27 ↩︎ [app/admin/views/_partials/top_nav.blade.php:19-27]
- **Main menu widget**: Line 26 ↩︎ [app/admin/views/_partials/top_nav.blade.php:26]

### Main Menu Widget Integration
**Widget class**: `Admin\Widgets\Menu` ↩︎ [app/admin/widgets/Menu.php:1-92]

**Template**: `app/admin/widgets/menu/top_menu.blade.php` ↩︎ [app/admin/widgets/menu/top_menu.blade.php:1-10]

**Current menu structure**:
```html
<ul id="{{ $this->getId() }}" class="navbar-nav" data-control="mainmenu" data-alias="{{ $this->alias }}">
    @foreach ($items as $item)
        {!! $this->renderItemElement($item) !!}
    @endforeach
</ul>
```
↩︎ [app/admin/widgets/menu/top_menu.blade.php:1-10]

### Notification Bell Integration Point
**Integration location**: `app/admin/views/_partials/top_nav.blade.php:26` ↩︎ [app/admin/views/_partials/top_nav.blade.php:26]

**Current implementation**:
```html
<div class="navbar navbar-right">
    <button type="button" class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navSidebar">
        <span class="fa fa-bars"></span>
    </button>
    
    {!! $this->widgets['mainmenu']->render() !!}
</div>
```
↩︎ [app/admin/views/_partials/top_nav.blade.php:19-27]

**Required modification**: Add notification bell before or after main menu widget

## 🔔 Notification Bell UI Components

### Bell Icon and Badge
**HTML structure**:
```html
<li class="dropdown notification-dropdown me-n1">
    <a href="#" class="dropdown-toggle nk-quick-nav-icon" data-bs-toggle="dropdown" id="notification-bell">
        <div class="icon-status icon-status-info">
            <em class="icon ni ni-bell"></em>
            <span class="notification-badge" id="notification-count" style="display: none;">0</span>
        </div>
    </a>
    <!-- Dropdown panel will be here -->
</li>
```

**CSS classes**:
- `.notification-dropdown` - Main dropdown container
- `.nk-quick-nav-icon` - Bell icon container
- `.icon-status` - Icon status styling
- `.nk-bell` - Bell icon class
- `.notification-badge` - Badge counter styling

### Dropdown Panel Structure
**HTML structure**:
```html
<div class="dropdown-menu dropdown-menu-xl dropdown-menu-end dropdown-menu-s1" id="notification-panel">
    <div class="dropdown-head">
        <span class="sub-title nk-dropdown-title">Notifications</span>
        <a href="#" id="mark-all-seen" class="btn btn-sm btn-outline-primary">Mark All Seen</a>
    </div>
    
    <div class="dropdown-body">
        <div class="nk-notification" id="notification-list">
            <!-- Loading state -->
            <div class="notification-loading" id="notification-loading" style="display: none;">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            
            <!-- Empty state -->
            <div class="notification-empty" id="notification-empty" style="display: none;">
                <div class="text-center py-4">
                    <em class="icon ni ni-bell-slash text-muted" style="font-size: 2rem;"></em>
                    <p class="text-muted mt-2">No notifications</p>
                </div>
            </div>
            
            <!-- Notification items -->
            <div class="notification-items" id="notification-items">
                <!-- Individual notification items will be rendered here -->
            </div>
        </div>
        
        <!-- Load more button -->
        <div class="dropdown-footer" id="notification-footer" style="display: none;">
            <button class="btn btn-sm btn-outline-secondary w-100" id="load-more-notifications">
                Load More
            </button>
        </div>
    </div>
</div>
```

### Individual Notification Item
**HTML structure**:
```html
<div class="nk-notification-item dropdown-inner notification-item" data-notification-id="{{ $notification->notification_id }}">
    <div class="notification-icon">
        <em class="icon ni ni-{{ $notification->type_icon }}"></em>
    </div>
    <div class="notification-content">
        <div class="notification-header">
            <h6 class="notification-title">{{ $notification->title }}</h6>
            <span class="notification-time">{{ $notification->created_at->diffForHumans() }}</span>
        </div>
        <div class="notification-body">
            <p class="notification-message">{{ $notification->message }}</p>
            @if($notification->table_name)
                <span class="notification-table">Table: {{ $notification->table_name }}</span>
            @endif
        </div>
        <div class="notification-actions">
            <button class="btn btn-sm btn-outline-primary mark-seen" data-id="{{ $notification->notification_id }}">
                Seen
            </button>
            <button class="btn btn-sm btn-outline-warning mark-in-progress" data-id="{{ $notification->notification_id }}">
                In Progress
            </button>
            <button class="btn btn-sm btn-outline-success mark-resolved" data-id="{{ $notification->notification_id }}">
                Resolve
            </button>
            @if($notification->table_id)
                <a href="{{ admin_url('tables/' . $notification->table_id) }}" class="btn btn-sm btn-outline-info">
                    View Table
                </a>
            @endif
        </div>
    </div>
</div>
```

## 🎨 UI States and Animations

### UI States
**1. Empty State**:
- Show when no notifications exist
- Display bell icon with slash
- "No notifications" message

**2. Loading State**:
- Show spinner while fetching notifications
- Hide notification list during loading
- Show loading indicator in dropdown

**3. Error State**:
- Show error message if API call fails
- Retry button for failed requests
- Fallback to cached notifications

**4. List State**:
- Show notification items
- Pagination for large lists
- Load more button for additional notifications

### CSS Animations
**Badge animation**:
```css
.notification-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #dc3545;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: badgeBump 0.3s ease-in-out;
}

@keyframes badgeBump {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}
```

**Dropdown animation**:
```css
.dropdown-menu {
    transition: all 0.3s ease-in-out;
    transform: translateY(-10px);
    opacity: 0;
}

.dropdown-menu.show {
    transform: translateY(0);
    opacity: 1;
}
```

**Notification item hover**:
```css
.notification-item {
    transition: background-color 0.2s ease-in-out;
}

.notification-item:hover {
    background-color: #f8f9fa;
}
```

## 🔄 Real-time Updates

### Polling Strategy
**Default approach**: AJAX polling every 10-15 seconds

**Polling configuration**:
```javascript
const NOTIFICATION_CONFIG = {
    pollingInterval: 15000, // 15 seconds
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
    enablePolling: true
};
```

**Environment flags**:
```env
# Frontend environment variables
NEXT_PUBLIC_NOTIFICATION_POLLING=true
NEXT_PUBLIC_NOTIFICATION_POLLING_INTERVAL=15000
NEXT_PUBLIC_NOTIFICATION_WEBSOCKET=false
```

### WebSocket Alternative
**Status**: **Unknown** - No WebSocket implementation found

**If WebSocket is implemented**:
```javascript
const NOTIFICATION_CONFIG = {
    websocketUrl: process.env.NEXT_PUBLIC_WS_URL,
    enableWebSocket: true,
    enablePolling: false
};
```

## 🔧 Admin API Endpoints

### Notification List Endpoint
**Endpoint**: `GET /admin/api/notifications`

**Query parameters**:
- `status` - Filter by status (new, seen, in_progress, resolved, all)
- `type` - Filter by notification type
- `page` - Page number for pagination
- `limit` - Number of notifications per page (default: 20)

**Request example**:
```http
GET /admin/api/notifications?status=new&page=1&limit=20
Authorization: Bearer {admin_token}
```

**Response example**:
```json
{
    "success": true,
    "data": {
        "notifications": [
            {
                "notification_id": 1,
                "type": "waiter_call",
                "title": "Waiter Call - Table 7",
                "message": "Customer needs assistance with the menu",
                "table_id": 7,
                "table_name": "Table 7",
                "status": "new",
                "priority": "medium",
                "created_at": "2024-01-15T14:30:00Z",
                "seen_at": null,
                "acted_by": null,
                "acted_at": null,
                "payload": {
                    "customer_name": "John Doe",
                    "customer_phone": "+1234567890",
                    "message": "Need assistance with the menu"
                }
            }
        ],
        "pagination": {
            "current_page": 1,
            "per_page": 20,
            "total": 1,
            "last_page": 1,
            "has_more": false
        },
        "counts": {
            "new": 1,
            "seen": 0,
            "in_progress": 0,
            "resolved": 0
        }
    }
}
```

### Notification Count Endpoint
**Endpoint**: `GET /admin/api/notifications/count`

**Response example**:
```json
{
    "success": true,
    "data": {
        "new": 5,
        "seen": 12,
        "in_progress": 3,
        "resolved": 8,
        "total": 28
    }
}
```

### Update Notification Status
**Endpoint**: `PATCH /admin/api/notifications/{id}`

**Request body**:
```json
{
    "status": "seen",
    "acted_by": 1
}
```

**Response example**:
```json
{
    "success": true,
    "data": {
        "notification_id": 1,
        "status": "seen",
        "seen_at": "2024-01-15T14:35:00Z",
        "acted_by": 1,
        "acted_at": "2024-01-15T14:35:00Z"
    }
}
```

### Mark All as Seen
**Endpoint**: `PATCH /admin/api/notifications/mark-all-seen`

**Request body**:
```json
{
    "acted_by": 1
}
```

**Response example**:
```json
{
    "success": true,
    "data": {
        "updated_count": 5,
        "acted_by": 1,
        "acted_at": "2024-01-15T14:35:00Z"
    }
}
```

## 🔒 Authentication and Permissions

### Admin Authentication
**Current admin auth**: Session-based authentication ↩︎ [app/admin/controllers/SuperAdminController.php:1-50]

**Required middleware**: `web`, `TenantDatabaseMiddleware` ↩︎ [app/admin/routes.php:196-197]

### Permission Requirements
**Admin permissions**:
- `Admin.Notifications` - View notifications
- `Admin.Notifications.Manage` - Update notification status
- `Admin.Notifications.Delete` - Delete notifications

**Role-based access**:
- **Super Admin**: Full access to all notifications
- **Admin**: Access to tenant-specific notifications
- **Cashier**: Limited access to table-related notifications

### Tenant Isolation
**Multi-tenant requirements**:
- All API endpoints must use tenant-specific database
- Admin only sees notifications for their tenant
- Tenant context from `TenantDatabaseMiddleware` ↩︎ [app/Http/Middleware/TenantDatabaseMiddleware.php:1-48]

## 📱 JavaScript Implementation

### Notification Manager Class
**Location**: `app/admin/assets/js/notifications.js`

**Class structure**:
```javascript
class NotificationManager {
    constructor(config) {
        this.config = {
            pollingInterval: 15000,
            maxRetries: 3,
            retryDelay: 5000,
            enablePolling: true,
            ...config
        };
        this.pollingTimer = null;
        this.isPolling = false;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.startPolling();
    }
    
    bindEvents() {
        // Bell click event
        $('#notification-bell').on('click', () => this.togglePanel());
        
        // Mark as seen buttons
        $(document).on('click', '.mark-seen', (e) => this.markAsSeen(e));
        
        // Mark in progress buttons
        $(document).on('click', '.mark-in-progress', (e) => this.markInProgress(e));
        
        // Mark resolved buttons
        $(document).on('click', '.mark-resolved', (e) => this.markResolved(e));
        
        // Mark all seen button
        $('#mark-all-seen').on('click', () => this.markAllSeen());
        
        // Load more button
        $('#load-more-notifications').on('click', () => this.loadMore());
    }
    
    startPolling() {
        if (!this.config.enablePolling) return;
        
        this.pollingTimer = setInterval(() => {
            this.fetchNotifications();
        }, this.config.pollingInterval);
    }
    
    stopPolling() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
            this.pollingTimer = null;
        }
    }
    
    async fetchNotifications() {
        try {
            const response = await fetch('/admin/api/notifications?status=new');
            const data = await response.json();
            
            if (data.success) {
                this.updateBadge(data.data.counts.new);
                this.updateNotificationList(data.data.notifications);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }
    
    updateBadge(count) {
        const badge = $('#notification-count');
        if (count > 0) {
            badge.text(count).show();
            badge.addClass('badge-bump');
            setTimeout(() => badge.removeClass('badge-bump'), 300);
        } else {
            badge.hide();
        }
    }
    
    updateNotificationList(notifications) {
        const container = $('#notification-items');
        const emptyState = $('#notification-empty');
        
        if (notifications.length === 0) {
            container.hide();
            emptyState.show();
        } else {
            container.show();
            emptyState.hide();
            container.html(this.renderNotifications(notifications));
        }
    }
    
    renderNotifications(notifications) {
        return notifications.map(notification => `
            <div class="nk-notification-item dropdown-inner notification-item" data-notification-id="${notification.notification_id}">
                <div class="notification-icon">
                    <em class="icon ni ni-${this.getTypeIcon(notification.type)}"></em>
                </div>
                <div class="notification-content">
                    <div class="notification-header">
                        <h6 class="notification-title">${notification.title}</h6>
                        <span class="notification-time">${this.formatTime(notification.created_at)}</span>
                    </div>
                    <div class="notification-body">
                        <p class="notification-message">${notification.message}</p>
                        ${notification.table_name ? `<span class="notification-table">Table: ${notification.table_name}</span>` : ''}
                    </div>
                    <div class="notification-actions">
                        <button class="btn btn-sm btn-outline-primary mark-seen" data-id="${notification.notification_id}">Seen</button>
                        <button class="btn btn-sm btn-outline-warning mark-in-progress" data-id="${notification.notification_id}">In Progress</button>
                        <button class="btn btn-sm btn-outline-success mark-resolved" data-id="${notification.notification_id}">Resolve</button>
                        ${notification.table_id ? `<a href="/admin/tables/${notification.table_id}" class="btn btn-sm btn-outline-info">View Table</a>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    getTypeIcon(type) {
        const icons = {
            'waiter_call': 'bell',
            'valet_request': 'car',
            'table_note': 'note',
            'order_ready': 'check-circle',
            'payment_issue': 'alert-circle',
            'system_alert': 'info'
        };
        return icons[type] || 'bell';
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }
    
    async markAsSeen(event) {
        const id = $(event.target).data('id');
        await this.updateNotificationStatus(id, 'seen');
    }
    
    async markInProgress(event) {
        const id = $(event.target).data('id');
        await this.updateNotificationStatus(id, 'in_progress');
    }
    
    async markResolved(event) {
        const id = $(event.target).data('id');
        await this.updateNotificationStatus(id, 'resolved');
    }
    
    async markAllSeen() {
        try {
            const response = await fetch('/admin/api/notifications/mark-all-seen', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                body: JSON.stringify({
                    acted_by: this.getCurrentStaffId()
                })
            });
            
            const data = await response.json();
            if (data.success) {
                this.updateBadge(0);
                this.fetchNotifications();
            }
        } catch (error) {
            console.error('Failed to mark all as seen:', error);
        }
    }
    
    async updateNotificationStatus(id, status) {
        try {
            const response = await fetch(`/admin/api/notifications/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                body: JSON.stringify({
                    status: status,
                    acted_by: this.getCurrentStaffId()
                })
            });
            
            const data = await response.json();
            if (data.success) {
                this.fetchNotifications();
            }
        } catch (error) {
            console.error('Failed to update notification status:', error);
        }
    }
    
    getCurrentStaffId() {
        // Get current staff ID from session or meta tag
        return $('meta[name="staff-id"]').attr('content') || 1;
    }
    
    togglePanel() {
        const panel = $('#notification-panel');
        panel.toggleClass('show');
        
        if (panel.hasClass('show')) {
            this.fetchNotifications();
        }
    }
}

// Initialize when document is ready
$(document).ready(function() {
    new NotificationManager();
});
```

## 📚 Related Files

### Templates
- `app/admin/views/_partials/top_nav.blade.php` - Main header template ↩︎ [app/admin/views/_partials/top_nav.blade.php:1-32]
- `app/admin/views/_layouts/default.blade.php` - Main layout template ↩︎ [app/admin/views/_layouts/default.blade.php:1-53]

### Widgets
- `app/admin/widgets/Menu.php` - Main menu widget class ↩︎ [app/admin/widgets/Menu.php:1-92]
- `app/admin/widgets/menu/top_menu.blade.php` - Menu template ↩︎ [app/admin/widgets/menu/top_menu.blade.php:1-10]

### Routes
- `app/admin/routes.php` - Admin panel routes ↩︎ [app/admin/routes.php:1-925]

### Middleware
- `app/Http/Middleware/TenantDatabaseMiddleware.php` - Tenant database switching ↩︎ [app/Http/Middleware/TenantDatabaseMiddleware.php:1-48]

## 📋 Summary

**Current status**:
- **Header template exists**: `top_nav.blade.php` provides integration point
- **Menu widget exists**: Can be extended with notification bell
- **No notification UI**: No proper notification dropdown or management
- **No admin API**: No notification management endpoints

**Required implementation**:
1. **Add notification bell**: Integrate with existing header template
2. **Create dropdown panel**: Notification list with management actions
3. **Implement admin API**: CRUD endpoints for notification management
4. **Add JavaScript**: Real-time updates and user interactions
5. **Add CSS**: Animations and responsive design
6. **Add authentication**: Proper admin authentication and permissions

**Integration points**:
- **Header template**: `app/admin/views/_partials/top_nav.blade.php:26`
- **Menu widget**: Extend existing widget system
- **Admin routes**: Add notification API endpoints
- **Tenant middleware**: Ensure proper tenant isolation