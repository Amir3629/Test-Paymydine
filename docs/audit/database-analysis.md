# Database Analysis: PayMyDine Multi-Tenant System

**Analysis Date**: January 2025  
**Database Engine**: MySQL 8.0 with InnoDB  
**Schema**: Multi-tenant with database-per-tenant isolation

## Database Architecture Overview

### Multi-Tenant Design
- **Isolation Strategy**: Database-per-tenant
- **Shared Tables**: `ti_tenants` (tenant registry)
- **Tenant Databases**: Separate database per restaurant
- **Connection Switching**: Dynamic via `TenantDatabaseMiddleware`

### Core Tables Analysis

## 1. Orders Management

### `ti_orders` Table
```sql
CREATE TABLE `ti_orders` (
  `order_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` int DEFAULT NULL,
  `first_name` varchar(128) NOT NULL,
  `last_name` varchar(128) NOT NULL,
  `email` varchar(96) NOT NULL,
  `telephone` varchar(128) NOT NULL,
  `location_id` int NOT NULL,
  `address_id` int DEFAULT NULL,
  `cart` text NOT NULL,
  `total_items` int NOT NULL,
  `comment` text,
  `payment` varchar(128) NOT NULL,
  `order_type` varchar(128) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `order_time` time NOT NULL,
  `order_date` date NOT NULL,
  `order_total` decimal(15,4) DEFAULT NULL,
  `status_id` int NOT NULL,
  `ip_address` varchar(40) NOT NULL,
  `user_agent` varchar(128) NOT NULL,
  `assignee_id` int DEFAULT NULL,
  `assignee_group_id` int unsigned DEFAULT NULL,
  `invoice_prefix` varchar(128) DEFAULT NULL,
  `invoice_date` datetime DEFAULT NULL,
  `hash` varchar(40) DEFAULT NULL,
  `processed` tinyint(1) DEFAULT NULL,
  `status_updated_at` datetime DEFAULT NULL,
  `assignee_updated_at` datetime DEFAULT NULL,
  `order_time_is_asap` tinyint(1) NOT NULL DEFAULT '0',
  `delivery_comment` text,
  `ms_order_type` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`order_id`),
  KEY `ti_orders_hash_index` (`hash`)
);
```

**Issues Found**:
- ❌ Missing foreign key constraints
- ❌ No indexes on frequently queried columns
- ❌ `cart` field stores serialized data (not normalized)
- ❌ No check constraints for data validation

### `ti_order_menus` Table
```sql
CREATE TABLE `ti_order_menus` (
  `order_menu_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `menu_id` bigint unsigned NOT NULL,
  `name` varchar(128) NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(15,4) NOT NULL,
  `subtotal` decimal(15,4) NOT NULL,
  `option_values` text,
  `comment` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`order_menu_id`)
);
```

**Issues Found**:
- ❌ Missing foreign key constraints
- ❌ No indexes on `order_id` and `menu_id`
- ❌ `option_values` field stores serialized data

### `ti_order_totals` Table
```sql
CREATE TABLE `ti_order_totals` (
  `order_total_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `code` varchar(128) NOT NULL,
  `title` varchar(128) NOT NULL,
  `value` decimal(15,4) NOT NULL,
  `priority` int NOT NULL,
  `is_summable` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`order_total_id`)
);
```

**Issues Found**:
- ❌ Missing foreign key constraints
- ❌ No indexes on `order_id` and `code`

## 2. Menu Management

### `ti_menus` Table
```sql
CREATE TABLE `ti_menus` (
  `menu_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `menu_name` varchar(128) NOT NULL,
  `menu_description` text NOT NULL,
  `menu_price` decimal(15,4) NOT NULL,
  `minimum_qty` int NOT NULL DEFAULT '0',
  `menu_status` tinyint(1) NOT NULL,
  `menu_priority` int NOT NULL DEFAULT '0',
  `order_restriction` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`menu_id`)
);
```

**Issues Found**:
- ❌ No indexes on `menu_status` and `menu_priority`
- ❌ No check constraints for price validation

### `ti_categories` Table
```sql
CREATE TABLE `ti_categories` (
  `category_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `description` text,
  `status` tinyint(1) NOT NULL,
  `priority` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`category_id`)
);
```

**Issues Found**:
- ❌ No indexes on `status` and `priority`

### `ti_menu_categories` Table (Junction)
```sql
CREATE TABLE `ti_menu_categories` (
  `menu_category_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `menu_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`menu_category_id`)
);
```

**Issues Found**:
- ❌ Missing foreign key constraints
- ❌ No unique constraint on (menu_id, category_id)

## 3. Table Management

### `ti_tables` Table
```sql
CREATE TABLE `ti_tables` (
  `table_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `table_name` varchar(128) NOT NULL,
  `min_capacity` int NOT NULL,
  `max_capacity` int NOT NULL,
  `table_status` tinyint(1) NOT NULL,
  `extra_capacity` int NOT NULL DEFAULT '0',
  `is_joinable` tinyint(1) NOT NULL DEFAULT '0',
  `priority` int NOT NULL DEFAULT '0',
  `qr_code` varchar(128) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`table_id`)
);
```

**Issues Found**:
- ❌ No indexes on `table_status` and `qr_code`
- ❌ No check constraints for capacity validation

### `ti_locationables` Table (Junction)
```sql
CREATE TABLE `ti_locationables` (
  `locationable_id` bigint unsigned NOT NULL,
  `locationable_type` varchar(128) NOT NULL,
  `location_id` bigint unsigned NOT NULL,
  `options` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`locationable_id`, `locationable_type`, `location_id`)
);
```

**Issues Found**:
- ❌ Missing foreign key constraints
- ❌ No indexes on `location_id` and `locationable_type`

## 4. Multi-Tenant Management

### `ti_tenants` Table
```sql
CREATE TABLE `ti_tenants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `domain` varchar(255) NOT NULL,
  `database` varchar(255) NOT NULL,
  `status` enum('active', 'inactive', 'suspended') DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `domain` (`domain`)
);
```

