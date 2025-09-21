-- PayMyDine Database Fixes and DDL Recommendations
-- Generated: January 2025
-- Purpose: Fix security vulnerabilities, add missing constraints, and optimize performance

-- ============================================================================
-- CRITICAL FIXES (Apply Immediately)
-- ============================================================================

-- 1. Add Foreign Key Constraints for Referential Integrity
-- ============================================================================

-- Orders table foreign keys
ALTER TABLE `ti_orders` 
ADD CONSTRAINT `fk_orders_customer` 
FOREIGN KEY (`customer_id`) REFERENCES `ti_customers`(`customer_id`) 
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `ti_orders` 
ADD CONSTRAINT `fk_orders_location` 
FOREIGN KEY (`location_id`) REFERENCES `ti_locations`(`location_id`) 
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ti_orders` 
ADD CONSTRAINT `fk_orders_status` 
FOREIGN KEY (`status_id`) REFERENCES `ti_statuses`(`status_id`) 
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ti_orders` 
ADD CONSTRAINT `fk_orders_assignee` 
FOREIGN KEY (`assignee_id`) REFERENCES `ti_staffs`(`staff_id`) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Order menus foreign keys
ALTER TABLE `ti_order_menus` 
ADD CONSTRAINT `fk_order_menus_order` 
FOREIGN KEY (`order_id`) REFERENCES `ti_orders`(`order_id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ti_order_menus` 
ADD CONSTRAINT `fk_order_menus_menu` 
FOREIGN KEY (`menu_id`) REFERENCES `ti_menus`(`menu_id`) 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Order totals foreign keys
ALTER TABLE `ti_order_totals` 
ADD CONSTRAINT `fk_order_totals_order` 
FOREIGN KEY (`order_id`) REFERENCES `ti_orders`(`order_id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Menu categories foreign keys
ALTER TABLE `ti_menu_categories` 
ADD CONSTRAINT `fk_menu_categories_menu` 
FOREIGN KEY (`menu_id`) REFERENCES `ti_menus`(`menu_id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ti_menu_categories` 
ADD CONSTRAINT `fk_menu_categories_category` 
FOREIGN KEY (`category_id`) REFERENCES `ti_categories`(`category_id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Menu options foreign keys
ALTER TABLE `ti_menu_item_options` 
ADD CONSTRAINT `fk_menu_item_options_menu` 
FOREIGN KEY (`menu_id`) REFERENCES `ti_menus`(`menu_id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ti_menu_item_options` 
ADD CONSTRAINT `fk_menu_item_options_option` 
FOREIGN KEY (`option_id`) REFERENCES `ti_menu_options`(`option_id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Menu option values foreign keys
ALTER TABLE `ti_menu_item_option_values` 
ADD CONSTRAINT `fk_menu_item_option_values_menu_option` 
FOREIGN KEY (`menu_option_id`) REFERENCES `ti_menu_item_options`(`menu_option_id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ti_menu_item_option_values` 
ADD CONSTRAINT `fk_menu_item_option_values_option_value` 
FOREIGN KEY (`option_value_id`) REFERENCES `ti_menu_option_values`(`option_value_id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Order menu options foreign keys
ALTER TABLE `ti_order_menu_options` 
ADD CONSTRAINT `fk_order_menu_options_order` 
FOREIGN KEY (`order_id`) REFERENCES `ti_orders`(`order_id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ti_order_menu_options` 
ADD CONSTRAINT `fk_order_menu_options_menu` 
FOREIGN KEY (`menu_id`) REFERENCES `ti_menus`(`menu_id`) 
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ti_order_menu_options` 
ADD CONSTRAINT `fk_order_menu_options_order_menu` 
FOREIGN KEY (`order_menu_id`) REFERENCES `ti_order_menus`(`order_menu_id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Tables foreign keys
ALTER TABLE `ti_tables` 
ADD CONSTRAINT `fk_tables_location` 
FOREIGN KEY (`location_id`) REFERENCES `ti_locations`(`location_id`) 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Notifications foreign keys
ALTER TABLE `ti_notifications` 
ADD CONSTRAINT `fk_notifications_table` 
FOREIGN KEY (`table_id`) REFERENCES `ti_tables`(`table_id`) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Waiter calls foreign keys
ALTER TABLE `ti_waiter_calls` 
ADD CONSTRAINT `fk_waiter_calls_table` 
FOREIGN KEY (`table_id`) REFERENCES `ti_tables`(`table_id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Valet requests foreign keys
ALTER TABLE `ti_valet_requests` 
ADD CONSTRAINT `fk_valet_requests_table` 
FOREIGN KEY (`table_id`) REFERENCES `ti_tables`(`table_id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Table notes foreign keys
ALTER TABLE `ti_table_notes` 
ADD CONSTRAINT `fk_table_notes_table` 
FOREIGN KEY (`table_id`) REFERENCES `ti_tables`(`table_id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- 2. Add Missing Indexes for Query Performance
-- ============================================================================

-- Orders table indexes
CREATE INDEX `idx_orders_customer_id` ON `ti_orders` (`customer_id`);
CREATE INDEX `idx_orders_location_id` ON `ti_orders` (`location_id`);
CREATE INDEX `idx_orders_status_id` ON `ti_orders` (`status_id`);
CREATE INDEX `idx_orders_order_date` ON `ti_orders` (`order_date`);
CREATE INDEX `idx_orders_created_at` ON `ti_orders` (`created_at`);
CREATE INDEX `idx_orders_order_type` ON `ti_orders` (`order_type`);
CREATE INDEX `idx_orders_assignee_id` ON `ti_orders` (`assignee_id`);

-- Composite indexes for common queries
CREATE INDEX `idx_orders_location_status` ON `ti_orders` (`location_id`, `status_id`);
CREATE INDEX `idx_orders_date_status` ON `ti_orders` (`order_date`, `status_id`);
CREATE INDEX `idx_orders_customer_date` ON `ti_orders` (`customer_id`, `order_date`);

-- Menus table indexes
CREATE INDEX `idx_menus_status` ON `ti_menus` (`menu_status`);
CREATE INDEX `idx_menus_priority` ON `ti_menus` (`menu_priority`);
CREATE INDEX `idx_menus_created_at` ON `ti_menus` (`created_at`);

-- Tables table indexes
CREATE INDEX `idx_tables_location_id` ON `ti_tables` (`location_id`);
CREATE INDEX `idx_tables_status` ON `ti_tables` (`table_status`);
CREATE INDEX `idx_tables_qr_code` ON `ti_tables` (`qr_code`);

-- Categories table indexes
CREATE INDEX `idx_categories_status` ON `ti_categories` (`status`);
CREATE INDEX `idx_categories_priority` ON `ti_categories` (`priority`);

-- Order menus table indexes
CREATE INDEX `idx_order_menus_order_id` ON `ti_order_menus` (`order_id`);
CREATE INDEX `idx_order_menus_menu_id` ON `ti_order_menus` (`menu_id`);

-- Order totals table indexes
CREATE INDEX `idx_order_totals_order_id` ON `ti_order_totals` (`order_id`);
CREATE INDEX `idx_order_totals_code` ON `ti_order_totals` (`code`);

-- Notifications table indexes
CREATE INDEX `idx_notifications_type` ON `ti_notifications` (`type`);
CREATE INDEX `idx_notifications_status` ON `ti_notifications` (`status`);
CREATE INDEX `idx_notifications_created_at` ON `ti_notifications` (`created_at`);
CREATE INDEX `idx_notifications_table_id` ON `ti_notifications` (`table_id`);

-- Waiter calls table indexes
CREATE INDEX `idx_waiter_calls_table_id` ON `ti_waiter_calls` (`table_id`);
CREATE INDEX `idx_waiter_calls_status` ON `ti_waiter_calls` (`status`);
CREATE INDEX `idx_waiter_calls_created_at` ON `ti_waiter_calls` (`created_at`);

-- Valet requests table indexes
CREATE INDEX `idx_valet_requests_table_id` ON `ti_valet_requests` (`table_id`);
CREATE INDEX `idx_valet_requests_status` ON `ti_valet_requests` (`status`);
CREATE INDEX `idx_valet_requests_created_at` ON `ti_valet_requests` (`created_at`);

-- Table notes table indexes
CREATE INDEX `idx_table_notes_table_id` ON `ti_table_notes` (`table_id`);
CREATE INDEX `idx_table_notes_status` ON `ti_table_notes` (`status`);
CREATE INDEX `idx_table_notes_created_at` ON `ti_table_notes` (`created_at`);

-- ============================================================================
-- DATA INTEGRITY IMPROVEMENTS
-- ============================================================================

-- 3. Add Check Constraints for Data Validation
-- ============================================================================

-- Orders table constraints
ALTER TABLE `ti_orders` 
ADD CONSTRAINT `chk_orders_total_items` 
CHECK (`total_items` >= 0);

ALTER TABLE `ti_orders` 
ADD CONSTRAINT `chk_orders_order_total` 
CHECK (`order_total` >= 0);

ALTER TABLE `ti_orders` 
ADD CONSTRAINT `chk_orders_order_time_is_asap` 
CHECK (`order_time_is_asap` IN (0, 1));

ALTER TABLE `ti_orders` 
ADD CONSTRAINT `chk_orders_processed` 
CHECK (`processed` IN (0, 1));

-- Menus table constraints
ALTER TABLE `ti_menus` 
ADD CONSTRAINT `chk_menus_price` 
CHECK (`menu_price` >= 0);

ALTER TABLE `ti_menus` 
ADD CONSTRAINT `chk_menus_minimum_qty` 
CHECK (`minimum_qty` >= 0);

ALTER TABLE `ti_menus` 
ADD CONSTRAINT `chk_menus_status` 
CHECK (`menu_status` IN (0, 1));

ALTER TABLE `ti_menus` 
ADD CONSTRAINT `chk_menus_priority` 
CHECK (`menu_priority` >= 0);

-- Tables table constraints
ALTER TABLE `ti_tables` 
ADD CONSTRAINT `chk_tables_min_capacity` 
CHECK (`min_capacity` > 0);

ALTER TABLE `ti_tables` 
ADD CONSTRAINT `chk_tables_max_capacity` 
CHECK (`max_capacity` >= `min_capacity`);

ALTER TABLE `ti_tables` 
ADD CONSTRAINT `chk_tables_status` 
CHECK (`table_status` IN (0, 1));

ALTER TABLE `ti_tables` 
ADD CONSTRAINT `chk_tables_is_joinable` 
CHECK (`is_joinable` IN (0, 1));

-- Categories table constraints
ALTER TABLE `ti_categories` 
ADD CONSTRAINT `chk_categories_status` 
CHECK (`status` IN (0, 1));

ALTER TABLE `ti_categories` 
ADD CONSTRAINT `chk_categories_priority` 
CHECK (`priority` >= 0);

-- Order menus table constraints
ALTER TABLE `ti_order_menus` 
ADD CONSTRAINT `chk_order_menus_quantity` 
CHECK (`quantity` > 0);

ALTER TABLE `ti_order_menus` 
ADD CONSTRAINT `chk_order_menus_price` 
CHECK (`price` >= 0);

ALTER TABLE `ti_order_menus` 
ADD CONSTRAINT `chk_order_menus_subtotal` 
CHECK (`subtotal` >= 0);

-- Order totals table constraints
ALTER TABLE `ti_order_totals` 
ADD CONSTRAINT `chk_order_totals_value` 
CHECK (`value` >= 0);

ALTER TABLE `ti_order_totals` 
ADD CONSTRAINT `chk_order_totals_priority` 
CHECK (`priority` >= 0);

ALTER TABLE `ti_order_totals` 
ADD CONSTRAINT `chk_order_totals_is_summable` 
CHECK (`is_summable` IN (0, 1));

-- ============================================================================
-- SECURITY IMPROVEMENTS
-- ============================================================================

-- 4. Add Audit Trail Tables
-- ============================================================================

-- Create audit trail table for orders
CREATE TABLE `ti_orders_audit` (
  `audit_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `action` varchar(50) NOT NULL,
  `old_values` JSON,
  `new_values` JSON,
  `user_id` int DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`),
  KEY `idx_orders_audit_order_id` (`order_id`),
  KEY `idx_orders_audit_action` (`action`),
  KEY `idx_orders_audit_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create audit trail table for menus
CREATE TABLE `ti_menus_audit` (
  `audit_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `menu_id` bigint unsigned NOT NULL,
  `action` varchar(50) NOT NULL,
  `old_values` JSON,
  `new_values` JSON,
  `user_id` int DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`),
  KEY `idx_menus_audit_menu_id` (`menu_id`),
  KEY `idx_menus_audit_action` (`action`),
  KEY `idx_menus_audit_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create audit trail table for tables
CREATE TABLE `ti_tables_audit` (
  `audit_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `table_id` bigint unsigned NOT NULL,
  `action` varchar(50) NOT NULL,
  `old_values` JSON,
  `new_values` JSON,
  `user_id` int DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`),
  KEY `idx_tables_audit_table_id` (`table_id`),
  KEY `idx_tables_audit_action` (`action`),
  KEY `idx_tables_audit_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- 5. Add Partitioning for Large Tables
-- ============================================================================

-- Partition orders table by date (if using MySQL 8.0+)
-- Note: This requires dropping and recreating the table
-- Uncomment if you have a large orders table

/*
ALTER TABLE `ti_orders` 
PARTITION BY RANGE (YEAR(`order_date`)) (
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p2025 VALUES LESS THAN (2026),
  PARTITION p2026 VALUES LESS THAN (2027),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
*/

-- ============================================================================
-- DATA CLEANUP
-- ============================================================================

-- 6. Clean Up Orphaned Records
-- ============================================================================

-- Remove orphaned order menus
DELETE om FROM `ti_order_menus` om
LEFT JOIN `ti_orders` o ON om.order_id = o.order_id
WHERE o.order_id IS NULL;

-- Remove orphaned order totals
DELETE ot FROM `ti_order_totals` ot
LEFT JOIN `ti_orders` o ON ot.order_id = o.order_id
WHERE o.order_id IS NULL;

-- Remove orphaned order menu options
DELETE omo FROM `ti_order_menu_options` omo
LEFT JOIN `ti_orders` o ON omo.order_id = o.order_id
WHERE o.order_id IS NULL;

-- Remove orphaned menu categories
DELETE mc FROM `ti_menu_categories` mc
LEFT JOIN `ti_menus` m ON mc.menu_id = m.menu_id
WHERE m.menu_id IS NULL;

-- Remove orphaned menu item options
DELETE mio FROM `ti_menu_item_options` mio
LEFT JOIN `ti_menus` m ON mio.menu_id = m.menu_id
WHERE m.menu_id IS NULL;

-- Remove orphaned menu item option values
DELETE miov FROM `ti_menu_item_option_values` miov
LEFT JOIN `ti_menu_item_options` mio ON miov.menu_option_id = mio.menu_option_id
WHERE mio.menu_option_id IS NULL;

-- ============================================================================
-- CONFIGURATION IMPROVEMENTS
-- ============================================================================

-- 7. Add System Configuration Table
-- ============================================================================

CREATE TABLE `ti_system_config` (
  `config_id` int unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(100) NOT NULL,
  `value` TEXT,
  `type` enum('string', 'integer', 'boolean', 'json') DEFAULT 'string',
  `description` TEXT,
  `is_public` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`config_id`),
  UNIQUE KEY `uk_system_config_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default configuration
INSERT INTO `ti_system_config` (`key`, `value`, `type`, `description`, `is_public`) VALUES
('api_rate_limit', '100', 'integer', 'API rate limit per minute', 0),
('order_timeout', '30', 'integer', 'Order timeout in minutes', 0),
('max_order_items', '50', 'integer', 'Maximum items per order', 0),
('enable_notifications', '1', 'boolean', 'Enable real-time notifications', 1),
('maintenance_mode', '0', 'boolean', 'Enable maintenance mode', 1),
('debug_mode', '0', 'boolean', 'Enable debug mode', 0);

-- ============================================================================
-- MONITORING AND LOGGING
-- ============================================================================

-- 8. Add Performance Monitoring Tables
-- ============================================================================

CREATE TABLE `ti_performance_logs` (
  `log_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `endpoint` varchar(255) NOT NULL,
  `method` varchar(10) NOT NULL,
  `response_time` int NOT NULL,
  `memory_usage` int NOT NULL,
  `query_count` int NOT NULL,
  `status_code` int NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_performance_logs_endpoint` (`endpoint`),
  KEY `idx_performance_logs_created_at` (`created_at`),
  KEY `idx_performance_logs_response_time` (`response_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- BACKUP AND RECOVERY
-- ============================================================================

-- 9. Add Backup Configuration
-- ============================================================================

CREATE TABLE `ti_backup_logs` (
  `backup_id` int unsigned NOT NULL AUTO_INCREMENT,
  `backup_type` enum('full', 'incremental', 'differential') NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint NOT NULL,
  `status` enum('success', 'failed', 'in_progress') NOT NULL,
  `error_message` TEXT,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`backup_id`),
  KEY `idx_backup_logs_type` (`backup_type`),
  KEY `idx_backup_logs_status` (`status`),
  KEY `idx_backup_logs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- FINAL RECOMMENDATIONS
-- ============================================================================

-- 10. Update Table Statistics
-- ============================================================================

-- Update table statistics for better query optimization
ANALYZE TABLE `ti_orders`;
ANALYZE TABLE `ti_menus`;
ANALYZE TABLE `ti_tables`;
ANALYZE TABLE `ti_categories`;
ANALYZE TABLE `ti_order_menus`;
ANALYZE TABLE `ti_order_totals`;
ANALYZE TABLE `ti_notifications`;

-- ============================================================================
-- IMPLEMENTATION NOTES
-- ============================================================================

/*
IMPLEMENTATION PRIORITY:

1. CRITICAL (Apply Immediately):
   - Foreign key constraints
   - Missing indexes
   - Data cleanup

2. HIGH (Apply within 1 week):
   - Check constraints
   - Audit trail tables
   - System configuration

3. MEDIUM (Apply within 1 month):
   - Performance monitoring
   - Backup configuration
   - Table partitioning (if needed)

4. LOW (Apply within 3 months):
   - Additional monitoring
   - Advanced optimizations

TESTING REQUIREMENTS:
- Test all foreign key constraints
- Verify index performance
- Test audit trail functionality
- Validate data integrity

ROLLBACK PLAN:
- Keep original table structure
- Test in staging environment first
- Have rollback scripts ready
- Monitor performance after changes
*/