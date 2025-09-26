#!/bin/bash

echo "=== Laravel Cache Clearing Script ==="
echo "Date: $(date)"
echo ""

echo "Clearing Laravel application caches..."

# Clear all Laravel caches
echo "1. Clearing application cache..."
php artisan cache:clear

echo "2. Clearing configuration cache..."
php artisan config:clear

echo "3. Clearing route cache..."
php artisan route:clear

echo "4. Clearing view cache..."
php artisan view:clear

echo "5. Clearing compiled services..."
php artisan clear-compiled

echo "6. Clearing optimized autoloader..."
composer dump-autoload -o

echo "7. Re-optimizing for production..."
php artisan optimize

echo "8. Clearing queue cache..."
php artisan queue:clear 2>/dev/null || echo "Queue clear skipped (no queue driver)"

echo "9. Clearing session cache..."
php artisan session:table 2>/dev/null || echo "Session table check skipped"

echo ""
echo "=== Cache Clearing Complete ==="
echo "All Laravel caches have been cleared and re-optimized."
echo ""
echo "Next steps:"
echo "1. Run 'scripts/healthcheck.sh' to verify fixes"
echo "2. Test admin functionality:"
echo "   - /admin/categories/create"
echo "   - /admin/tables/create" 
echo "   - /admin/notifications-api/count"
echo "3. Test frontend: /api/v1/menu"
echo ""
echo "If issues persist, check:"
echo "- Database migrations: php artisan migrate:status"
echo "- File permissions: chmod -R 755 storage bootstrap/cache"
echo "- Composer autoload: composer install --no-dev --optimize-autoloader"