**Issues Found**:
- ✅ Well-designed for multi-tenancy
- ✅ Proper unique constraints
- ✅ Status enum validation

## 5. Notification System

### `ti_notifications` Table
```sql
CREATE TABLE `ti_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `table_id` varchar(50) DEFAULT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `payload` JSON,
  `status` enum('new', 'read', 'archived') DEFAULT 'new',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

**Issues Found**:
- ❌ No indexes on `type`, `status`, and `created_at`
- ❌ `table_id` should be foreign key to `ti_tables`

### `ti_waiter_calls` Table
```sql
CREATE TABLE `ti_waiter_calls` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `table_id` int unsigned NOT NULL,
  `message` text,
  `status` enum('pending', 'resolved') DEFAULT 'pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

**Issues Found**:
- ❌ Missing foreign key constraint to `ti_tables`
- ❌ No indexes on `table_id` and `status`

### `ti_valet_requests` Table
```sql
CREATE TABLE `ti_valet_requests` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `table_id` varchar(32) NOT NULL,
  `name` varchar(120) NOT NULL,
  `license_plate` varchar(60) NOT NULL,
  `car_make` varchar(60) DEFAULT NULL,
  `status` enum('pending', 'completed', 'cancelled') DEFAULT 'pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

**Issues Found**:
- ❌ `table_id` should be foreign key to `ti_tables`
- ❌ No indexes on `table_id` and `status`

### `ti_table_notes` Table
```sql
CREATE TABLE `ti_table_notes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `table_id` int unsigned NOT NULL,
  `note` text NOT NULL,
  `timestamp` timestamp NOT NULL,
  `status` enum('new', 'read', 'archived') DEFAULT 'new',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

**Issues Found**:
- ❌ Missing foreign key constraint to `ti_tables`
- ❌ No indexes on `table_id` and `status`

## 6. User Management

