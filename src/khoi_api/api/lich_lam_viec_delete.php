<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$id = $input['id'] ?? null;

if ($id === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing id"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Ensure table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'lich_lam_viec'");
    if ($stmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Table lich_lam_viec not found"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM lich_lam_viec WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["success" => true, "deleted" => $stmt->rowCount()], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("Delete single task error: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}


