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
    
    // Lấy danh sách tất cả ma_cong_viec và thông tin cơ bản
    $sql = "SELECT 
        ma_cong_viec,
        ten_nhiem_vu,
        ngay_thuc_hien,
        CONCAT(thoi_gian_bat_dau, ' - ', thoi_gian_ket_thuc) as thoi_gian,
        CONCAT('Lô ', ma_lo_trong) as dia_diem,
        nguoi_tham_gia,
        trang_thai,
        created_at
    FROM nhiem_vu_khan_cap 
    ORDER BY created_at DESC";
    
    $stmt = $pdo->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Tạo danh sách ma_cong_viec để dễ select
    $ma_cong_viec_list = array_map(function($item) {
        return [
            'ma_cong_viec' => $item['ma_cong_viec'],
            'ten_nhiem_vu' => $item['ten_nhiem_vu'],
            'ngay_thuc_hien' => $item['ngay_thuc_hien'],
            'thoi_gian' => $item['thoi_gian'],
            'dia_diem' => $item['dia_diem'],
            'so_nguoi_tham_gia' => count(explode(',', $item['nguoi_tham_gia'])),
            'trang_thai' => $item['trang_thai'],
            'created_at' => $item['created_at']
        ];
    }, $data);
    
    echo json_encode([
        "success" => true,
        "message" => "Danh sách nhiệm vụ khẩn cấp",
        "total_count" => count($data),
        "ma_cong_viec_list" => $ma_cong_viec_list,
        "data" => $data
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Throwable $e) {
    http_response_code(500);
    error_log("Get urgent tasks list error: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>



