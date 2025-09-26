-- Production Hotfixes for amir.paymydine.com
-- Run these commands to fix database schema issues

-- 1. Add missing table_no column to ti_tables
-- This column is referenced by the model but missing from database
ALTER TABLE ti_tables 
ADD COLUMN table_no INT UNSIGNED NULL AFTER table_id,
ADD UNIQUE INDEX idx_tables_table_no (table_no);

-- 2. Verify frontend_visible column exists in ti_categories
-- This should already exist if migration was run
-- Uncomment if needed:
-- ALTER TABLE ti_categories ADD COLUMN frontend_visible TINYINT(1) DEFAULT 1 AFTER status;

-- 3. Verify notifications table structure
-- Check if table has correct columns
DESCRIBE ti_notifications;

-- 4. Add sample data for testing (optional)
-- INSERT INTO ti_tables (table_no, table_name, min_capacity, max_capacity, table_status) 
-- VALUES (1, 'Table 1', 2, 4, 1) 
-- ON DUPLICATE KEY UPDATE table_no = VALUES(table_no);

-- 5. Verify constraints
SHOW INDEX FROM ti_tables WHERE Key_name = 'idx_tables_table_no';
SHOW INDEX FROM ti_categories WHERE Column_name = 'frontend_visible';

-- 6. Check for any duplicate table_no values (should be none after unique constraint)
SELECT table_no, COUNT(*) as count 
FROM ti_tables 
WHERE table_no IS NOT NULL 
GROUP BY table_no 
HAVING count > 1;

-- Success message
SELECT 'Database hotfixes applied successfully' as status;