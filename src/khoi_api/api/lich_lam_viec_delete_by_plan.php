<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$ma_ke_hoach = $input['ma_ke_hoach'] ?? null;

if ($ma_ke_hoach === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing ma_ke_hoach"]);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM lich_lam_viec WHERE ma_ke_hoach = ?");
    $stmt->execute([$ma_ke_hoach]);
    echo json_encode(["success" => true, "deleted" => $stmt->rowCount()]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("Delete tasks by plan error: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}


