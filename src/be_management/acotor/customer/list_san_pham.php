<?php
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once __DIR__ . '/../../api/config.php';  

try {
    $sql = "SELECT gc.ma_giong, gc.ten_giong, gc.hinh_anh AS img, MIN(qr.ma_qr) AS ma_qr, qr.thong_tin_truy_xuat , lt.ngay_gieo 
    FROM giong_cay gc
                      JOIN truy_xuat_nguon_goc qr ON gc.ma_giong = qr.ma_giong 
                      join lo_trong lt on lt.ma_giong=gc.ma_giong
     GROUP BY gc.ma_giong";

    $stmt = $pdo->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Chuẩn hóa đường dẫn ảnh
    foreach ($data as &$row) {
        if (!empty($row['img'])) {
            $fileName = basename($row['img']);
            $row['img'] = "http://yensonfarm.io.vn/khoi_api/acotor/uploads_giongcay/" . $fileName;
        } else {
            $row['img'] = ""; // để React hiển thị ảnh mặc định
        }

        if (empty($row['desc'])) {
            $row['desc'] = "Mô tả sản phẩm đang được cập nhật...";
        }
    }

    echo json_encode(['status' => 'success', 'data' => $data], JSON_UNESCAPED_UNICODE);
} 
catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Lỗi: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}