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
    // Check if cong_viec_quy_trinh table exists
    $tasksTableExists = false;
    try {
        $tasksTableExists = $pdo->query("SHOW TABLES LIKE 'cong_viec_quy_trinh'")->rowCount() > 0;
    } catch (Throwable $_) {
        // Table doesn't exist, skip task deletion
    }
    
    if ($tasksTableExists) {
        // Determine FK column name: prefer 'quy_trinh_id', fallback to 'ma_quy_trinh'
        $fkCol = 'quy_trinh_id';
        try {
            $colStmt = $pdo->query("SHOW COLUMNS FROM cong_viec_quy_trinh LIKE 'quy_trinh_id'");
            if ($colStmt->rowCount() === 0) {
                $altStmt = $pdo->query("SHOW COLUMNS FROM cong_viec_quy_trinh LIKE 'ma_quy_trinh'");
                if ($altStmt->rowCount() > 0) { 
                    $fkCol = 'ma_quy_trinh'; 
                } else {
                    // Neither column exists, skip task deletion
                    $fkCol = null;
                }
            }
        } catch (Throwable $_) {
            // If can't check columns, try both
            $fkCol = null;
        }
        
        // Delete tasks if column exists
        if ($fkCol) {
            try {
                $stmt = $pdo->prepare("DELETE FROM cong_viec_quy_trinh WHERE $fkCol = ?");
                $stmt->execute([$ma_quy_trinh]);
            } catch (Throwable $e) {
                error_log("Error deleting process tasks: " . $e->getMessage());
                // Continue to delete process even if tasks deletion fails
            }
        }
    }

    // Delete the process
    $stmt = $pdo->prepare('DELETE FROM quy_trinh_canh_tac WHERE ma_quy_trinh = ?');
    $stmt->execute([$ma_quy_trinh]);

    echo json_encode(["success" => true, "deleted" => true]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("Delete process error: " . $e->getMessage());
    error_log("SQL Error Code: " . $e->getCode());
    error_log("Stack trace: " . $e->getTraceAsString());
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage(),
        "debug_info" => "Check server logs for details"
    ]);
}
?>


