<?php
// Test script để kiểm tra kết nối database
require_once __DIR__ . '/api/config.php';

echo "<h2>Test Database Connection</h2>";

try {
    // Test connection
    echo "<p>✅ Database connection successful!</p>";
    
    // Test tables exist
    $tables = ['lo_trong', 'ke_hoach_san_xuat', 'nong_dan', 'users'];
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "<p>✅ Table '$table' exists</p>";
        } else {
            echo "<p>❌ Table '$table' missing</p>";
        }
    }
    
    // Test data
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM lo_trong");
    $loCount = $stmt->fetch()['count'];
    echo "<p>📊 Lô trồng: $loCount records</p>";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM ke_hoach_san_xuat");
    $planCount = $stmt->fetch()['count'];
    echo "<p>📊 Kế hoạch sản xuất: $planCount records</p>";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM nong_dan");
    $farmerCount = $stmt->fetch()['count'];
    echo "<p>📊 Nông dân: $farmerCount records</p>";
    
    // Test API endpoints
    echo "<h3>Test API Endpoints</h3>";
    
    // Test lo_trong_list.php
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://localhost/doancuoinam/api/lo_trong_list.php');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if ($data['success']) {
            echo "<p>✅ API lo_trong_list.php working - " . count($data['data']) . " lots</p>";
        } else {
            echo "<p>❌ API lo_trong_list.php error: " . $data['error'] . "</p>";
        }
    } else {
        echo "<p>❌ API lo_trong_list.php HTTP error: $httpCode</p>";
    }
    
    // Test ke_hoach_san_xuat_list.php
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://localhost/doancuoinam/api/ke_hoach_san_xuat_list.php');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if ($data['success']) {
            echo "<p>✅ API ke_hoach_san_xuat_list.php working - " . count($data['data']) . " plans</p>";
        } else {
            echo "<p>❌ API ke_hoach_san_xuat_list.php error: " . $data['error'] . "</p>";
        }
    } else {
        echo "<p>❌ API ke_hoach_san_xuat_list.php HTTP error: $httpCode</p>";
    }
    
    echo "<h3>Sample Data</h3>";
    
    // Show sample lots
    $stmt = $pdo->query("SELECT * FROM lo_trong LIMIT 3");
    $lots = $stmt->fetchAll();
    echo "<h4>Sample Lots:</h4>";
    echo "<pre>" . print_r($lots, true) . "</pre>";
    
    // Show sample plans
    $stmt = $pdo->query("SELECT * FROM ke_hoach_san_xuat LIMIT 3");
    $plans = $stmt->fetchAll();
    echo "<h4>Sample Plans:</h4>";
    echo "<pre>" . print_r($plans, true) . "</pre>";
    
} catch (Exception $e) {
    echo "<p>❌ Database error: " . $e->getMessage() . "</p>";
}
?>
