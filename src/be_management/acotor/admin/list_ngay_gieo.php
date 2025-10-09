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
       select*from lo_trong lt join thu_hoach th on lt.ma_lo_trong=th.ma_lo_trong;
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