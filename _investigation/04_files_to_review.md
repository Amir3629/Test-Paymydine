# 04_files_to_review.md
- app/admin/views/tables/edit.blade.php   (QR & URL builder)
- app/admin/models/Tables_model.php        (setters, created hook, QR generator)
- app/admin/models/config/tables_model.php (number-only field)
- app/admin/requests/Table.php             (validation rules)
- app/Http/Controllers/Api/TableController.php (resolvers)
- routes/api.php                           (endpoints)
- frontend/app/table/[table_id]/page.tsx   (dynamic route, data fetch)
- frontend/app/table/[table_id]/valet/page.tsx