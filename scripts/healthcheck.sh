#!/bin/bash

echo "=== Production Health Check for amir.paymydine.com ==="
echo "Date: $(date)"
echo ""

echo "=== 1. Database Migration Status ==="
php artisan migrate:status
echo ""

echo "=== 2. Schema Validation ==="
php artisan tinker --execute="
echo 'Categories table has frontend_visible: ' . (Schema::hasColumn('ti_categories', 'frontend_visible') ? 'YES' : 'NO');
echo 'Tables table has table_no: ' . (Schema::hasColumn('ti_tables', 'table_no') ? 'YES' : 'NO');
echo 'Notifications table exists: ' . (Schema::hasTable('ti_notifications') ? 'YES' : 'NO');
"
echo ""

echo "=== 3. Routes Check ==="
echo "Admin notification routes:"
php artisan route:list | grep notifications || echo "No notification routes found"
echo ""

echo "=== 4. API Health Check ==="
echo "Testing menu API endpoint:"
curl -I http://localhost/api/v1/menu 2>/dev/null | head -1 || echo "API endpoint not accessible"
echo ""

echo "=== 5. Admin Controllers Check ==="
echo "Checking NotificationsApiController:"
php artisan tinker --execute="
try {
    \$controller = new App\Admin\Controllers\NotificationsApiController();
    echo 'NotificationsApiController: OK';
} catch (Exception \$e) {
    echo 'NotificationsApiController: ERROR - ' . \$e->getMessage();
}
"
echo ""

echo "=== 6. Language Keys Check ==="
php artisan tinker --execute="
try {
    \$key = lang('admin::lang.categories.label_frontend_visible');
    echo 'Language key frontend_visible: ' . (\$key !== 'admin::lang.categories.label_frontend_visible' ? 'OK' : 'MISSING');
} catch (Exception \$e) {
    echo 'Language key frontend_visible: ERROR';
}
"
echo ""

echo "=== 7. Frontend Environment Check ==="
echo "Checking if .env.production exists:"
if [ -f "frontend/.env.production" ]; then
    echo "✅ .env.production exists"
    echo "API Base URL: $(grep NEXT_PUBLIC_API_BASE_URL frontend/.env.production || echo 'NOT SET')"
else
    echo "❌ .env.production missing"
fi
echo ""

echo "=== 8. Next.js Build Check ==="
if [ -d "frontend/.next" ]; then
    echo "✅ Next.js build exists"
else
    echo "❌ Next.js build missing - run 'npm run build' in frontend/"
fi
echo ""

echo "=== Health Check Complete ==="
echo "Run 'scripts/fix-caches.sh' if any issues found"