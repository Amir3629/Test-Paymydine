# Notification Acceptance Criteria

**Functional and non-functional requirements** for the Admin Header Notifications feature. This document defines the acceptance criteria, testing requirements, and success metrics.

## 📋 Functional Requirements

### 1. Admin Header Notification Bell
**Requirement**: Admin header shows a bell with animated badge

**Acceptance Criteria**:
- ✅ **Bell Icon**: Bell icon is visible in admin header
- ✅ **Badge Counter**: Badge shows count of NEW notifications
- ✅ **Badge Animation**: Badge animates when count changes
- ✅ **Badge Visibility**: Badge is hidden when count is 0
- ✅ **Badge Color**: Badge uses red color (#dc3545) for visibility

**Test Cases**:
```javascript
// Test badge visibility
expect($('#notification-count')).toBeVisible()
expect($('#notification-count')).toHaveText('5')

// Test badge animation
expect($('#notification-count')).toHaveClass('badge-bump')

// Test badge hiding
expect($('#notification-count')).toBeHidden()
```

### 2. Notification Dropdown Panel
**Requirement**: Clicking bell opens a panel with grouped items

**Acceptance Criteria**:
- ✅ **Dropdown Toggle**: Clicking bell toggles dropdown panel
- ✅ **Panel Positioning**: Panel appears below bell icon
- ✅ **Panel Size**: Panel is large enough to show multiple notifications
- ✅ **Panel Styling**: Panel matches admin panel design
- ✅ **Panel Animation**: Panel slides down/up smoothly

**Test Cases**:
```javascript
// Test dropdown toggle
$('#notification-bell').click()
expect($('#notification-panel')).toBeVisible()

// Test panel positioning
expect($('#notification-panel')).toHaveClass('dropdown-menu-end')

// Test panel animation
expect($('#notification-panel')).toHaveClass('show')
```

### 3. Notification List Display
**Requirement**: Panel shows grouped items (Newest first)

**Acceptance Criteria**:
- ✅ **List Order**: Notifications sorted by created_at DESC
- ✅ **Item Display**: Each item shows type, title, table, time, message
- ✅ **Empty State**: Shows "No notifications" when empty
- ✅ **Loading State**: Shows spinner while loading
- ✅ **Error State**: Shows error message if loading fails

**Test Cases**:
```javascript
// Test list order
const notifications = $('.notification-item')
expect(notifications[0]).toHaveText('Newer notification')
expect(notifications[1]).toHaveText('Older notification')

// Test empty state
expect($('#notification-empty')).toBeVisible()
expect($('#notification-empty')).toHaveText('No notifications')

// Test loading state
expect($('#notification-loading')).toBeVisible()
```

### 4. Notification Item Actions
**Requirement**: Each item shows actions: Seen / In Progress / Resolve

**Acceptance Criteria**:
- ✅ **Action Buttons**: Each item has Seen, In Progress, Resolve buttons
- ✅ **Button Styling**: Buttons use appropriate colors and sizes
- ✅ **Button States**: Buttons are enabled/disabled based on notification status
- ✅ **Action Feedback**: Buttons show loading state during action
- ✅ **Status Update**: Clicking button updates notification status

**Test Cases**:
```javascript
// Test action buttons
expect($('.mark-seen')).toBeVisible()
expect($('.mark-in-progress')).toBeVisible()
expect($('.mark-resolved')).toBeVisible()

// Test button states
expect($('.mark-seen')).not.toBeDisabled()
expect($('.mark-in-progress')).not.toBeDisabled()

// Test status update
$('.mark-seen').click()
expect($('.notification-item')).toHaveClass('status-seen')
```

### 5. Mark as Seen Functionality
**Requirement**: Clicking "Seen" updates badge immediately and persists status

**Acceptance Criteria**:
- ✅ **Optimistic UI**: Badge updates immediately without waiting for API
- ✅ **API Call**: Status update is sent to backend
- ✅ **Persistence**: Status is saved to database
- ✅ **Visual Feedback**: Item shows as seen visually
- ✅ **Badge Update**: Badge count decreases by 1

**Test Cases**:
```javascript
// Test optimistic UI
const initialCount = parseInt($('#notification-count').text())
$('.mark-seen').click()
expect($('#notification-count')).toHaveText((initialCount - 1).toString())

// Test API call
expect(fetch).toHaveBeenCalledWith('/admin/api/notifications/1', {
    method: 'PATCH',
    headers: expect.any(Object),
    body: JSON.stringify({ status: 'seen', acted_by: 1 })
})

// Test visual feedback
expect($('.notification-item')).toHaveClass('status-seen')
```

### 6. Multi-tenant Isolation
**Requirement**: Admin sees only their tenant's notifications

**Acceptance Criteria**:
- ✅ **Tenant Filtering**: Only tenant-specific notifications shown
- ✅ **Database Isolation**: Uses tenant-specific database
- ✅ **No Cross-tenant Data**: No access to other tenant's notifications
- ✅ **Tenant Context**: Tenant context properly maintained

**Test Cases**:
```javascript
// Test tenant filtering
expect(notifications).toHaveLength(3) // Only tenant's notifications
expect(notifications[0]).toHaveText('Tenant 1 notification')

// Test database isolation
expect(DB::connection()->getDatabaseName()).toBe('tenant_1_db')
```

## 🔒 Non-functional Requirements

### 1. Privacy and Security
**Requirement**: Tenant isolation proven

**Acceptance Criteria**:
- ✅ **Data Isolation**: Notifications stored in tenant-specific database
- ✅ **Access Control**: Admin can only access their tenant's data
- ✅ **Authentication**: All API endpoints require admin authentication
- ✅ **Authorization**: Proper permission checks for notification actions
- ✅ **CSRF Protection**: All state-changing requests protected

**Test Cases**:
```javascript
// Test data isolation
const tenant1Notifications = await getNotifications('tenant1')
const tenant2Notifications = await getNotifications('tenant2')
expect(tenant1Notifications).not.toEqual(tenant2Notifications)

// Test authentication
const response = await fetch('/admin/api/notifications', {
    headers: { 'Authorization': 'Bearer invalid_token' }
})
expect(response.status).toBe(401)

// Test CSRF protection
const response = await fetch('/admin/api/notifications/1', {
    method: 'PATCH',
    headers: { 'X-CSRF-TOKEN': 'invalid_token' }
})
expect(response.status).toBe(419)
```

### 2. Performance
**Requirement**: List endpoint paginated; indexes on (status, created_at)

**Acceptance Criteria**:
- ✅ **Pagination**: Notifications paginated (20 per page)
- ✅ **Database Indexes**: Proper indexes on status and created_at
- ✅ **Query Performance**: List query executes in < 100ms
- ✅ **Memory Usage**: No memory leaks in notification polling
- ✅ **Response Size**: API responses under 1MB

**Test Cases**:
```javascript
// Test pagination
const response = await fetch('/admin/api/notifications?page=1&limit=20')
const data = await response.json()
expect(data.data.notifications).toHaveLength(20)
expect(data.data.pagination.current_page).toBe(1)

// Test query performance
const start = performance.now()
await fetch('/admin/api/notifications')
const duration = performance.now() - start
expect(duration).toBeLessThan(100)

// Test memory usage
const initialMemory = performance.memory.usedJSHeapSize
// Perform notification operations
const finalMemory = performance.memory.usedJSHeapSize
expect(finalMemory - initialMemory).toBeLessThan(1000000) // 1MB
```

### 3. Security
**Requirement**: Endpoints protected by admin auth + tenant middleware

**Acceptance Criteria**:
- ✅ **Admin Authentication**: All endpoints require admin session
- ✅ **Tenant Middleware**: TenantDatabaseMiddleware applied to all endpoints
- ✅ **Input Validation**: All inputs validated and sanitized
- ✅ **SQL Injection**: No SQL injection vulnerabilities
- ✅ **XSS Protection**: Output properly encoded

**Test Cases**:
```javascript
// Test admin authentication
const response = await fetch('/admin/api/notifications', {
    headers: { 'Cookie': 'admin_session=invalid' }
})
expect(response.status).toBe(401)

// Test tenant middleware
expect(middleware).toContain('TenantDatabaseMiddleware')

// Test input validation
const response = await fetch('/admin/api/notifications', {
    method: 'POST',
    body: JSON.stringify({ status: 'invalid_status' })
})
expect(response.status).toBe(422)

// Test SQL injection
const response = await fetch('/admin/api/notifications?status=1; DROP TABLE ti_notifications;')
expect(response.status).toBe(400)
```

### 4. Resilience
**Requirement**: Safe if FE sends duplicates; no crashes on unknown payloads

**Acceptance Criteria**:
- ✅ **Duplicate Handling**: Duplicate notifications ignored gracefully
- ✅ **Unknown Payloads**: Unknown payloads handled without crashes
- ✅ **Error Recovery**: System recovers from temporary failures
- ✅ **Graceful Degradation**: System works even if some features fail
- ✅ **Logging**: All errors logged for debugging

**Test Cases**:
```javascript
// Test duplicate handling
await fetch('/api/v1/waiter-call', { method: 'POST', body: JSON.stringify(duplicateData) })
await fetch('/api/v1/waiter-call', { method: 'POST', body: JSON.stringify(duplicateData) })
expect(notifications).toHaveLength(1) // Only one notification created

// Test unknown payloads
const response = await fetch('/admin/api/notifications', {
    method: 'POST',
    body: JSON.stringify({ unknown_field: 'value' })
})
expect(response.status).toBe(422)

// Test error recovery
// Simulate database failure
// System should continue working with cached data
```

## 📊 Telemetry Requirements

### 1. Minimal Logging
**Requirement**: Minimal logs for create/update of notifications (info level, tenant + ids)

**Acceptance Criteria**:
- ✅ **Log Level**: Uses info level for notification operations
- ✅ **Log Content**: Includes tenant ID and notification ID
- ✅ **Log Format**: Structured logging format
- ✅ **Log Rotation**: Logs rotated to prevent disk space issues
- ✅ **Log Security**: No sensitive data in logs

**Test Cases**:
```javascript
// Test log level
expect(logLevel).toBe('info')

// Test log content
expect(logMessage).toContain('tenant_id: 1')
expect(logMessage).toContain('notification_id: 123')

// Test log format
expect(logMessage).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \[info\]/)

// Test log security
expect(logMessage).not.toContain('password')
expect(logMessage).not.toContain('token')
```

### 2. Performance Metrics
**Requirement**: Track notification performance metrics

**Acceptance Criteria**:
- ✅ **Response Time**: Track API response times
- ✅ **Database Queries**: Track database query performance
- ✅ **Memory Usage**: Track memory usage patterns
- ✅ **Error Rates**: Track error rates and types
- ✅ **User Actions**: Track user interaction patterns

**Test Cases**:
```javascript
// Test response time tracking
expect(metrics.responseTime).toBeLessThan(100)

// Test database query tracking
expect(metrics.databaseQueries).toBeLessThan(5)

// Test memory usage tracking
expect(metrics.memoryUsage).toBeLessThan(1000000)

// Test error rate tracking
expect(metrics.errorRate).toBeLessThan(0.01) // 1%
```

## 🧪 Testing Requirements

### 1. Unit Tests
**Requirement**: Unit tests for all notification functionality

**Test Coverage**:
- ✅ **Notification Model**: Test model methods and relationships
- ✅ **API Controllers**: Test all API endpoints
- ✅ **Helper Functions**: Test utility functions
- ✅ **Validation Rules**: Test input validation
- ✅ **Error Handling**: Test error scenarios

### 2. Integration Tests
**Requirement**: Integration tests for notification flow

**Test Coverage**:
- ✅ **End-to-end Flow**: Test complete notification flow
- ✅ **Database Integration**: Test database operations
- ✅ **API Integration**: Test API interactions
- ✅ **Multi-tenant**: Test tenant isolation
- ✅ **Authentication**: Test auth integration

### 3. E2E Tests
**Requirement**: End-to-end tests for user interactions

**Test Coverage**:
- ✅ **Admin Panel**: Test admin panel interactions
- ✅ **Frontend Events**: Test frontend event submission
- ✅ **Real-time Updates**: Test real-time notification updates
- ✅ **Cross-browser**: Test in multiple browsers
- ✅ **Mobile Responsive**: Test mobile responsiveness

## 📋 Success Metrics

### 1. Functional Metrics
- ✅ **Notification Delivery**: 99.9% of notifications delivered
- ✅ **Response Time**: < 200ms for notification list
- ✅ **Uptime**: 99.9% uptime for notification system
- ✅ **Error Rate**: < 0.1% error rate
- ✅ **User Satisfaction**: > 90% user satisfaction

### 2. Performance Metrics
- ✅ **Database Performance**: < 100ms for notification queries
- ✅ **Memory Usage**: < 100MB for notification system
- ✅ **CPU Usage**: < 10% CPU usage for notification polling
- ✅ **Network Usage**: < 1MB per minute for notification polling
- ✅ **Storage Usage**: < 1GB per month for notification data

### 3. Security Metrics
- ✅ **Security Incidents**: 0 security incidents
- ✅ **Data Breaches**: 0 data breaches
- ✅ **Unauthorized Access**: 0 unauthorized access attempts
- ✅ **Vulnerability Scans**: 0 critical vulnerabilities
- ✅ **Compliance**: 100% compliance with security standards

## 📚 Related Files

### Testing
- `tests/Feature/NotificationTest.php` - Feature tests
- `tests/Unit/NotificationModelTest.php` - Unit tests
- `tests/Browser/NotificationE2ETest.php` - E2E tests

### Configuration
- `config/logging.php` - Logging configuration
- `config/database.php` - Database configuration
- `config/queue.php` - Queue configuration

### Monitoring
- `app/Http/Middleware/LogNotificationActivity.php` - Logging middleware
- `app/Providers/NotificationServiceProvider.php` - Service provider
- `app/Console/Commands/NotificationCleanup.php` - Cleanup command

## 🧪 How to Test

### Setup Instructions
1. **Run Database Migrations**:
   ```bash
   php artisan migrate --path=app/admin/database/migrations
   ```

2. **Seed Sample Data** (Development only):
   ```bash
   php artisan migrate --path=app/admin/database/migrations/2024_01_15_000005_seed_sample_notifications.php
   ```

3. **Verify Tenant Database Setup**:
   - Ensure `TenantDatabaseMiddleware` is properly configured
   - Verify tenant databases exist and are accessible

### Manual Testing Steps

#### 1. Admin Panel Notification Bell
**URL**: `http://your-domain.com/admin`

**Steps**:
1. Login to admin panel
2. Look for notification bell in header (top-right area)
3. Click bell to open dropdown panel
4. Verify badge shows count of new notifications
5. Test "Mark All Seen" button
6. Test individual notification actions (Seen, In Progress, Resolve)

**Expected Results**:
- Bell appears with animated badge
- Dropdown opens/closes smoothly
- Badge count updates in real-time
- Actions work without page refresh

#### 2. Customer Waiter Call
**URL**: `http://your-domain.com/table/7`

**Steps**:
1. Navigate to table page
2. Click "Call Waiter" button
3. Enter optional message
4. Submit request
5. Check admin panel for new notification

**Expected Results**:
- Modal opens with form
- Success message appears
- Admin receives notification immediately
- Badge count increases

#### 3. Customer Valet Request
**URL**: `http://your-domain.com/table/7/valet`

**Steps**:
1. Navigate to valet page
2. Fill in customer details (name, car, license plate)
3. Submit request
4. Check admin panel for new notification

**Expected Results**:
- Form submits successfully
- Success confirmation appears
- Admin receives valet request notification
- Badge count increases

#### 4. Customer Table Notes
**URL**: `http://your-domain.com/table/7`

**Steps**:
1. Navigate to table page
2. Click "Leave Note" button
3. Enter note text
4. Submit note
5. Check admin panel for new notification

**Expected Results**:
- Modal opens with textarea
- Note submits successfully
- Admin receives table note notification
- Badge count increases

#### 5. Multi-tenant Isolation
**Steps**:
1. Switch between different tenant databases
2. Create notifications in each tenant
3. Verify notifications are isolated per tenant
4. Check admin panel shows only current tenant's notifications

**Expected Results**:
- Each tenant sees only their notifications
- No cross-tenant data leakage
- Proper database isolation maintained

### API Testing

#### Test Waiter Call Endpoint
```bash
curl -X POST http://your-domain.com/api/v1/waiter-call \
  -H "Content-Type: application/json" \
  -d '{"table_id": "7", "message": "Need assistance with menu"}'
```

#### Test Valet Request Endpoint
```bash
curl -X POST http://your-domain.com/api/v1/valet-request \
  -H "Content-Type: application/json" \
  -d '{"table_id": "7", "customer_name": "John Smith", "car_make": "Toyota Camry", "license_plate": "ABC123"}'
```

#### Test Table Notes Endpoint
```bash
curl -X POST http://your-domain.com/api/v1/table-notes \
  -H "Content-Type: application/json" \
  -d '{"table_id": "7", "note": "Please bring extra napkins", "timestamp": "2024-01-15T14:30:00Z"}'
```

#### Test Admin Notification Endpoints
```bash
# Get notifications
curl -X GET http://your-domain.com/admin/api/notifications

# Get notification count
curl -X GET http://your-domain.com/admin/api/notifications/count

# Update notification status
curl -X PATCH http://your-domain.com/admin/api/notifications/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "seen", "acted_by": 1}'

# Mark all as seen
curl -X PATCH http://your-domain.com/admin/api/notifications/mark-all-seen \
  -H "Content-Type: application/json" \
  -d '{"acted_by": 1}'
```

### Automated Testing

#### Run Feature Tests
```bash
php artisan test tests/Feature/NotificationTest.php
```

#### Run All Tests
```bash
php artisan test
```

### Performance Testing

#### Test Response Times
```bash
# Test notification list endpoint
time curl -X GET http://your-domain.com/admin/api/notifications

# Test notification count endpoint
time curl -X GET http://your-domain.com/admin/api/notifications/count
```

**Expected Results**:
- List endpoint: < 200ms
- Count endpoint: < 100ms
- Database queries: < 100ms

### Security Testing

#### Test Tenant Isolation
1. Create notifications in tenant A
2. Switch to tenant B
3. Verify tenant B cannot see tenant A's notifications
4. Verify database queries use correct tenant database

#### Test Rate Limiting
1. Submit 5 waiter calls from same table within 1 hour
2. Try to submit 6th call
3. Verify 6th call is rate limited

#### Test Input Validation
1. Submit invalid data to endpoints
2. Verify proper error responses
3. Check for SQL injection attempts
4. Verify XSS protection

### Troubleshooting

#### Common Issues
1. **Notifications not appearing**: Check tenant database configuration
2. **Badge not updating**: Check JavaScript console for errors
3. **API errors**: Check Laravel logs for detailed error messages
4. **Database errors**: Verify migrations ran successfully

#### Debug Commands
```bash
# Check database connection
php artisan tinker
>>> DB::connection()->getDatabaseName()

# Check notification counts
>>> \App\Helpers\NotificationHelper::getNotificationCounts(1)

# Check tenant context
>>> request()->attributes->get('tenant')
```

## 📋 Summary

**Functional Requirements**:
1. **Notification Bell**: Animated badge with count
2. **Dropdown Panel**: Toggleable panel with notifications
3. **Notification List**: Sorted list with item details
4. **Action Buttons**: Seen, In Progress, Resolve actions
5. **Mark as Seen**: Optimistic UI with persistence
6. **Multi-tenant**: Tenant isolation and filtering

**Non-functional Requirements**:
1. **Privacy**: Complete tenant data isolation
2. **Performance**: Paginated endpoints with proper indexes
3. **Security**: Admin auth and tenant middleware protection
4. **Resilience**: Duplicate handling and error recovery

**Telemetry Requirements**:
1. **Logging**: Minimal info-level logging with tenant context
2. **Metrics**: Performance and usage tracking

**Testing Requirements**:
1. **Unit Tests**: Model, controller, and helper tests
2. **Integration Tests**: End-to-end flow testing
3. **E2E Tests**: User interaction testing

**Success Metrics**:
1. **Functional**: 99.9% delivery, < 200ms response time
2. **Performance**: < 100ms queries, < 100MB memory
3. **Security**: 0 incidents, 100% compliance