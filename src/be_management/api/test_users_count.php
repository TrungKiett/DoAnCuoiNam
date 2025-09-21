<?php
require_once __DIR__ . '/config.php';

try {
    // Test connection
    echo "Testing database connection...\n";
    
    // Check if nguoi_dung table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'nguoi_dung'");
    if ($stmt->rowCount() == 0) {
        echo "❌ Table 'nguoi_dung' does not exist\n";
        exit;
    }
    echo "✅ Table 'nguoi_dung' exists\n";
    
    // Count total users
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM nguoi_dung");
    $totalUsers = $stmt->fetch()['total'];
    echo "📊 Total users in nguoi_dung table: $totalUsers\n";
    
    // Show sample users
    if ($totalUsers > 0) {
        $stmt = $pdo->query("SELECT ma_nguoi_dung, ten_dang_nhap, ho_ten, vai_tro FROM nguoi_dung LIMIT 5");
        $users = $stmt->fetchAll();
        echo "\n📋 Sample users:\n";
        foreach ($users as $user) {
            echo "- ID: {$user['ma_nguoi_dung']}, Username: {$user['ten_dang_nhap']}, Name: {$user['ho_ten']}, Role: {$user['vai_tro']}\n";
        }
    } else {
        echo "⚠️ No users found in nguoi_dung table\n";
    }
    
    // Test dashboard API
    echo "\n🔍 Testing dashboard API...\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM nguoi_dung");
    $dashboardCount = $stmt->fetch()['total'];
    echo "Dashboard API should return: $dashboardCount users\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
