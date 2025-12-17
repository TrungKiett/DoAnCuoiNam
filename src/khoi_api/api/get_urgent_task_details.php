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
    
    // Lấy ma_cong_viec từ GET parameter hoặc POST body
    $ma_cong_viec = null;
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $ma_cong_viec = $_GET['ma_cong_viec'] ?? null;
    } else {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $ma_cong_viec = $input['ma_cong_viec'] ?? null;
    }
    
    // Nếu không có ma_cong_viec, lấy tất cả
    if (!$ma_cong_viec) {
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
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "success" => true,
            "message" => "Lấy tất cả nhiệm vụ khẩn cấp",
            "total_count" => count($data),
            "data" => $data
        ], JSON_UNESCAPED_UNICODE);
        
    } else {
        // Lấy thông tin chi tiết của một nhiệm vụ cụ thể
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
        WHERE ma_cong_viec = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$ma_cong_viec]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($data) {
            // Format thông tin để dễ đọc
            $formatted_data = [
                "ma_cong_viec" => $data['ma_cong_viec'],
                "ten_nhiem_vu" => $data['ten_nhiem_vu'],
                "ngay_thuc_hien" => $data['ngay_thuc_hien'],
                "thoi_gian_bat_dau" => $data['thoi_gian_bat_dau'],
                "thoi_gian_ket_thuc" => $data['thoi_gian_ket_thuc'],
                "thoi_gian_lam_viec" => $data['thoi_gian_bat_dau'] . " - " . $data['thoi_gian_ket_thuc'],
                "ma_lo_trong" => $data['ma_lo_trong'],
                "dia_diem" => "Lô " . $data['ma_lo_trong'],
                "nguoi_tham_gia" => $data['nguoi_tham_gia'],
                "danh_sach_nguoi_tham_gia" => explode(',', $data['nguoi_tham_gia']),
                "so_luong_nguoi" => count(explode(',', $data['nguoi_tham_gia'])),
                "mo_ta" => $data['mo_ta'],
                "trang_thai" => $data['trang_thai'],
                "ghi_chu" => $data['ghi_chu'],
                "created_at" => $data['created_at'],
                "updated_at" => $data['updated_at'],
                "thoi_gian_tao" => date('d/m/Y H:i:s', strtotime($data['created_at'])),
                "thoi_gian_cap_nhat" => date('d/m/Y H:i:s', strtotime($data['updated_at']))
            ];
            
            echo json_encode([
                "success" => true,
                "message" => "Lấy thông tin nhiệm vụ khẩn cấp thành công",
                "data" => $formatted_data
            ], JSON_UNESCAPED_UNICODE);
            
        } else {
            http_response_code(404);
            echo json_encode([
                "success" => false,
                "message" => "Không tìm thấy nhiệm vụ khẩn cấp với ma_cong_viec: " . $ma_cong_viec
            ], JSON_UNESCAPED_UNICODE);
        }
    }
    
} catch (Throwable $e) {
    http_response_code(500);
    error_log("Get urgent task details error: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>


















































