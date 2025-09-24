<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Kết nối database
$host = "localhost";
$db = "farm";
$user = "root";
$pass = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $farmerId = $_GET['farmer_id'] ?? null;
    
    if (!$farmerId) {
        echo json_encode(['success' => false, 'message' => 'Thiếu farmer_id']);
        exit;
    }
    
    // Lấy công việc của nông dân
    // Kiểm tra xem ma_nguoi_dung có chứa farmer_id không (hỗ trợ multiple farmers)
    $stmt = $pdo->prepare("
        SELECT 
            id,
            ten_cong_viec,
            mo_ta,
            loai_cong_viec,
            ngay_bat_dau,
            ngay_ket_thuc,
            thoi_gian_bat_dau,
            thoi_gian_ket_thuc,
            thoi_gian_du_kien,
            trang_thai,
            uu_tien,
            ma_nguoi_dung,
            ghi_chu,
            ket_qua,
            hinh_anh,
            created_at
        FROM lich_lam_viec 
        WHERE ma_nguoi_dung LIKE ? OR ma_nguoi_dung = ?
        ORDER BY ngay_bat_dau DESC
    ");
    
    $stmt->execute(["%$farmerId%", $farmerId]);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $tasks
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi hệ thống: ' . $e->getMessage()
    ]);
}
?>
