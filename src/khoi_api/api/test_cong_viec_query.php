<?php
require_once __DIR__ . '/config.php';

try {
    // Test the exact query that's failing
    $quy_trinh_id = 1; // Test with ID 1
    
    $stmt = $pdo->prepare("SELECT * FROM cong_viec_quy_trinh WHERE quy_trinh_id = ? ORDER BY ma_cong_viec ASC");
    $stmt->execute([$quy_trinh_id]);
    $tasks = $stmt->fetchAll();
    
    echo json_encode([
        "success" => true,
        "test_query" => "SELECT * FROM cong_viec_quy_trinh WHERE quy_trinh_id = ? ORDER BY ma_cong_viec ASC",
        "quy_trinh_id_tested" => $quy_trinh_id,
        "tasks_found" => count($tasks),
        "data" => $tasks
    ]);
    
} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
        "error_code" => $e->getCode(),
        "sql_state" => $e->errorInfo[0] ?? 'unknown'
    ]);
}
?>
