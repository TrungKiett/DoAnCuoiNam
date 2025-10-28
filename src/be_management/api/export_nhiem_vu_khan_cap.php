<?php
require_once __DIR__ . '/config.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // 1. Kiểm tra kết nối database farm
    $pdo->query("SELECT 1");
    $debug_info = ["Database 'farm' connection: OK"];
    
    // 2. Kiểm tra bảng có tồn tại không
    $stmt = $pdo->query("SHOW TABLES LIKE 'nhiem_vu_khan_cap'");
    $table_exists = $stmt->rowCount() > 0;
    $debug_info[] = "Table 'nhiem_vu_khan_cap' exists: " . ($table_exists ? "YES" : "NO");
    
    if (!$table_exists) {
        // 3. Tạo bảng nếu chưa có
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
        $debug_info[] = "Table 'nhiem_vu_khan_cap' created successfully";
        
        // 4. Thêm dữ liệu mẫu
        $sample_data = "
        INSERT INTO nhiem_vu_khan_cap (ten_nhiem_vu, ngay_thuc_hien, thoi_gian_bat_dau, thoi_gian_ket_thuc, ma_lo_trong, nguoi_tham_gia, mo_ta, trang_thai, ghi_chu) VALUES
        ('Tưới cây khẩn cấp', '2025-10-25', '07:00:00', '11:00:00', '5', 'ND-8,ND-3', 'Nhiệm vụ khẩn cấp - Lô 5', 'chua_bat_dau', 'Phân công khẩn cấp qua hệ thống'),
        ('Bón phân gấp', '2025-10-26', '13:00:00', '17:00:00', '6', 'ND-8,ND-3,ND-25', 'Nhiệm vụ khẩn cấp - Lô 6', 'chua_bat_dau', 'Phân công khẩn cấp qua hệ thống'),
        ('Thu hoạch khẩn cấp', '2025-10-27', '07:00:00', '17:00:00', '7', 'ND-8,ND-3', 'Nhiệm vụ khẩn cấp - Lô 7', 'chua_bat_dau', 'Phân công khẩn cấp qua hệ thống')
        ";
        
        $pdo->exec($sample_data);
        $debug_info[] = "Sample data inserted (3 records)";
    }
    
    // 5. Đếm số bản ghi
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM nhiem_vu_khan_cap");
    $count = $stmt->fetch()['count'];
    $debug_info[] = "Total records: " . $count;
    
    // 6. Lấy tất cả dữ liệu với format đúng
    $sql = "SELECT 
        ma_cong_viec,
        ten_nhiem_vu,
        ngay_thuc_hien as ngay,
        CONCAT(thoi_gian_bat_dau, ' - ', thoi_gian_ket_thuc) as thoi_gian,
        CONCAT('Lô ', ma_lo_trong) as ma_lo_trong,
        nguoi_tham_gia,
        mo_ta,
        trang_thai,
        ghi_chu,
        created_at,
        updated_at
    FROM nhiem_vu_khan_cap 
    ORDER BY created_at DESC";
    
    $stmt = $pdo->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true,
        "debug_info" => $debug_info,
        "data" => $data,
        "total_count" => $count,
        "database" => "farm"
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Throwable $e) {
    http_response_code(500);
    error_log("Export urgent tasks error: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage(),
        "debug_info" => $debug_info ?? []
    ], JSON_UNESCAPED_UNICODE);
}
?>


