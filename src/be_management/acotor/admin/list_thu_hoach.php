<?php
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once __DIR__ . '/../../api/config.php'; // Kết nối DB ($pdo)

try {
     $sql = "
       SELECT 
    th.ma_lo_trong,
     th.ngay_thu_hoach,
    th.san_luong,
    th.chat_luong,
    th.ghi_chu,
    nd.ho_ten,
    l.ngay_bat_dau,
    l.ngay_ket_thuc
FROM thu_hoach th
JOIN nguoi_dung nd ON th.ma_nong_dan = nd.ma_nguoi_dung
JOIN (
    SELECT ma_nguoi_dung, MAX(ngay_bat_dau) AS latest_start
    FROM lich_lam_viec
    WHERE ten_cong_viec like '%Thu hoạch%'
    GROUP BY ma_nguoi_dung
) latest ON latest.ma_nguoi_dung = nd.ma_nguoi_dung
JOIN lich_lam_viec l 
  ON l.ma_nguoi_dung = latest.ma_nguoi_dung 
  AND l.ngay_bat_dau = latest.latest_start
ORDER BY th.ngay_thu_hoach DESC;

    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    // Xử lý lỗi cơ sở dữ liệu
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi truy vấn cơ sở dữ liệu: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    // Xử lý lỗi chung
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi không xác định: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}