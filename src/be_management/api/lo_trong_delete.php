<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$ma_lo_trong = $input['ma_lo_trong'] ?? null;

if ($ma_lo_trong === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "ma_lo_trong is required"]);
    exit;
}

try {
    $pdo->beginTransaction();

    $lotId = intval($ma_lo_trong);

    // Determine available columns/tables
    $hasTrangThaiLo = false;
    try {
        $colsStmt = $pdo->query("SHOW COLUMNS FROM lo_trong");
        $cols = $colsStmt->fetchAll(PDO::FETCH_COLUMN);
        $hasTrangThaiLo = in_array('trang_thai_lo', $cols);
    } catch (Throwable $e) {
        $hasTrangThaiLo = false;
    }

    // Cascade delete: remove tasks and plans for this lot if those tables exist
    $hasKhs = $pdo->query("SHOW TABLES LIKE 'ke_hoach_san_xuat'")->rowCount() > 0;
    if ($hasKhs) {
        // Collect plan ids by lot
        $planIds = $pdo->prepare("SELECT ma_ke_hoach FROM ke_hoach_san_xuat WHERE ma_lo_trong = ?");
        $planIds->execute([$lotId]);
        $plans = $planIds->fetchAll(PDO::FETCH_COLUMN);
        if (!empty($plans)) {
            // Delete tasks for these plans if task table exists
            $hasTasks = $pdo->query("SHOW TABLES LIKE 'lich_lam_viec'")->rowCount() > 0;
            if ($hasTasks) {
                $in = implode(',', array_fill(0, count($plans), '?'));
                $delTasks = $pdo->prepare("DELETE FROM lich_lam_viec WHERE ma_ke_hoach IN ($in)");
                $delTasks->execute($plans);
            }
            // Delete plans
            $in = implode(',', array_fill(0, count($plans), '?'));
            $delPlans = $pdo->prepare("DELETE FROM ke_hoach_san_xuat WHERE ma_ke_hoach IN ($in)");
            $delPlans->execute($plans);
        }
    }

    // Delete or soft-delete the lot
    if ($hasTrangThaiLo) {
        $stmt = $pdo->prepare("UPDATE lo_trong SET trang_thai_lo = 'deleted' WHERE ma_lo_trong = ?");
        $stmt->execute([$lotId]);
    } else {
        $stmt = $pdo->prepare("DELETE FROM lo_trong WHERE ma_lo_trong = ?");
        $stmt->execute([$lotId]);
    }

    $pdo->commit();
    echo json_encode(["success" => true]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) { try { $pdo->rollBack(); } catch (Throwable $ignore) {} }
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>



