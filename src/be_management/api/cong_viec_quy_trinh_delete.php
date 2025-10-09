<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$ma_cong_viec = $input['ma_cong_viec'] ?? null;

if (!$ma_cong_viec) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing ma_cong_viec"]);
    exit;
}

try {
    $stmt = $pdo->prepare('DELETE FROM cong_viec_quy_trinh WHERE ma_cong_viec = ?');
    $stmt->execute([$ma_cong_viec]);
    echo json_encode(["success" => true, "deleted" => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>


