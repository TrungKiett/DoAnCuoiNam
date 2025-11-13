<?php
require_once __DIR__ . '/config.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

try {
    // Test connection
    $pdo->query("SELECT 1");
    
    // Đảm bảo bảng tồn tại
    $stmt = $pdo->query("SHOW TABLES LIKE 'nhiem_vu_khan_cap'");
    if ($stmt->rowCount() == 0) {
        $create_table = "
        CREATE TABLE nhiem_vu_khan_cap (
            ma_cong_viec INT AUTO_INCREMENT PRIMARY KEY,
            ten_nhiem_vu VARCHAR(255) NOT NULL,
            ngay_thuc_hien DATE,
            thoi_gian_bat_dau TIME,
            thoi_gian_ket_thuc TIME,
            ma_lo_trong VARCHAR(50),
            nguoi_tham_gia TEXT,
            mo_ta TEXT,
            trang_thai VARCHAR(50) DEFAULT 'chua_bat_dau',
            ghi_chu TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        $pdo->exec($create_table);
    }
    
    // Test data với cấu trúc bảng hiện tại
    $test_data = [
        'ten_nhiem_vu' => 'Test Task từ API',
        'ngay' => '2025-10-25',
        'thoi_gian' => '07:00 - 11:00',
        'ma_lo_trong' => '5',
        'nguoi_tham_gia' => '8,3',
        'mo_ta' => 'Test từ API'
    ];
    
    // Insert test data
    $sql = "INSERT INTO nhiem_vu_khan_cap (
        ten_nhiem_vu,
        ngay,
        thoi_gian,
        ma_lo_trong,
        nguoi_tham_gia,
        mo_ta,
        trang_thai
    ) VALUES (?, ?, ?, ?, ?, ?, 'Chưa bắt đầu')";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        $test_data['ten_nhiem_vu'],
        $test_data['ngay'],
        $test_data['thoi_gian'],
        $test_data['ma_lo_trong'],
        $test_data['nguoi_tham_gia'],
        $test_data['mo_ta']
    ]);
    
    if ($result) {
        $ma_cong_viec = $pdo->lastInsertId();
        
        echo json_encode([
            "success" => true,
            "message" => "Test tạo nhiệm vụ khẩn cấp thành công",
            "ma_cong_viec" => $ma_cong_viec,
            "test_data" => $test_data
        ], JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception("Không thể tạo test data");
    }
    
} catch (Throwable $e) {
    http_response_code(500);
    error_log("Test create urgent task error: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
