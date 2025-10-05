<?php
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once __DIR__ . '/../../api/config.php';  

try {
    $sql = "SELECT 
    vd.ma_van_de,
    vd.noi_dung,
    vd.loai_van_de,
    vd.ngay_bao_cao,
    vd.ma_nong_dan,
    vd.ma_lo_trong,
    vd.hinh_anh,
    vd.trang_thai,
    vd.ghi_chu,
    nd.ho_ten
FROM van_de_bao_cao vd
INNER JOIN nguoi_dung nd ON vd.ma_nong_dan = nd.ma_nguoi_dung
WHERE vd.trang_thai = 'cho_xu_ly'
ORDER BY vd.ngay_bao_cao DESC;
";
    $stmt = $pdo->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Chuẩn hóa đường dẫn ảnh
    foreach ($data as &$row) {
        if (!empty($row['hinh_anh'])) {
            $fileName = basename($row['hinh_anh']); 
            $row['hinh_anh'] = "http://localhost/doancuoinam/src/be_management/uploads/" . $fileName;
        }
    }

    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi: ' . $e->getMessage()
    ]);
}