# Notification Data Model and Storage

**Database schema design** for the Admin Header Notifications feature. This document defines the notification storage structure, multi-tenant considerations, and database migration requirements.

## 📋 Current Notification Storage

### No Existing Notification System
**Status**: **Unknown** - No dedicated notification tables found in database schema

**Current notification implementation**:
- Uses `ti_tenants` table for tenant expiration warnings ↩︎ [app/admin/views/index.blade.php:177-186]
- **Critical issue**: Uses main database connection instead of tenant database ↩︎ [app/admin/views/index.blade.php:180-183]
- No proper notification management or status tracking

### Existing Related Tables
**Tables that could store notification data**:
- **ti_orders**: Order-related notifications ↩︎ [db/paymydine.sql:1814-1900]
- **ti_tables**: Table-related notifications ↩︎ [db/paymydine.sql:2461-2530]
- **ti_status_history**: Status change tracking ↩︎ [app/admin/models/Status_history_model.php:1-76]

## 🗄️ Proposed Notification Schema

### Primary Notification Table
**Table name**: `ti_notifications`

**Schema design**:
```sql
CREATE TABLE `ti_notifications` (
  `notification_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `table_id` bigint unsigned DEFAULT NULL,
  `table_name` varchar(128) DEFAULT NULL,
  `payload` json DEFAULT NULL,
  `status` enum('new', 'seen', 'in_progress', 'resolved') NOT NULL DEFAULT 'new',
  `priority` enum('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `seen_at` timestamp NULL DEFAULT NULL,
  `acted_by` int unsigned DEFAULT NULL,
  `acted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `idx_tenant_status` (`tenant_id`, `status`),
  KEY `idx_tenant_created` (`tenant_id`, `created_at`),
  KEY `idx_type_status` (`type`, `status`),
  KEY `idx_table_id` (`table_id`),
  KEY `idx_acted_by` (`acted_by`),
  CONSTRAINT `fk_notifications_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `ti_tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notifications_table` FOREIGN KEY (`table_id`) REFERENCES `ti_tables` (`table_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notifications_acted_by` FOREIGN KEY (`acted_by`) REFERENCES `ti_staffs` (`staff_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Notification Recipients Table (Optional)
**Table name**: `ti_notification_recipients`

**Schema design**:
```sql
CREATE TABLE `ti_notification_recipients` (
  `recipient_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `notification_id` bigint unsigned NOT NULL,
  `staff_id` int unsigned NOT NULL,
  `role` varchar(50) NOT NULL,
  `status` enum('unread', 'read', 'dismissed') NOT NULL DEFAULT 'unread',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`recipient_id`),
  UNIQUE KEY `unique_notification_staff` (`notification_id`, `staff_id`),
  KEY `idx_staff_status` (`staff_id`, `status`),
  KEY `idx_notification_id` (`notification_id`),
  CONSTRAINT `fk_recipients_notification` FOREIGN KEY (`notification_id`) REFERENCES `ti_notifications` (`notification_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recipients_staff` FOREIGN KEY (`staff_id`) REFERENCES `ti_staffs` (`staff_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 🔧 Database Migration

### Migration File Structure
**Location**: `database/migrations/YYYY_MM_DD_HHMMSS_create_notifications_table.php`

**Migration content**:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNotificationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ti_notifications', function (Blueprint $table) {
            $table->id('notification_id');
            $table->unsignedBigInteger('tenant_id');
            $table->string('type', 50);
            $table->string('title', 255);
            $table->text('message');
            $table->unsignedBigInteger('table_id')->nullable();
            $table->string('table_name', 128)->nullable();
            $table->json('payload')->nullable();
            $table->enum('status', ['new', 'seen', 'in_progress', 'resolved'])->default('new');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->timestamp('seen_at')->nullable();
            $table->unsignedBigInteger('acted_by')->nullable();
            $table->timestamp('acted_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'created_at']);
            $table->index(['type', 'status']);
            $table->index('table_id');
            $table->index('acted_by');
            
            // Foreign keys
            $table->foreign('tenant_id')->references('id')->on('ti_tenants')->onDelete('cascade');
            $table->foreign('table_id')->references('table_id')->on('ti_tables')->onDelete('set null');
            $table->foreign('acted_by')->references('staff_id')->on('ti_staffs')->onDelete('set null');
        });
        
        Schema::create('ti_notification_recipients', function (Blueprint $table) {
            $table->id('recipient_id');
            $table->unsignedBigInteger('notification_id');
            $table->unsignedBigInteger('staff_id');
            $table->string('role', 50);
            $table->enum('status', ['unread', 'read', 'dismissed'])->default('unread');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->unique(['notification_id', 'staff_id']);
            $table->index(['staff_id', 'status']);
            $table->index('notification_id');
            
            // Foreign keys
            $table->foreign('notification_id')->references('notification_id')->on('ti_notifications')->onDelete('cascade');
            $table->foreign('staff_id')->references('staff_id')->on('ti_staffs')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('ti_notification_recipients');
        Schema::dropIfExists('ti_notifications');
    }
}
```

## 🏢 Multi-tenant Database Considerations

### Tenant Database Isolation
**Current tenant switching**: `app/Http/Middleware/TenantDatabaseMiddleware.php` ↩︎ [app/Http/Middleware/TenantDatabaseMiddleware.php:1-48]

**Database switching logic**:
```php
if ($tenantInfo) {
    // Switch to tenant database
    Config::set('database.connections.mysql.database', $tenantInfo->database);
    
    // Reconnect with new database
    DB::purge('mysql');
    DB::reconnect('mysql');
    
    // Store tenant info in request for later use
    $request->attributes->set('tenant', $tenantInfo);
}
```
↩︎ [app/Http/Middleware/TenantDatabaseMiddleware.php:24-33]

### Notification Storage Strategy
**Option 1: Tenant-specific tables (Recommended)**
- Store notifications in each tenant's database
- Complete data isolation
- No cross-tenant data leakage
- Requires tenant database switching

**Option 2: Shared table with tenant_id**
- Store all notifications in main database
- Use `tenant_id` for isolation
- Risk of cross-tenant data access
- Easier to implement

**Recommended approach**: **Option 1** - Tenant-specific tables

### Tenant Database Schema
**Each tenant database will contain**:
- `ti_notifications` - Notification records
- `ti_notification_recipients` - Recipient tracking (optional)
- `ti_tables` - Table information for notifications
- `ti_staffs` - Staff information for acted_by field

## 📊 Notification Types and Payloads

### Notification Types
**Enum values for `type` field**:
- `waiter_call` - Customer calls for waiter assistance
- `valet_request` - Customer requests valet service
- `table_note` - Customer leaves note for table
- `order_ready` - Order is ready for pickup/delivery
- `payment_issue` - Payment processing problem
- `system_alert` - System-generated alerts

### Payload Examples
**Waiter Call Payload**:
```json
{
    "customer_name": "John Doe",
    "customer_phone": "+1234567890",
    "message": "Need assistance with the menu",
    "urgency": "medium",
    "source": "table_qr"
}
```

**Valet Request Payload**:
```json
{
    "customer_name": "Jane Smith",
    "car_make": "Toyota",
    "car_model": "Camry",
    "license_plate": "ABC123",
    "estimated_duration": "2 hours",
    "special_instructions": "Please park near the entrance"
}
```

**Table Note Payload**:
```json
{
    "customer_name": "Mike Johnson",
    "note": "Please bring extra napkins",
    "timestamp": "2024-01-15T14:30:00Z",
    "source": "table_qr"
}
```

## 🔍 Database Indexes and Performance

### Critical Indexes
**Primary indexes for performance**:
```sql
-- Tenant and status filtering (most common query)
KEY `idx_tenant_status` (`tenant_id`, `status`)

-- Tenant and creation time (for pagination)
KEY `idx_tenant_created` (`tenant_id`, `created_at`)

-- Type and status filtering
KEY `idx_type_status` (`type`, `status`)

-- Table-based filtering
KEY `idx_table_id` (`table_id`)

-- Staff action tracking
KEY `idx_acted_by` (`acted_by`)
```

### Query Performance Considerations
**Common queries**:
1. **Get new notifications for tenant**: `WHERE tenant_id = ? AND status = 'new'`
2. **Get notifications by type**: `WHERE tenant_id = ? AND type = ? AND status = 'new'`
3. **Get notifications for table**: `WHERE tenant_id = ? AND table_id = ?`
4. **Get notifications by staff**: `WHERE tenant_id = ? AND acted_by = ?`

**Index usage**:
- `idx_tenant_status` for queries 1 and 2
- `idx_table_id` for query 3
- `idx_acted_by` for query 4

## 🔒 Data Integrity and Constraints

### Foreign Key Constraints
**ti_notifications table**:
```sql
-- Tenant reference
CONSTRAINT `fk_notifications_tenant` 
FOREIGN KEY (`tenant_id`) REFERENCES `ti_tenants` (`id`) ON DELETE CASCADE

-- Table reference
CONSTRAINT `fk_notifications_table` 
FOREIGN KEY (`table_id`) REFERENCES `ti_tables` (`table_id`) ON DELETE SET NULL

-- Staff reference
CONSTRAINT `fk_notifications_acted_by` 
FOREIGN KEY (`acted_by`) REFERENCES `ti_staffs` (`staff_id`) ON DELETE SET NULL
```

**ti_notification_recipients table**:
```sql
-- Notification reference
CONSTRAINT `fk_recipients_notification` 
FOREIGN KEY (`notification_id`) REFERENCES `ti_notifications` (`notification_id`) ON DELETE CASCADE

-- Staff reference
CONSTRAINT `fk_recipients_staff` 
FOREIGN KEY (`staff_id`) REFERENCES `ti_staffs` (`staff_id`) ON DELETE CASCADE
```

### Data Validation Rules
**Notification validation**:
- `type` must be one of defined enum values
- `status` must be one of defined enum values
- `priority` must be one of defined enum values
- `title` cannot be empty
- `message` cannot be empty
- `table_id` must reference existing table (if provided)
- `acted_by` must reference existing staff (if provided)

## 🚨 Migration Considerations

### Rollback Strategy
**Migration rollback**:
```php
public function down()
{
    Schema::dropIfExists('ti_notification_recipients');
    Schema::dropIfExists('ti_notifications');
}
```

**Data backup before migration**:
- Export existing notification data (if any)
- Backup tenant databases
- Test migration on staging environment

### Multi-tenant Migration
**Migration execution**:
1. **Main database**: Create migration files
2. **Tenant databases**: Run migration on each tenant database
3. **Verification**: Ensure all tenant databases have notification tables
4. **Testing**: Verify notification creation and retrieval

**Migration script for all tenants**:
```php
// Get all active tenants
$tenants = DB::connection('mysql')->table('ti_tenants')
    ->where('status', 'active')
    ->get();

foreach ($tenants as $tenant) {
    // Switch to tenant database
    Config::set('database.connections.mysql.database', $tenant->database);
    DB::purge('mysql');
    DB::reconnect('mysql');
    
    // Run notification migration
    Artisan::call('migrate', ['--path' => 'database/migrations/create_notifications_table.php']);
}
```

## 📚 Related Files

### Database Schema
- `db/paymydine.sql` - Current database schema ↩︎ [db/paymydine.sql:1-2691]
- `db/paymydine.sql:2461-2530` - Tables table schema ↩︎ [db/paymydine.sql:2461-2530]
- `db/paymydine.sql:2494-2530` - Tenants table schema ↩︎ [db/paymydine.sql:2494-2530]

### Models
- `app/admin/models/Tables_model.php` - Table model ↩︎ [app/admin/models/Tables_model.php:1-80]
- `app/admin/models/Status_history_model.php` - Status tracking model ↩︎ [app/admin/models/Status_history_model.php:1-76]

### Middleware
- `app/Http/Middleware/TenantDatabaseMiddleware.php` - Tenant database switching ↩︎ [app/Http/Middleware/TenantDatabaseMiddleware.php:1-48]

## 📋 Summary

**Current status**:
- **No notification tables**: No dedicated notification storage exists
- **Wrong database usage**: Current implementation uses main database instead of tenant database
- **No data model**: No notification model or relationships defined

**Proposed solution**:
1. **Create notification tables**: `ti_notifications` and `ti_notification_recipients`
2. **Multi-tenant storage**: Store notifications in tenant-specific databases
3. **Proper relationships**: Foreign keys to tenants, tables, and staff
4. **Performance indexes**: Optimized for common query patterns
5. **Data integrity**: Proper constraints and validation rules

**Implementation requirements**:
1. **Database migration**: Create notification tables in all tenant databases
2. **Model creation**: Create notification models with relationships
3. **Tenant isolation**: Ensure all operations use tenant-specific database
4. **Data validation**: Implement proper validation rules
5. **Performance optimization**: Add appropriate indexes for query performance