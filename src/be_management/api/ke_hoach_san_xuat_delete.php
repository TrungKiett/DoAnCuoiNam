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
    // Ensure related tasks are removed first (defensive, in case FK not set)
    $pdo->beginTransaction();
    $delTasks = $pdo->prepare("DELETE FROM lich_lam_viec WHERE ma_ke_hoach = ?");
    $delTasks->execute([$id]);

    $stmt = $pdo->prepare("DELETE FROM ke_hoach_san_xuat WHERE ma_ke_hoach = ?");
    $stmt->execute([$id]);
    $pdo->commit();
    echo json_encode(["success" => true, "deleted_tasks" => $delTasks->rowCount()]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) { try { $pdo->rollBack(); } catch (Throwable $ignore) {} }
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}


