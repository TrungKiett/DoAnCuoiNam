<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';

$test_phone = '0912345678';
$test_password = '123456';

echo "=== DEBUG FARMER LOGIN ===\n\n";

try {
    // 1. Kiểm tra kết nối database
    echo "1. Database connection: OK\n";
    
    // 2. Tìm user với số điện thoại
    $stmt = $pdo->prepare("SELECT * FROM nguoi_dung WHERE so_dien_thoai = ?");
    $stmt->execute([$test_phone]);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "2. User found:\n";
        echo "   - ID: " . $user['ma_nguoi_dung'] . "\n";
        echo "   - Username: " . $user['ten_dang_nhap'] . "\n";
        echo "   - Full name: " . $user['ho_ten'] . "\n";
        echo "   - Role: " . $user['vai_tro'] . "\n";
        echo "   - Phone: " . $user['so_dien_thoai'] . "\n";
        echo "   - Password: " . $user['mat_khau'] . "\n";
        
        // 3. Kiểm tra vai trò
        if ($user['vai_tro'] === 'nong_dan') {
            echo "3. Role check: PASS (is farmer)\n";
            
            // 4. Kiểm tra mật khẩu
            if ($user['mat_khau'] === $test_password) {
                echo "4. Password check: PASS\n";
                echo "5. Login should work!\n";
                
                // Test API call
                echo "\n=== TESTING API CALL ===\n";
                $postData = json_encode([
                    'so_dien_thoai' => $test_phone,
                    'mat_khau' => $test_password
                ]);
                
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, 'http://yensonfarm.io.vn/khoi_api/api/farmer_login.php');
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
                curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                
                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                
                echo "API Response (HTTP $httpCode):\n";
                echo $response . "\n";
                
            } else {
                echo "4. Password check: FAIL\n";
                echo "   Expected: '$test_password'\n";
                echo "   Actual: '" . $user['mat_khau'] . "'\n";
            }
        } else {
            echo "3. Role check: FAIL (not farmer)\n";
            echo "   Expected: 'nong_dan'\n";
            echo "   Actual: '" . $user['vai_tro'] . "'\n";
        }
    } else {
        echo "2. User NOT found with phone: $test_phone\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
