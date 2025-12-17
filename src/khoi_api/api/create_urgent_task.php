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
    // Kiểm tra kết nối database farm
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
    
    // Validate input
    $ten_nhiem_vu = $input['ten_nhiem_vu'] ?? '';
    $ngay_thuc_hien = $input['ngay_thuc_hien'] ?? '';
    $thoi_gian_bat_dau = $input['thoi_gian_bat_dau'] ?? '';
    $thoi_gian_ket_thuc = $input['thoi_gian_ket_thuc'] ?? '';
    $ma_lo_trong = $input['ma_lo_trong'] ?? '';
    $nguoi_tham_gia = $input['nguoi_tham_gia'] ?? '';
    $mo_ta = $input['mo_ta'] ?? '';
    $ghi_chu = $input['ghi_chu'] ?? '';
    
    if (empty($ten_nhiem_vu)) {
        throw new Exception("Tên nhiệm vụ không được để trống");
    }
    
    if (empty($nguoi_tham_gia)) {
        throw new Exception("Phải có ít nhất một người tham gia");
    }
    
    // Format thời gian
    $thoi_gian_formatted = '';
    if ($thoi_gian_bat_dau && $thoi_gian_ket_thuc) {
        $thoi_gian_formatted = $thoi_gian_bat_dau . ' - ' . $thoi_gian_ket_thuc;
    }
    
    // Insert vào bảng nhiem_vu_khan_cap (sử dụng cấu trúc bảng hiện tại)
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
        $ten_nhiem_vu,
        $ngay_thuc_hien ?: null,
        $thoi_gian_formatted,
        $ma_lo_trong,
        $nguoi_tham_gia,
        $mo_ta
    ]);
    
    if ($result) {
        $ma_cong_viec = $pdo->lastInsertId();
        
        // Lấy thông tin vừa tạo để trả về
        $select_sql = "SELECT 
            ma_cong_viec,
            ten_nhiem_vu,
            ngay,
            thoi_gian,
            ma_lo_trong,
            nguoi_tham_gia,
            mo_ta,
            trang_thai
        FROM nhiem_vu_khan_cap 
        WHERE ma_cong_viec = ?";
        
        $select_stmt = $pdo->prepare($select_sql);
        $select_stmt->execute([$ma_cong_viec]);
        $new_task = $select_stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "success" => true,
            "message" => "Tạo nhiệm vụ khẩn cấp thành công",
            "ma_cong_viec" => $ma_cong_viec,
            "data" => $new_task
        ], JSON_UNESCAPED_UNICODE);
        
    } else {
        throw new Exception("Không thể tạo nhiệm vụ khẩn cấp");
    }
    
} catch (Throwable $e) {
    http_response_code(500);
    error_log("Create urgent task error: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
