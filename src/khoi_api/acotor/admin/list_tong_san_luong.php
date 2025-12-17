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
        SELECT lt.ma_lo_trong, lt.ngay_gieo, th.ngay_thu_hoach, gc.ten_giong, SUM(th.san_luong) AS tong_san_luong 
        FROM lo_trong lt LEFT JOIN thu_hoach th ON lt.ma_lo_trong = th.ma_lo_trong 
                            JOIN giong_cay gc ON gc.ma_giong = lt.ma_giong
        GROUP BY lt.ma_lo_trong, lt.ngay_gieo, th.ngay_thu_hoach, gc.ten_giong 
        ORDER BY lt.ma_lo_trong;
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi truy vấn cơ sở dữ liệu: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi không xác định: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}