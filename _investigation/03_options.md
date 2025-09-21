# 03_options.md
### A) Force PK to equal typed number
- At create time, set $model->table_id = desired_number; insert explicit PK.
- Guard collisions; forbid duplicates; adjust auto_increment if needed.
- Minimal UI changes; moderate DB risk.

### B) Keep PK auto-increment; switch URLs to table number
- Parse number from table_name (or add table_no int column).
- Change app/admin/views/tables/edit.blade.php to build URL with the number.
- Update frontend route (or accept both) so [id] resolver can treat numeric as number -> lookup id.
- Safest DB; small code changes in admin blade + frontend fetch.

### C) Keep current design
- Do nothing; URL remains /table/{pk}.