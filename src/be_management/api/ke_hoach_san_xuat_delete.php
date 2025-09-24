<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$id = $input['ma_ke_hoach'] ?? null;
if ($id === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "ma_ke_hoach is required"]);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM ke_hoach_san_xuat WHERE ma_ke_hoach = ?");
    $stmt->execute([$id]);
    echo json_encode(["success" => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}


