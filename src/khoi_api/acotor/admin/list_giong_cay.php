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

require_once __DIR__ . '/../../api/config.php';

try {
  // 🔹 Truy vấn danh sách tất cả giống cây
  $listStmt = $pdo->query("SELECT * FROM giong_cay ");
  $list = $listStmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode([
    "success" => true,
    "message" => "Đã thêm giống cây thành công!",
    "data" => $list  // ← Danh sách tất cả bản ghi sau khi thêm
  ]);

} catch (Throwable $e) {
  echo json_encode([
    "success" => false,
    "message" => $e->getMessage()
  ]);
}
?>