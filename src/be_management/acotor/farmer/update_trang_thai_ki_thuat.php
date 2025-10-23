<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

require_once __DIR__ . '/../../api/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

 $ma_van_de = $_GET['ma_van_de'] ?? null;
$trang_thai = $_GET['trang_thai'] ?? null;

if (!$ma_van_de || !$trang_thai) {
    echo json_encode(["success" => false, "message" => "Thiếu dữ liệu đầu vào"]);
    exit();
}

try {
    $sql = "UPDATE van_de_bao_cao SET trang_thai = :trang_thai WHERE ma_van_de = :ma_van_de";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':trang_thai', $trang_thai);
    $stmt->bindParam(':ma_van_de', $ma_van_de);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Cập nhật trạng thái thành công"]);
    } else {
        echo json_encode(["success" => false, "message" => "Không thể cập nhật trạng thái"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Lỗi hệ thống: " . $e->getMessage()]);
}
?>