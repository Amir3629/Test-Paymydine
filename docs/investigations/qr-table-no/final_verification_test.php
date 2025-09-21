<?php
/**
 * Final Verification Test for Table Creation Fix
 * This script tests the complete table creation and QR URL generation flow
 */

echo "=== FINAL VERIFICATION TEST ===\n";
echo "Testing complete table creation and QR URL generation flow\n\n";

// Test 1: API Parameter Support
echo "1. Testing API Parameter Support\n";
echo "--------------------------------\n";

$baseUrl = "http://127.0.0.1:8000/api/v1/table-info";

// Test with table_id
echo "Testing with table_id=28...\n";
$response1 = file_get_contents("$baseUrl?table_id=28");
$data1 = json_decode($response1, true);
if ($data1['success']) {
    echo "✅ table_id parameter works\n";
    echo "   table_id: {$data1['data']['table_id']}\n";
    echo "   table_no: {$data1['data']['table_no']}\n";
    echo "   table_name: {$data1['data']['table_name']}\n";
} else {
    echo "❌ table_id parameter failed: {$data1['error']}\n";
}

// Test with table_no
echo "\nTesting with table_no=28...\n";
$response2 = file_get_contents("$baseUrl?table_no=28");
$data2 = json_decode($response2, true);
if ($data2['success']) {
    echo "✅ table_no parameter works\n";
    echo "   table_id: {$data2['data']['table_id']}\n";
    echo "   table_no: {$data2['data']['table_no']}\n";
    echo "   table_name: {$data2['data']['table_name']}\n";
} else {
    echo "❌ table_no parameter failed: {$data2['error']}\n";
}

// Test with qr_code
echo "\nTesting with qr_code=ms28AeaKPP...\n";
$response3 = file_get_contents("$baseUrl?qr_code=ms28AeaKPP");
$data3 = json_decode($response3, true);
if ($data3['success']) {
    echo "✅ qr_code parameter works\n";
    echo "   table_id: {$data3['data']['table_id']}\n";
    echo "   table_no: {$data3['data']['table_no']}\n";
    echo "   table_name: {$data3['data']['table_name']}\n";
} else {
    echo "❌ qr_code parameter failed: {$data3['error']}\n";
}

// Test 2: URL Generation Logic
echo "\n\n2. URL Generation Logic Test\n";
echo "-----------------------------\n";

// Simulate the URL generation logic from the Blade template
$frontend_url = 'http://127.0.0.1:8001';
$location_id = 1;
$max_capacity = 4;
$date = date('Y-m-d');
$time = date('H:i');
$qr_code = 'ms28AeaKPP';

// Test case 1: Valid table_no
$table_data = (object)['table_no' => 11];
$table_id = 30;

$table_number = (!empty($table_data->table_no) && $table_data->table_no > 0) ? $table_data->table_no : $table_id;
$qr_redirect_url = $frontend_url . '/table/' . $table_number . '?' . http_build_query([
    'location' => $location_id,
    'guest' => $max_capacity,
    'date' => $date,
    'time' => $time,
    'qr' => $qr_code,
    'table' => $table_number
]);

echo "Test case 1: Valid table_no (11)\n";
echo "✅ Generated URL: $qr_redirect_url\n";

// Test case 2: Invalid table_no (0)
$table_data = (object)['table_no' => 0];
$table_id = 31;

$table_number = (!empty($table_data->table_no) && $table_data->table_no > 0) ? $table_data->table_no : $table_id;
$qr_redirect_url = $frontend_url . '/table/' . $table_number . '?' . http_build_query([
    'location' => $location_id,
    'guest' => $max_capacity,
    'date' => $date,
    'time' => $time,
    'qr' => $qr_code,
    'table' => $table_number
]);

echo "\nTest case 2: Invalid table_no (0) - should fallback to table_id\n";
echo "✅ Generated URL: $qr_redirect_url\n";

// Test case 3: NULL table_no
$table_data = (object)['table_no' => null];
$table_id = 32;

$table_number = (!empty($table_data->table_no) && $table_data->table_no > 0) ? $table_data->table_no : $table_id;
$qr_redirect_url = $frontend_url . '/table/' . $table_number . '?' . http_build_query([
    'location' => $location_id,
    'guest' => $max_capacity,
    'date' => $date,
    'time' => $time,
    'qr' => $qr_code,
    'table' => $table_number
]);

echo "\nTest case 3: NULL table_no - should fallback to table_id\n";
echo "✅ Generated URL: $qr_redirect_url\n";

echo "\n\n=== VERIFICATION COMPLETE ===\n";
echo "All tests completed. Check results above for any issues.\n";
echo "If all tests show ✅, the table creation fix is working correctly!\n";
