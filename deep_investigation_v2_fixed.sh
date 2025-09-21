#!/usr/bin/env bash
set -euo pipefail
: "${BACKEND_URL:?}" "${FRONTEND_URL:?}" "${DB_USER:?}" "${DB_PASS:?}" "${DB_NAME:?}"

OUT="investigation_artifacts_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUT"/{db,api,frontend,backend,admin,env,logs,code}

echo "=== collecting env bits ==="
( set +e
  echo "pwd: $(pwd)"                        >  "$OUT/env/context.txt"
  echo "node: $(node -v 2>/dev/null)"      >> "$OUT/env/context.txt"
  echo "npm:  $(npm -v 2>/dev/null)"       >> "$OUT/env/context.txt"
  echo "php:  $(php -v | head -1)"         >> "$OUT/env/context.txt"
  echo "mysql: $(mysql --version)"         >> "$OUT/env/context.txt"
  echo "curl: $(curl --version | head -1)" >> "$OUT/env/context.txt"
  echo -e "\nBACKEND_URL=$BACKEND_URL\nFRONTEND_URL=$FRONTEND_URL" >> "$OUT/env/context.txt"
  grep -E '^(APP_ENV|APP_DEBUG|APP_URL|DB_|QUEUE_CONNECTION|BROADCAST_DRIVER|CACHE_DRIVER|SESSION_DRIVER|SESSION_DOMAIN|SANCTUM_STATEFUL_DOMAINS)' .env 2>/dev/null \
    | sed 's/\(PASSWORD\|PASS\)=.*/\1=***REDACTED***/' > "$OUT/env/dotenv_excerpt.txt"
)

echo "=== DB: schemas, indexes, sample rows ==="
mysql -u "$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME; SHOW TABLES;" > "$OUT/db/tables.txt"

for T in ti_tables ti_orders ti_locationables ti_waiter_calls ti_waiter_requests; do
  mysql -u "$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME; SHOW CREATE TABLE ${T};" > "$OUT/db/CREATE_${T}.txt" || true
done

mysql -u "$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME; \
  SELECT table_id,table_no,table_name,qr_code,table_status,min_capacity,max_capacity,updated_at \
  FROM ti_tables ORDER BY table_no LIMIT 50;" > "$OUT/db/sample_ti_tables.tsv" || true

mysql -u "$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME; \
  SELECT o.order_id,o.order_type,o.table_id,o.status_id,o.created_at, t.table_no,t.table_name \
  FROM ti_orders o LEFT JOIN ti_tables t ON t.table_id = o.order_type \
  ORDER BY o.order_id DESC LIMIT 30;" > "$OUT/db/sample_ti_orders_join.tsv" || true

mysql -u "$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME; \
  SELECT * FROM ti_locationables WHERE locationable_type='tables' ORDER BY locationable_id DESC LIMIT 30;" \
  > "$OUT/db/sample_ti_locationables.tsv" || true

echo "=== DB: constraint probes (duplicate, negative, orphaned) ==="
mysql -u "$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME; \
  SELECT table_no, COUNT(*) c FROM ti_tables GROUP BY table_no HAVING c>1;" > "$OUT/db/dup_table_no.tsv" || true
mysql -u "$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME; \
  SELECT table_id,table_no FROM ti_tables WHERE table_no<0;" > "$OUT/db/negative_table_no.tsv" || true
mysql -u "$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME; \
  SELECT o.order_id,o.order_type FROM ti_orders o LEFT JOIN ti_tables t ON t.table_id=o.order_type WHERE t.table_id IS NULL LIMIT 50;" \
  > "$OUT/db/orphan_orders.tsv" || true

echo "=== backend: routes, controllers, middleware ==="
php artisan route:list > "$OUT/backend/route_list.txt" 2>/dev/null || true
grep -Rn "waiter" routes app --include="*.php" > "$OUT/backend/grep_waiter.txt" || true
grep -Rn "table-info" routes app --include="*.php" > "$OUT/backend/grep_table_info.txt" || true
grep -Rn "orders" routes app --include="*.php" > "$OUT/backend/grep_orders.txt" || true
grep -Rn "throttle:\|auth:\|auth:sanctum\|cors\|csrf" routes app --include="*.php" > "$OUT/backend/grep_security_mw.txt" || true

echo "=== backend logs (last 300 lines) ==="
( tail -n 300 storage/logs/laravel.log 2>/dev/null || true ) > "$OUT/logs/laravel_tail.log"
( ls -lah storage/logs || true ) > "$OUT/logs/laravel_logs_ls.txt"

echo "=== migrations & models sanity ==="
find . -name "migrations" -type d -exec grep -Rn "Schema::create\|Blueprint" {} \; > "$OUT/backend/grep_migrations.txt" 2>/dev/null || true
grep -Rn "class .*Table" app/Models app --include="*.php" > "$OUT/backend/grep_models_table.txt" || true

echo "=== API smoke tests ===" 
# NOTE: we test both happy & failing paths to capture exact responses
{
  echo "# GET /api/v1/menu"; curl -s "$BACKEND_URL/api/v1/menu" | head -1; echo
  echo "# GET /api/v1/table-info?table_id=56"; curl -s "$BACKEND_URL/api/v1/table-info?table_id=56"; echo
  echo "# GET /api/v1/table-info?table_no=1";  curl -s "$BACKEND_URL/api/v1/table-info?table_no=1"; echo
  echo "# GET /api/v1/table-info?qr=ms13nJySn"; curl -s "$BACKEND_URL/api/v1/table-info?qr=ms13nJySn"; echo
  echo "# POST /api/v1/waiter-call (table_id=56)"; curl -s -X POST "$BACKEND_URL/api/v1/waiter-call" -H "Content-Type: application/json" -d '{"table_id":"56","message":"Water please"}'; echo
  echo "# POST /api/v1/waiter-call (missing)";   curl -s -X POST "$BACKEND_URL/api/v1/waiter-call" -H "Content-Type: application/json" -d '{}'; echo
  echo "# POST /api/v1/orders (skeletal)";       curl -s -X POST "$BACKEND_URL/api/v1/orders" -H "Content-Type: application/json" -d '{"table_id":"56","items":[]}'; echo
} > "$OUT/api/probes.txt"

echo "=== Frontend: raw SSR and param plumbing ==="
curl -s "$FRONTEND_URL/menu?table_no=1&qr=ms13nJySn"  > "$OUT/frontend/menu_raw.html"  || true
curl -s "$FRONTEND_URL/table/1?qr=ms13nJySn&table=1" > "$OUT/frontend/table_raw.html" || true

echo "=== Frontend: code greps ==="
grep -Rn "getTableInfo\|callWaiter\|waiter\|table_no\|table_id\|qr" frontend --include="*.ts" --include="*.tsx" > "$OUT/code/frontend_greps.txt" || true
grep -Rn "getTableInfo" app/Http/Controllers/Api --include="*.php" > "$OUT/code/backend_greps_tableinfo.txt" || true

echo "=== Cache/queue/broadcast sanity ==="
php artisan config:cache    >/dev/null 2>&1 || true
php artisan route:cache     >/dev/null 2>&1 || true
php artisan queue:failed    > "$OUT/backend/queue_failed.txt" 2>/dev/null || true
php artisan queue:listen --once >/dev/null 2>&1 || true

echo "=== DONE. artifacts at: $OUT ==="