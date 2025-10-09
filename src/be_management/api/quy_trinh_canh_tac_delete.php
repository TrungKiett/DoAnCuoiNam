<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$ma_quy_trinh = $input['ma_quy_trinh'] ?? null;

if (!$ma_quy_trinh) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing ma_quy_trinh"]);
    exit;
}

try {
    // Optional: cascade delete tasks
    $stmt = $pdo->prepare('DELETE FROM cong_viec_quy_trinh WHERE quy_trinh_id = ?');
    $stmt->execute([$ma_quy_trinh]);

    $stmt = $pdo->prepare('DELETE FROM quy_trinh_canh_tac WHERE ma_quy_trinh = ?');
    $stmt->execute([$ma_quy_trinh]);

    echo json_encode(["success" => true, "deleted" => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>


