<?php

use Admin\Controllers\QrRedirectController;
use Admin\Controllers\SuperAdminController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

App::before(function () {
    /*
     * Register Admin app routes
     *
     * The Admin app intercepts all URLs
     * prefixed with /admin.
     */
    Route::group([
        'middleware' => ['web'],
        'prefix' => config('system.adminUri', 'admin'),
    ], function () {
        // Register Assets Combiner routes
        Route::any(config('system.assetsCombinerUri', '_assets').'/{asset}', 'System\Classes\Controller@combineAssets');

        // Other pages
        Route::any('{slug}', 'System\Classes\Controller@runAdmin')
            ->where('slug', '(.*)?');
    });

    // Admin entry point
    Route::any(config('system.adminUri', 'admin'), 'System\Classes\Controller@runAdmin');
    Route::get('/redirect/qr', [QrRedirectController::class, 'handleRedirect'])
    ->middleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);
 
    
    Route::get('/new', [SuperAdminController::class, 'showNewPage'])
        ->name('superadmin.new')
        ->middleware('superadmin.auth') // Protect this route
        ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);
    
        Route::get('/index', [SuperAdminController::class, 'showIndex'])
        ->name('superadmin.index')
        ->middleware('superadmin.auth') // Protect this route
        ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);
    
        Route::get('/settings', [SuperAdminController::class, 'settings'])
        ->name('superadmin.settings')
        ->middleware('superadmin.auth') // Protect this route
        ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);
    

        Route::match(['get', 'post'], '/new/store', [SuperAdminController::class, 'store'])
        ->name('superadmin.store')
        ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);

        Route::match(['get', 'post'], '/tenants/update', [SuperAdminController::class, 'update'])
        ->name('tenants.update')
        ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);
    
        Route::get('/tenants/delete/{id}', [SuperAdminController::class, 'delete'])
        ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);

        Route::get('/superadmin/login', [SuperAdminController::class, 'login'])
        ->name('login.new')
        ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);
    
        
Route::post('/superadmin/sign', [SuperAdminController::class, 'sign'])
->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);

Route::get('/superadmin/signout', [SuperAdminController::class, 'signOut'])
    ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);

    Route::post('/superadmin/settings/update', [SuperAdminController::class, 'updateSettings'])->name('superadmin.update') 
    ->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);
    Route::post('/tenant/update-status', function (Request $request) {
        $id = $request->input('id');
        $status = $request->input('status') === 'activate' ? 'active' : 'disabled';
    
        $updated = DB::connection('mysql')->table('tenants')->where('id', $id)->update(['status' => $status]);
    
        if ($updated) {
            return response()->json(['success' => true]);
        } else {
            return response()->json(['success' => false, 'error' => 'Failed to update']);
        }
    })->withoutMiddleware([\Igniter\Flame\Foundation\Http\Middleware\TenantDatabaseMiddleware::class]);
});

// Frontend API Routes - These are loaded by TastyIgniter's routing system
Route::group([
    'prefix' => 'api/v1',
    'namespace' => 'Admin\Controllers\Api',
    'middleware' => ['api']
], function () {
    Route::get('restaurant/{locationId}', 'RestaurantController@getRestaurantInfo');
    Route::get('restaurant/{locationId}/menu', 'RestaurantController@getMenu');
    
    // Order endpoints
    Route::post('restaurant/{locationId}/order', 'OrderController@createOrder');
    Route::get('restaurant/{locationId}/order/{orderId}', 'OrderController@getOrderStatus');
    Route::post('restaurant/{locationId}/waiter', 'OrderController@requestWaiter');
});

