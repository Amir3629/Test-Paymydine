# Database Schema Review

**Schema analysis, missing constraints, and recommended improvements** for the PayMyDine database.

## 📊 Schema Analysis

### Table Count and Structure
- **Total Tables**: 80+ tables in tenant databases ↩︎ [db/paymydine.sql:1-2691]
- **Core Tables**: 8 main business tables
- **Supporting Tables**: 70+ system and configuration tables
- **Engine**: MySQL 8.0 with InnoDB ↩︎ [db/paymydine.sql:1-50]

## 🔍 Critical Issues

### 1. Missing Foreign Key Constraints
**Issue**: No foreign key constraints defined in schema ↩︎ [db/paymydine.sql:1814-1900]

**Impact**: Referential integrity not enforced, data corruption possible

**Recommended Fix**:
```sql
-- Add foreign key constraints
ALTER TABLE ti_orders 
ADD CONSTRAINT fk_orders_customer 
FOREIGN KEY (customer_id) REFERENCES ti_customers(customer_id);

ALTER TABLE ti_orders 
ADD CONSTRAINT fk_orders_location 
FOREIGN KEY (location_id) REFERENCES ti_locations(location_id);

ALTER TABLE ti_orders 
ADD CONSTRAINT fk_orders_status 
FOREIGN KEY (status_id) REFERENCES ti_statuses(status_id);

ALTER TABLE ti_order_menus 
ADD CONSTRAINT fk_order_menus_order 
FOREIGN KEY (order_id) REFERENCES ti_orders(order_id) ON DELETE CASCADE;

ALTER TABLE ti_order_menus 
ADD CONSTRAINT fk_order_menus_menu 
FOREIGN KEY (menu_id) REFERENCES ti_menus(menu_id);
```

### 2. Missing Indexes
**Issue**: Critical columns lack indexes for performance ↩︎ [db/paymydine.sql:1814-1900]

**Impact**: Slow queries, poor performance on large datasets

**Recommended Fix**:
```sql
-- Add performance indexes
CREATE INDEX idx_orders_status_id ON ti_orders(status_id);
CREATE INDEX idx_orders_created_at ON ti_orders(created_at);
CREATE INDEX idx_orders_customer_id ON ti_orders(customer_id);
CREATE INDEX idx_orders_location_id ON ti_orders(location_id);
CREATE INDEX idx_order_menus_order_id ON ti_order_menus(order_id);
CREATE INDEX idx_order_menus_menu_id ON ti_order_menus(menu_id);
CREATE INDEX idx_menus_status ON ti_menus(menu_status);
CREATE INDEX idx_tables_status ON ti_tables(table_status);
```

### 3. Inconsistent Data Types
**Issue**: Mixed data types for similar fields ↩︎ [db/paymydine.sql:1814-1900]

**Impact**: Data inconsistency, query errors

**Recommended Fix**:
```sql
-- Standardize data types
ALTER TABLE ti_orders MODIFY COLUMN customer_id bigint unsigned;
ALTER TABLE ti_orders MODIFY COLUMN location_id bigint unsigned;
ALTER TABLE ti_orders MODIFY COLUMN status_id bigint unsigned;
ALTER TABLE ti_orders MODIFY COLUMN assignee_id bigint unsigned;
```

## 📋 Table Analysis

### Core Business Tables

| Table | Primary Key | Foreign Keys | Indexes | Issues | Recommendation |
|-------|-------------|--------------|---------|--------|----------------|
| **ti_orders** | `order_id` | None | `hash` only | No FKs, missing indexes | Add FKs and indexes |
| **ti_order_menus** | `order_menu_id` | None | None | No FKs, no indexes | Add FKs and indexes |
| **ti_menus** | `menu_id` | None | None | No indexes | Add status index |
| **ti_tables** | `table_id` | None | None | No indexes | Add status index |
| **ti_customers** | `customer_id` | None | None | No indexes | Add email index |
| **ti_locations** | `location_id` | None | None | No indexes | Add name index |
| **ti_statuses** | `status_id` | None | None | No indexes | Add name index |
| **ti_tenants** | `id` | None | `unique_domain`, `unique_database` | Good indexes | No changes needed |

### Supporting Tables

| Table | Primary Key | Foreign Keys | Indexes | Issues | Recommendation |
|-------|-------------|--------------|---------|--------|----------------|
| **ti_order_totals** | `order_total_id` | None | None | No FKs | Add order_id FK |
| **ti_status_history** | `status_history_id` | None | None | No FKs | Add order_id FK |
| **ti_menu_categories** | `menu_category_id` | None | None | No FKs | Add FKs |
| **ti_locationables** | `locationable_id` | None | None | No FKs | Add FKs |

## 🔧 Recommended Schema Improvements

