 <?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");require_once __DIR__ . '/../../api/config.php';

if (!isset($_GET['ma_giong'])) {
    echo json_encode(["status" => "error", "message" => "Thiếu mã giống"]);
    exit;
}

$ma_giong = $_GET['ma_giong'];

try {
    $stmt = $conn->prepare("DELETE FROM truy_xuat_nguon_goc WHERE ma_giong = ?");
    $stmt->execute([$ma_giong]);
    echo json_encode(["status" => "success", "message" => "Đã xóa mã QR thành công!"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}