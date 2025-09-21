<?php
/**
 * Test script for new table creation with table_no
 * This script tests the table creation flow to ensure table_no is properly set
 */

require_once __DIR__ . '/../../../bootstrap/app.php';

use Admin\Models\Tables_model;
use Illuminate\Support\Facades\DB;

echo "Testing new table creation with table_no...\n\n";

try {
    // Test 1: Create table with table_no provided
    echo "Test 1: Creating table with table_no = 11\n";
    $table1 = new Tables_model();
    $table1->table_no = 11;
    $table1->min_capacity = 2;
    $table1->max_capacity = 4;
    $table1->extra_capacity = 0;
    $table1->priority = 1;
    $table1->is_joinable = true;
    $table1->table_status = true;
    $table1->save();
    
    echo "✅ Table created with ID: {$table1->table_id}\n";
    echo "   table_no: {$table1->table_no}\n";
    echo "   table_name: {$table1->table_name}\n";
    echo "   qr_code: {$table1->qr_code}\n\n";
    
    // Test 2: Create table without table_no (should default to table_id)
    echo "Test 2: Creating table without table_no (should default to table_id)\n";
    $table2 = new Tables_model();
    $table2->min_capacity = 1;
    $table2->max_capacity = 2;
    $table2->extra_capacity = 0;
    $table2->priority = 2;
    $table2->is_joinable = true;
    $table2->table_status = true;
    $table2->save();
    
    echo "✅ Table created with ID: {$table2->table_id}\n";
    echo "   table_no: {$table2->table_no}\n";
    echo "   table_name: {$table2->table_name}\n";
    echo "   qr_code: {$table2->qr_code}\n\n";
    
    // Test 3: Verify API works with new table
    echo "Test 3: Testing API with new table (table_no = 11)\n";
    $apiUrl = "http://127.0.0.1:8000/api/v1/table-info?table_no=11";
    $response = file_get_contents($apiUrl);
    $data = json_decode($response, true);
    
    if ($data['success']) {
        echo "✅ API test passed\n";
        echo "   table_id: {$data['data']['table_id']}\n";
        echo "   table_no: {$data['data']['table_no']}\n";
        echo "   table_name: {$data['data']['table_name']}\n";
    } else {
        echo "❌ API test failed: {$data['error']}\n";
    }
    
    echo "\nTest completed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Test failed with error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
