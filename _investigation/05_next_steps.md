# 05_next_steps.md
Pick ONE:
A) Manual-PK approach:
   - In Tables_model::creating, assign $model->table_id = desired_number (from input), validate availability.
   - Add unique constraint on table_id (already PK). Add guard: if exists, 422 error 'Table number in use'.
   - Keep QR/URL code as-is.

B) Table-number URL approach (recommended):
   - Add int column ti_tables.table_no (unique per location).
   - Save user input to table_no. Keep name as 'Table {table_no}'.
   - Change edit.blade.php QR to use /table/{table_no}.
   - Update frontend to accept {param} as number → server fetch by table_no, fallback to id.

C) Leave as-is.