### 1. Add Missing Foreign Keys
```sql
-- Order relationships
ALTER TABLE ti_orders 
ADD CONSTRAINT fk_orders_customer 
FOREIGN KEY (customer_id) REFERENCES ti_customers(customer_id);

ALTER TABLE ti_orders 
ADD CONSTRAINT fk_orders_location 
FOREIGN KEY (location_id) REFERENCES ti_locations(location_id);

ALTER TABLE ti_orders 
ADD CONSTRAINT fk_orders_status 
FOREIGN KEY (status_id) REFERENCES ti_statuses(status_id);

-- Order menu relationships
ALTER TABLE ti_order_menus 
ADD CONSTRAINT fk_order_menus_order 
FOREIGN KEY (order_id) REFERENCES ti_orders(order_id) ON DELETE CASCADE;

ALTER TABLE ti_order_menus 
ADD CONSTRAINT fk_order_menus_menu 
FOREIGN KEY (menu_id) REFERENCES ti_menus(menu_id);

-- Order totals relationships
ALTER TABLE ti_order_totals 
ADD CONSTRAINT fk_order_totals_order 
FOREIGN KEY (order_id) REFERENCES ti_orders(order_id) ON DELETE CASCADE;

-- Status history relationships
ALTER TABLE ti_status_history 
ADD CONSTRAINT fk_status_history_order 
FOREIGN KEY (order_id) REFERENCES ti_orders(order_id) ON DELETE CASCADE;

-- Menu category relationships
ALTER TABLE ti_menu_categories 
ADD CONSTRAINT fk_menu_categories_menu 
FOREIGN KEY (menu_id) REFERENCES ti_menus(menu_id) ON DELETE CASCADE;

ALTER TABLE ti_menu_categories 
ADD CONSTRAINT fk_menu_categories_category 
FOREIGN KEY (category_id) REFERENCES ti_categories(category_id) ON DELETE CASCADE;
```

### 2. Add Performance Indexes
```sql
-- Order indexes
CREATE INDEX idx_orders_status_id ON ti_orders(status_id);
CREATE INDEX idx_orders_created_at ON ti_orders(created_at);
CREATE INDEX idx_orders_customer_id ON ti_orders(customer_id);
CREATE INDEX idx_orders_location_id ON ti_orders(location_id);
CREATE INDEX idx_orders_order_date ON ti_orders(order_date);
CREATE INDEX idx_orders_order_time ON ti_orders(order_time);

-- Order menu indexes
CREATE INDEX idx_order_menus_order_id ON ti_order_menus(order_id);
CREATE INDEX idx_order_menus_menu_id ON ti_order_menus(menu_id);

-- Menu indexes
CREATE INDEX idx_menus_status ON ti_menus(menu_status);
CREATE INDEX idx_menus_priority ON ti_menus(menu_priority);

-- Table indexes
CREATE INDEX idx_tables_status ON ti_tables(table_status);
CREATE INDEX idx_tables_qr_code ON ti_tables(qr_code);

-- Customer indexes
CREATE INDEX idx_customers_email ON ti_customers(email);
CREATE INDEX idx_customers_phone ON ti_customers(telephone);

-- Location indexes
CREATE INDEX idx_locations_name ON ti_locations(location_name);
```

### 3. Add Data Validation Constraints
```sql
-- Order validation
ALTER TABLE ti_orders 
ADD CONSTRAINT chk_orders_total_positive 
CHECK (order_total >= 0);

ALTER TABLE ti_orders 
ADD CONSTRAINT chk_orders_items_positive 
CHECK (total_items >= 0);

-- Order menu validation
ALTER TABLE ti_order_menus 
ADD CONSTRAINT chk_order_menus_quantity_positive 
CHECK (quantity > 0);

ALTER TABLE ti_order_menus 
ADD CONSTRAINT chk_order_menus_price_positive 
CHECK (price >= 0);

-- Menu validation
ALTER TABLE ti_menus 
ADD CONSTRAINT chk_menus_price_positive 
CHECK (menu_price >= 0);

ALTER TABLE ti_menus 
ADD CONSTRAINT chk_menus_min_qty_positive 
CHECK (minimum_qty >= 0);

-- Table validation
ALTER TABLE ti_tables 
ADD CONSTRAINT chk_tables_capacity_positive 
CHECK (min_capacity > 0 AND max_capacity >= min_capacity);
```

## 🚨 Data Integrity Issues

### 1. Orphaned Records
**Issue**: Orders can reference non-existent customers, locations, or statuses ↩︎ [db/paymydine.sql:1814-1900]

**Impact**: Data inconsistency, query errors

**Fix**: Add foreign key constraints and clean up orphaned data

### 2. Inconsistent Status Values
**Issue**: Status IDs referenced in orders may not exist in statuses table ↩︎ [db/paymydine.sql:1814-1900]

**Impact**: Broken status lookups, display errors

**Fix**: Add foreign key constraint and ensure status data exists

### 3. Missing Required Data
**Issue**: Some orders have NULL values for required fields ↩︎ [db/paymydine.sql:1814-1900]

**Impact**: Incomplete data, application errors

**Fix**: Add NOT NULL constraints and default values

## 📊 Performance Recommendations

### 1. Query Optimization
- **Add indexes** on frequently queried columns
- **Use composite indexes** for multi-column queries
- **Partition large tables** by date if needed

### 2. Data Archiving
- **Archive old orders** to separate tables
- **Archive status history** for completed orders
- **Archive old logs** and audit trails

### 3. Caching Strategy
- **Cache menu data** in application layer
- **Cache table status** for real-time updates
- **Cache customer data** for frequent lookups

## 🔍 Migration Strategy

### Phase 1: Add Indexes
1. Add performance indexes (non-blocking)
2. Monitor query performance
3. Verify index usage

### Phase 2: Add Constraints
1. Add check constraints (non-blocking)
2. Add unique constraints (non-blocking)
3. Add foreign key constraints (blocking)

### Phase 3: Data Cleanup
1. Clean up orphaned records
2. Fix data inconsistencies
3. Add missing required data

### Phase 4: Validation
1. Test all constraints
2. Verify data integrity
3. Performance testing

## 📚 Related Documentation

- **ERD**: [erd.md](erd.md) - Entity relationship diagram
- **Migrations**: [migrations.md](migrations.md) - Migration sources and data flow
- **Tenancy**: [../tenancy/README.md](../tenancy/README.md) - Multi-tenant database switching