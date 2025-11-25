<?php
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../../api/config.php';

// Lấy id nông dân
 $farmerId = $_GET['ma_nong_dan'] ?? null;

if (!$farmerId) {
    echo json_encode([
        'success' => false,
        'message' => 'Thiếu mã nông dân'
    ]);
    exit;
}

try {
    $sql = "SELECT nd.ten_dang_nhap,bl.tong_gio_lam,bl.muc_luong_gio,bl.ngay_tao,bl.tong_thu_nhap FROM bang_luong bl join nguoi_dung nd 
                    on bl.ma_nguoi_dung=nd.ma_nguoi_dung
                    WHERE  bl.trang_thai like '%Đã duyệt%'
                    and nd.ma_nguoi_dung = :ma_nong_dan  ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':ma_nong_dan' => $farmerId]);

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}