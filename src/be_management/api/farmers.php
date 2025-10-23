<?php
require_once __DIR__ . '/config.php';

try {
    $stmt = $pdo->query("SELECT ma_nguoi_dung AS id, ho_ten AS full_name, so_dien_thoai AS phone FROM nguoi_dung WHERE vai_tro = 'nong_dan' AND ma_nguoi_dung <> 4 ORDER BY ho_ten");
    $rows = $stmt->fetchAll();
    echo json_encode(["success" => true, "data" => $rows]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
