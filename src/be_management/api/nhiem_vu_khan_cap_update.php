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
$ma_cong_viec = $input['ma_cong_viec'] ?? null;

if (!$ma_cong_viec) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "ma_cong_viec is required"]);
    exit;
}

try {
    $sql = "UPDATE nhiem_vu_khan_cap SET 
        ten_nhiem_vu = ?,
        ngay_thuc_hien = ?,
        thoi_gian_bat_dau = ?,
        thoi_gian_ket_thuc = ?,
        ma_lo_trong = ?,
        nguoi_tham_gia = ?,
        mo_ta = ?,
        trang_thai = ?,
        ghi_chu = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE ma_cong_viec = ?";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        $input['ten_nhiem_vu'] ?? '',
        $input['ngay_thuc_hien'] ?? null,
        $input['thoi_gian_bat_dau'] ?? '',
        $input['thoi_gian_ket_thuc'] ?? '',
        $input['ma_lo_trong'] ?? '',
        $input['nguoi_tham_gia'] ?? '',
        $input['mo_ta'] ?? '',
        $input['trang_thai'] ?? 'chua_bat_dau',
        $input['ghi_chu'] ?? '',
        $ma_cong_viec
    ]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            "success" => true, 
            "message" => "Nhiệm vụ khẩn cấp đã được cập nhật thành công"
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            "success" => false, 
            "error" => "Không tìm thấy nhiệm vụ khẩn cấp hoặc không có thay đổi"
        ], JSON_UNESCAPED_UNICODE);
    }
    
} catch (Throwable $e) {
    http_response_code(500);
    error_log("Update urgent task error: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
