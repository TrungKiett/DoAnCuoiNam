<?php
require_once __DIR__ . '/config.php';

echo "=== DEBUG USERS COUNT ===\n";

try {
    // Test 1: Check if table exists
    echo "1. Checking if nguoi_dung table exists...\n";
    $stmt = $pdo->query("SHOW TABLES LIKE 'nguoi_dung'");
    if ($stmt->rowCount() == 0) {
        echo "❌ Table 'nguoi_dung' does not exist\n";
        exit;
    }
    echo "✅ Table 'nguoi_dung' exists\n";
    
    // Test 2: Count users
    echo "\n2. Counting users...\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM nguoi_dung");
    $result = $stmt->fetch();
    $totalUsers = $result['total'];
    echo "📊 Total users: $totalUsers\n";
    
    // Test 3: Show sample users
    echo "\n3. Sample users:\n";
    $stmt = $pdo->query("SELECT ma_nguoi_dung, ten_dang_nhap, ho_ten, vai_tro FROM nguoi_dung LIMIT 5");
    $users = $stmt->fetchAll();
    foreach ($users as $user) {
        echo "- ID: {$user['ma_nguoi_dung']}, Username: {$user['ten_dang_nhap']}, Name: {$user['ho_ten']}, Role: {$user['vai_tro']}\n";
    }
    
    // Test 4: Test safeCount function
    echo "\n4. Testing safeCount function...\n";
    function safeCount($pdo, $table, $default = 0) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM $table");
            return $stmt->fetch()['total'];
        } catch (Exception $e) {
            echo "Error in safeCount: " . $e->getMessage() . "\n";
            return $default;
        }
    }
    
    $safeCount = safeCount($pdo, 'nguoi_dung', 0);
    echo "📊 safeCount result: $safeCount\n";
    
    // Test 5: Test dashboard API response
    echo "\n5. Testing dashboard API response...\n";
    $stats = [];
    $stats['total_users'] = safeCount($pdo, 'nguoi_dung', 0);
    $stats['total_lots'] = safeCount($pdo, 'lo_trong', 0);
    $stats['total_plans'] = safeCount($pdo, 'ke_hoach_san_xuat', 0);
    $stats['today_tasks'] = safeCount($pdo, 'lich_lam_viec', 0);
    
    $response = [
        'success' => true,
        'data' => $stats
    ];
    
    echo "📊 Dashboard API response:\n";
    echo json_encode($response, JSON_PRETTY_PRINT) . "\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
