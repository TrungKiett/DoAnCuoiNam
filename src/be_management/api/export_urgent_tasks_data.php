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
    // Kiểm tra kết nối database farm
    $pdo->query("SELECT 1");
    
    // Đảm bảo bảng tồn tại và có dữ liệu
    $stmt = $pdo->query("SHOW TABLES LIKE 'nhiem_vu_khan_cap'");
    if ($stmt->rowCount() == 0) {
        // Tạo bảng
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
        
        // Thêm dữ liệu mẫu
        $sample_data = "
        INSERT INTO nhiem_vu_khan_cap (ten_nhiem_vu, ngay_thuc_hien, thoi_gian_bat_dau, thoi_gian_ket_thuc, ma_lo_trong, nguoi_tham_gia, mo_ta, trang_thai, ghi_chu) VALUES
        ('Tưới cây khẩn cấp', '2025-10-25', '07:00:00', '11:00:00', '5', 'ND-8,ND-3', 'Nhiệm vụ khẩn cấp - Lô 5', 'chua_bat_dau', 'Phân công khẩn cấp qua hệ thống'),
        ('Bón phân gấp', '2025-10-26', '13:00:00', '17:00:00', '6', 'ND-8,ND-3,ND-25', 'Nhiệm vụ khẩn cấp - Lô 6', 'chua_bat_dau', 'Phân công khẩn cấp qua hệ thống'),
        ('Thu hoạch khẩn cấp', '2025-10-27', '07:00:00', '17:00:00', '7', 'ND-8,ND-3', 'Nhiệm vụ khẩn cấp - Lô 7', 'dang_thuc_hien', 'Phân công khẩn cấp qua hệ thống'),
        ('Kiểm tra sâu bệnh', '2025-10-28', '08:00:00', '12:00:00', '8', 'ND-3,ND-25', 'Nhiệm vụ khẩn cấp - Lô 8', 'hoan_thanh', 'Phân công khẩn cấp qua hệ thống')
        ";
        
        $pdo->exec($sample_data);
    }
    
    // Lấy tất cả dữ liệu với format đầy đủ
    $sql = "SELECT 
        ma_cong_viec,
        ten_nhiem_vu,
        ngay_thuc_hien,
        thoi_gian_bat_dau,
        thoi_gian_ket_thuc,
        ma_lo_trong,
        nguoi_tham_gia,
        mo_ta,
        trang_thai,
        ghi_chu,
        created_at,
        updated_at
    FROM nhiem_vu_khan_cap 
    ORDER BY created_at DESC";
    
    $stmt = $pdo->query($sql);
    $raw_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format dữ liệu để xuất
    $formatted_data = array_map(function($item) {
        $nguoi_tham_gia_list = explode(',', $item['nguoi_tham_gia']);
        
        return [
            "ma_cong_viec" => $item['ma_cong_viec'],
            "ten_nhiem_vu" => $item['ten_nhiem_vu'],
            "ngay_thuc_hien" => $item['ngay_thuc_hien'],
            "ngay_thuc_hien_formatted" => date('d/m/Y', strtotime($item['ngay_thuc_hien'])),
            "thoi_gian_bat_dau" => $item['thoi_gian_bat_dau'],
            "thoi_gian_ket_thuc" => $item['thoi_gian_ket_thuc'],
            "thoi_gian_lam_viec" => $item['thoi_gian_bat_dau'] . " - " . $item['thoi_gian_ket_thuc'],
            "ma_lo_trong" => $item['ma_lo_trong'],
            "dia_diem" => "Lô " . $item['ma_lo_trong'],
            "nguoi_tham_gia_raw" => $item['nguoi_tham_gia'],
            "danh_sach_nguoi_tham_gia" => $nguoi_tham_gia_list,
            "so_luong_nguoi" => count($nguoi_tham_gia_list),
            "mo_ta" => $item['mo_ta'],
            "trang_thai" => $item['trang_thai'],
            "trang_thai_text" => [
                'chua_bat_dau' => 'Chưa bắt đầu',
                'dang_thuc_hien' => 'Đang thực hiện',
                'hoan_thanh' => 'Hoàn thành'
            ][$item['trang_thai']] ?? $item['trang_thai'],
            "ghi_chu" => $item['ghi_chu'],
            "created_at" => $item['created_at'],
            "updated_at" => $item['updated_at'],
            "thoi_gian_tao" => date('d/m/Y H:i:s', strtotime($item['created_at'])),
            "thoi_gian_cap_nhat" => date('d/m/Y H:i:s', strtotime($item['updated_at']))
        ];
    }, $raw_data);
    
    // Tạo danh sách ma_cong_viec để select
    $ma_cong_viec_options = array_map(function($item) {
        return [
            'value' => $item['ma_cong_viec'],
            'label' => $item['ma_cong_viec'] . ' - ' . $item['ten_nhiem_vu'] . ' (' . $item['ngay_thuc_hien_formatted'] . ')',
            'ten_nhiem_vu' => $item['ten_nhiem_vu'],
            'ngay_thuc_hien' => $item['ngay_thuc_hien_formatted'],
            'trang_thai' => $item['trang_thai_text']
        ];
    }, $formatted_data);
    
    echo json_encode([
        "success" => true,
        "message" => "Xuất dữ liệu nhiệm vụ khẩn cấp từ database farm",
        "database_info" => [
            "database" => "farm",
            "table" => "nhiem_vu_khan_cap",
            "total_records" => count($raw_data)
        ],
        "ma_cong_viec_options" => $ma_cong_viec_options,
        "formatted_data" => $formatted_data,
        "raw_data" => $raw_data
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Throwable $e) {
    http_response_code(500);
    error_log("Export urgent tasks data error: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>