// Custom API Routes for frontend (no tenant required)
Route::group([
    'prefix' => 'api/v1',
    'middleware' => ['web']
], function () {
    // Menu endpoints
    Route::get('/menu', function () {
        try {
            // Get menu items with categories (matching old API structure)
            $query = "
                SELECT 
                    m.menu_id as id,
                    m.menu_name as name,
                    m.menu_description as description,
                    CAST(m.menu_price AS DECIMAL(10,2)) as price,
                    COALESCE(c.name, 'Main') as category_name,
                    ma.name as image
                FROM ti_menus m
                LEFT JOIN ti_menu_categories mc ON m.menu_id = mc.menu_id
                LEFT JOIN ti_categories c ON mc.category_id = c.category_id
                LEFT JOIN ti_media_attachments ma ON ma.attachment_type = 'menus' 
                    AND ma.attachment_id = m.menu_id 
                    AND ma.tag = 'thumb'
                WHERE m.menu_status = 1
                ORDER BY c.priority ASC, m.menu_name ASC
            ";
            
            $items = DB::select($query);
            
            // Convert prices to float and fix image paths
            foreach ($items as &$item) {
                $item->price = (float)$item->price;
                if ($item->image) {
                    // If image exists, construct the full URL
                    $item->image = "/api/media/" . $item->image;
                } else {
                    // Use default image if none exists
                    $item->image = '/images/pasta.png';
                }
            }
            
            // Get all enabled categories
            $categoriesQuery = "
                SELECT category_id as id, name, priority 
                FROM ti_categories 
                WHERE status = 1 
                ORDER BY priority ASC, name ASC
            ";
            $categories = DB::select($categoriesQuery);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'items' => $items,
                    'categories' => $categories
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch menu',
                'message' => $e->getMessage()
            ], 500);
        }
    });

    // Categories endpoints
    Route::get('/categories', function () {
        try {
            $categories = DB::table('categories')
                ->where('status', 1)
                ->orderBy('priority', 'asc')
                ->get()
                ->map(function ($category) {
                    return [
                        'id' => $category->category_id,
                        'name' => $category->name,
                        'description' => $category->description ?? '',
                        'image' => $category->image ? asset('uploads/' . $category->image) : null
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch categories',
                'message' => $e->getMessage()
            ], 500);
        }
    });

    // Image serving endpoint
    Route::get('/images', function () {
        $filename = request()->get('file');
        if (empty($filename)) {
            abort(404);
        }
        
        // Extract hash directories from filename (e.g., 688a367fbc700218826107.jpg -> 688/a36/7fb)
        if (preg_match('/^(\w{3})(\w{3})(\w{3})/', $filename, $matches)) {
            $hash1 = $matches[1];
            $hash2 = $matches[2];
            $hash3 = $matches[3];
            $imagePath = storage_path("app/public/assets/media/attachments/public/{$hash1}/{$hash2}/{$hash3}/{$filename}");
        } else {
            // Fallback to direct path
            $imagePath = storage_path('app/public/assets/media/attachments/public/' . $filename);
        }
        
        if (file_exists($imagePath)) {
            $mimeType = mime_content_type($imagePath);
            return response()->file($imagePath, [
                'Content-Type' => $mimeType,
                'Cache-Control' => 'public, max-age=31536000'
            ]);
        } else {
            // Fallback to pasta.png
            $fallbackPath = public_path('images/pasta.png');
            if (file_exists($fallbackPath)) {
                return response()->file($fallbackPath, [
                    'Content-Type' => 'image/png',
                    'Cache-Control' => 'public, max-age=31536000'
                ]);
            } else {
                abort(404);
            }
        }
    });

    // Restaurant info endpoint
    Route::get('/restaurant', function () {
        try {
            $restaurant = DB::table('locations')->first();
            
            return response()->json([
                'id' => 1,
                'name' => $restaurant->location_name ?? 'PayMyDine',
                'description' => $restaurant->description ?? '',
                'address' => $restaurant->location_address_1 ?? '',
                'phone' => $restaurant->location_telephone ?? '',
                'email' => $restaurant->location_email ?? '',
                'settings' => [
                    'currency' => $restaurant->location_currency ?? 'USD',
                    'timezone' => $restaurant->location_timezone ?? 'UTC',
                    'delivery_enabled' => (bool)($restaurant->offer_delivery ?? false),
                    'pickup_enabled' => (bool)($restaurant->offer_collection ?? false),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch restaurant info',
                'message' => $e->getMessage()
            ], 500);
        }
    });

    // Settings endpoint
    Route::get('/settings', function () {
        try {
            $settings = DB::table('settings')->get()->keyBy('item');
            
            return response()->json([
                'site_name' => $settings['site_name']->value ?? 'PayMyDine',
                'site_logo' => $settings['site_name']->value ?? '',
                'default_currency' => $settings['default_currency']->value ?? 'USD',
                'default_language' => $settings['default_language']->value ?? 'en',
                'order_prefix' => $settings['invoice_prefix']->value ?? '#',
                'guest_order' => $settings['guest_order']->value ?? '1',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch settings',
                'message' => $e->getMessage()
            ], 500);
        }
    });



    // Order submission endpoint
    Route::post('/orders', function (Request $request) {
        try {
            // Validate request data to match frontend structure
            $request->validate([
                'customer_name' => 'required|string|max:255',
                'table_id' => 'required|string|max:50',
                'table_name' => 'required|string|max:100',
                'items' => 'required|array|min:1',
                'items.*.menu_id' => 'required|integer|exists:menus,menu_id',
                'items.*.name' => 'required|string|max:255',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
                'total_amount' => 'required|numeric|min:0',
                'payment_method' => 'required|in:cash,card,paypal'
            ]);

            DB::beginTransaction();

            // Get next order number
            $orderNumber = DB::table('orders')->max('order_id') + 1;

            // Build order comment with table information
            $comment = '';
            if ($request->has('table_id') && $request->table_id) {
                $comment .= "Table ID: " . $request->table_id . " | ";
            }
            if ($request->has('table_name') && $request->table_name) {
                $comment .= "Table: " . $request->table_name . " | ";
            }
            if ($request->has('special_instructions') && $request->special_instructions) {
                $comment .= "Special Instructions: " . $request->special_instructions;
            }
            $comment = trim($comment, ' |');

            // Create main order record
            $orderId = DB::table('orders')->insertGetId([
                'order_id' => $orderNumber,
                'first_name' => $request->customer_name,
                'last_name' => 'Customer', // Default last name
                'email' => $request->customer_email ?? 'customer@example.com', // Default email
                'telephone' => $request->customer_phone ?? '0000000000', // Default phone
                'location_id' => 1, // Default location
                'order_type' => 'dine_in',
                'order_total' => $request->total_amount,
                'order_date' => now()->format('Y-m-d'),
                'order_time' => now()->format('H:i:s'),
                'status_id' => 1,
                'assignee_id' => null,
                'comment' => $comment,
                'processed' => 0,
                'payment' => $request->payment_method,
                'total_items' => count($request->items),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent() ?? 'API Client',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Insert order items
            foreach ($request->items as $item) {
                $menuItem = DB::table('menus')
                    ->where('menu_id', $item['menu_id'])
                    ->where('menu_status', 1)
                    ->first();

                if (!$menuItem) {
                    throw new \Exception("Menu item with ID {$item['menu_id']} not found");
                }

                DB::table('order_menus')->insert([
                    'order_id' => $orderId,
                    'menu_id' => $item['menu_id'],
                    'name' => $item['name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['price'] * $item['quantity'],
                    'comment' => $item['special_instructions'] ?? ''
                ]);
            }

            // Store tip amount if provided
            if ($request->tip_amount && $request->tip_amount > 0) {
                DB::table('order_totals')->insert([
                    'order_id' => $orderId,
                    'code' => 'tip',
                    'title' => 'Tip',
                    'value' => $request->tip_amount,
                    'priority' => 0
                ]);
            }

            // Store payment method
            DB::table('order_totals')->insert([
                'order_id' => $orderId,
                'code' => 'payment_method',
                'title' => 'Payment Method',
                'value' => $request->payment_method,
                'priority' => 0
            ]);

            DB::commit();

            // Return success response matching the expected format
            return response()->json([
                'success' => true,
                'order_id' => $orderId,
                'message' => 'Order placed successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to create order',
                'message' => $e->getMessage()
            ], 500);
        }
    });

    // Order status endpoints
    Route::get('/order-status', function (Request $request) {
        $orderId = $request->get('order_id');
        
        if (!$orderId) {
            return response()->json([
                'error' => 'order_id is required'
            ], 400);
        }

        try {
            $order = DB::table('orders')
                ->leftJoin('statuses', 'orders.status_id', '=', 'statuses.status_id')
                ->where('orders.order_id', $orderId)
                ->select([
                    'orders.order_id',
                    'orders.status_id',
                    'statuses.status_name',
                    'orders.updated_at'
                ])
                ->first();

            if (!$order) {
                return response()->json([
                    'error' => 'Order not found'
                ], 404);
            }

            // Map status_id to customer-friendly status (matching frontend expectations)
            $statusMap = [
                1 => 'pending',
                2 => 'confirmed',
                3 => 'preparing',
                4 => 'ready',
                5 => 'delivered',
                6 => 'cancelled'
            ];

            // Map to frontend expected customer_status numbers (0=Kitchen, 1=Preparing, 2=On Way)
            $customerStatusMap = [
                1 => 0, // pending -> Kitchen
                2 => 0, // confirmed -> Kitchen
                3 => 1, // preparing -> Preparing
                4 => 2, // ready -> On Way
                5 => 2, // delivered -> On Way
                6 => 0  // cancelled -> Kitchen
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'order_id' => $order->order_id,
                    'status_id' => $order->status_id,
                    'status_name' => $statusMap[$order->status_id] ?? 'unknown',
                    'customer_status' => $customerStatusMap[$order->status_id] ?? 0,
                    'updated_at' => $order->updated_at
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get order status',
                'message' => $e->getMessage()
            ], 500);
        }
    });

    Route::post('/order-status', function (Request $request) {
        $request->validate([
            'order_id' => 'required|integer',
            'status' => 'required|string|in:pending,confirmed,preparing,ready,delivered,cancelled'
        ]);

        try {
            $statusMap = [
                'pending' => 1,
                'confirmed' => 2,
                'preparing' => 3,
                'ready' => 4,
                'delivered' => 5,
                'cancelled' => 6
            ];

            $statusId = $statusMap[$request->status];

            $updated = DB::table('orders')
                ->where('order_id', $request->order_id)
                ->update([
                    'status_id' => $statusId,
                    'updated_at' => now()
                ]);

            if ($updated) {
                return response()->json([
                    'success' => true,
                    'message' => 'Order status updated successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to update order status'
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to update order status',
                'message' => $e->getMessage()
            ], 500);
        }
    });

    // Table endpoints
    Route::get('/table-info', function (Request $request) {
        $tableId = $request->get('table_id');
        
        if (!$tableId) {
            return response()->json([
                'error' => 'table_id is required'
            ], 400);
        }

        try {
            $table = DB::table('tables')
                ->where('table_id', $tableId)
                ->first();

            if (!$table) {
                return response()->json([
                    'error' => 'Table not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'table_id' => $table->table_id,
                    'table_name' => $table->table_name,
                    'location_id' => $table->location_id,
                    'status' => $table->status ?? 'available'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get table info',
                'message' => $e->getMessage()
            ], 500);
        }
    });

    // Get current table info from URL parameters (for QR code system)
    Route::get('/current-table', function (Request $request) {
        try {
            // Get table info from URL parameters (set by QR redirect)
            $tableId = $request->get('table_id');
            $tableName = $request->get('table_name');
            
            if (!$tableId || !$tableName) {
                return response()->json([
                    'success' => false,
                    'error' => 'Table information not found in URL parameters'
                ], 400);
            }

            // Verify table exists in database
            $table = DB::table('tables')
                ->where('table_id', $tableId)
                ->first();

            if (!$table) {
                return response()->json([
                    'success' => false,
                    'error' => 'Table not found in database'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'table_id' => $tableId,
                    'table_name' => $tableName,
                    'location_id' => $table->location_id ?? 1,
                    'status' => $table->status ?? 'available'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get current table info',
                'message' => $e->getMessage()
            ], 500);
        }
    });

    // Waiter call endpoint
    Route::post('/waiter-call', function (Request $request) {
        $request->validate([
            'table_id' => 'required|string',
            'message' => 'required|string|max:500'
        ]);
        
        // For now, just return success since the table doesn't exist
        // In production, you would create this table or use an existing one
        return response()->json([
            'success' => true,
            'message' => 'Waiter called successfully',
            'call_id' => uniqid()
        ]);
    });
});


