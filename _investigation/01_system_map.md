# 01_system_map.md

## What builds the QR/URL in Admin
- File: app/admin/views/tables/edit.blade.php
- Check which variable is used for the path segment: typically $table_id from URL/DB, not the typed number.

## Where the typed number goes
- Field: table_name (now a number field). The model's setTableNameAttribute normalizes '2' -> 'Table 2'.
- After insert (created hook), if the name is numeric/empty, it is overwritten to 'Table {table_id}'.

## Why URL shows /table/46
- The URL path is built with the **DB primary key** (auto-increment).
- Every new row gets the next id; typing 2 does not change the PK.