### `ti_users` Table
```sql
CREATE TABLE `ti_users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(32) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(32) NOT NULL,
  `last_name` varchar(32) NOT NULL,
  `email` varchar(96) NOT NULL,
  `telephone` varchar(128) DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `status` tinyint(1) NOT NULL,
  `date_activated` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `reset_code` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
);
```

**Issues Found**:
- ❌ Missing foreign key constraint to `ti_locations`
- ❌ No indexes on `status` and `last_login`

### `ti_staffs` Table
```sql
CREATE TABLE `ti_staffs` (
  `staff_id` int NOT NULL AUTO_INCREMENT,
  `staff_name` varchar(32) NOT NULL,
  `staff_email` varchar(96) NOT NULL,
  `staff_telephone` varchar(128) DEFAULT NULL,
  `staff_address_1` varchar(128) DEFAULT NULL,
  `staff_address_2` varchar(128) DEFAULT NULL,
  `staff_city` varchar(128) DEFAULT NULL,
  `staff_state` varchar(128) DEFAULT NULL,
  `staff_postcode` varchar(128) DEFAULT NULL,
  `staff_country_id` int DEFAULT NULL,
  `staff_status` tinyint(1) NOT NULL,
  `staff_group_id` int DEFAULT NULL,
  `staff_location_id` int DEFAULT NULL,
  `staff_language_id` int DEFAULT NULL,
  `staff_theme_id` int DEFAULT NULL,
  `staff_date_activated` datetime DEFAULT NULL,
  `staff_last_login` datetime DEFAULT NULL,
  `staff_reset_code` varchar(255) DEFAULT NULL,
  `staff_reset_time` datetime DEFAULT NULL,
  `staff_remember_token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`staff_id`),
  UNIQUE KEY `staff_email` (`staff_email`)
);
```

**Issues Found**:
- ❌ Missing foreign key constraints
- ❌ No indexes on `staff_status` and `staff_group_id`

## 7. Location Management

### `ti_locations` Table
```sql
CREATE TABLE `ti_locations` (
  `location_id` int NOT NULL AUTO_INCREMENT,
  `location_name` varchar(32) NOT NULL,
  `location_email` varchar(96) NOT NULL,
  `location_telephone` varchar(128) DEFAULT NULL,
  `location_address_1` varchar(128) DEFAULT NULL,
  `location_address_2` varchar(128) DEFAULT NULL,
  `location_city` varchar(128) DEFAULT NULL,
  `location_state` varchar(128) DEFAULT NULL,
  `location_postcode` varchar(128) DEFAULT NULL,
  `location_country_id` int DEFAULT NULL,
  `location_zone_id` int DEFAULT NULL,
  `location_lat` varchar(32) DEFAULT NULL,
  `location_lng` varchar(32) DEFAULT NULL,
  `location_status` tinyint(1) NOT NULL,
  `location_priority` int NOT NULL DEFAULT '0',
  `location_description` text,
  `location_permalink_slug` varchar(128) DEFAULT NULL,
  `location_image` varchar(255) DEFAULT NULL,
  `location_meta` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`location_id`)
);
```

**Issues Found**:
- ❌ No indexes on `location_status` and `location_priority`
- ❌ Missing foreign key constraints

## 8. Payment Management

### `ti_payments` Table
```sql
CREATE TABLE `ti_payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `code` varchar(128) NOT NULL,
  `class_name` varchar(128) NOT NULL,
  `description` text,
  `data` text,
  `status` tinyint(1) NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `priority` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `code` (`code`)
);
```

**Issues Found**:
- ❌ No indexes on `status` and `priority`

## Database Relationship Analysis

### Missing Foreign Key Constraints

1. **Orders Table**:
   - `customer_id` → `ti_customers.customer_id`
   - `location_id` → `ti_locations.location_id`
   - `status_id` → `ti_statuses.status_id`
   - `assignee_id` → `ti_staffs.staff_id`

2. **Order Menus Table**:
   - `order_id` → `ti_orders.order_id`
   - `menu_id` → `ti_menus.menu_id`

3. **Order Totals Table**:
   - `order_id` → `ti_orders.order_id`

4. **Menu Categories Table**:
   - `menu_id` → `ti_menus.menu_id`
   - `category_id` → `ti_categories.category_id`

5. **Tables Table**:
   - `location_id` → `ti_locations.location_id`

6. **Notifications Table**:
   - `table_id` → `ti_tables.table_id`

7. **Waiter Calls Table**:
   - `table_id` → `ti_tables.table_id`

8. **Valet Requests Table**:
   - `table_id` → `ti_tables.table_id`

9. **Table Notes Table**:
   - `table_id` → `ti_tables.table_id`

### Missing Indexes

1. **Performance Critical**:
   - `ti_orders`: `customer_id`, `location_id`, `status_id`, `order_date`, `created_at`
   - `ti_menus`: `menu_status`, `menu_priority`
   - `ti_tables`: `table_status`, `qr_code`
   - `ti_categories`: `status`, `priority`

2. **Query Optimization**:
   - `ti_order_menus`: `order_id`, `menu_id`
   - `ti_order_totals`: `order_id`, `code`
   - `ti_notifications`: `type`, `status`, `created_at`
   - `ti_waiter_calls`: `table_id`, `status`
   - `ti_valet_requests`: `table_id`, `status`
   - `ti_table_notes`: `table_id`, `status`

### Data Integrity Issues

1. **Serialized Data**:
   - `ti_orders.cart` - Should be normalized
   - `ti_order_menus.option_values` - Should be normalized

2. **Missing Check Constraints**:
   - Price validation (>= 0)
   - Quantity validation (> 0)
   - Status enum validation
   - Capacity validation (max >= min)

3. **Orphaned Records**:
   - Orders without valid customers
   - Order menus without valid orders
   - Tables without valid locations

## Performance Recommendations

### Immediate Fixes
1. Add all missing foreign key constraints
2. Add indexes on frequently queried columns
3. Add check constraints for data validation
4. Clean up orphaned records

### Medium-term Optimizations
1. Normalize serialized data fields
2. Add composite indexes for complex queries
3. Implement table partitioning for large tables
4. Add database triggers for audit trails

### Long-term Improvements
1. Implement read replicas for reporting
2. Add database sharding for scalability
3. Implement data archiving strategy
4. Add automated database maintenance

## Security Considerations

### Data Protection
1. **Encryption at Rest**: Implement for sensitive data
2. **Encryption in Transit**: Ensure SSL/TLS for all connections
3. **Access Control**: Implement database user roles
4. **Audit Logging**: Add comprehensive audit trails

### Multi-Tenant Security
1. **Database Isolation**: Verify tenant data separation
2. **Connection Security**: Secure tenant database switching
3. **Data Leakage Prevention**: Validate query isolation
4. **Tenant Access Control**: Implement tenant-level permissions

## Conclusion

The database schema shows a **well-structured foundation** but suffers from **critical data integrity issues** and **performance problems**. The multi-tenant design is sound, but the lack of foreign key constraints and proper indexing creates significant risks.

**Priority Actions**:
1. **Immediate**: Add foreign key constraints and basic indexes
2. **Short-term**: Implement data validation and cleanup
3. **Medium-term**: Optimize performance and normalize data
4. **Long-term**: Implement advanced security and scalability features

---

*For specific SQL fixes and DDL statements, see the accompanying `fixes.sql` document.*