<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';

// Test với dữ liệu cố định
$test_phone = '0912345678';
$test_password = '123456';

try {
    echo "Testing farmer login...\n\n";
    
    // Kiểm tra bảng nguoi_dung
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM nguoi_dung");
    $total = $stmt->fetch();
    echo "Total users: " . $total['count'] . "\n";
    
    // Kiểm tra nông dân
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM nguoi_dung WHERE vai_tro = 'nong_dan'");
    $farmers = $stmt->fetch();
    echo "Farmers: " . $farmers['count'] . "\n";
    
    // Tìm user với số điện thoại test
    $stmt = $pdo->prepare("SELECT * FROM nguoi_dung WHERE so_dien_thoai = ?");
    $stmt->execute([$test_phone]);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "Found user: " . json_encode($user) . "\n";
        
        // Kiểm tra mật khẩu
        if ($user['mat_khau'] === $test_password) {
            echo "Password match: YES\n";
            echo "Login should work!\n";
        } else {
            echo "Password match: NO\n";
            echo "Expected: " . $test_password . "\n";
            echo "Actual: " . $user['mat_khau'] . "\n";
        }
    } else {
        echo "User not found with phone: " . $test_phone . "\n";
        
        // Tạo user test
        echo "Creating test user...\n";
        $stmt = $pdo->prepare("
            INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau, ho_ten, vai_tro, so_dien_thoai, ngay_tao) 
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        $result = $stmt->execute([
            'test_farmer',
            $test_password,
            'Test Farmer',
            'nong_dan',
            $test_phone
        ]);
        
        if ($result) {
            echo "Test user created successfully!\n";
        } else {
            echo "Failed to create test user\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
