<?php
require_once __DIR__ . '/config.php';

try {
    // Check if table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'cong_viec_quy_trinh'");
    if ($stmt->rowCount() == 0) {
        echo json_encode([
            "success" => false,
            "error" => "Table 'cong_viec_quy_trinh' does not exist"
        ]);
        exit;
    }
    
    // Get table structure
    $stmt = $pdo->query("DESCRIBE cong_viec_quy_trinh");
    $columns = $stmt->fetchAll();
    
    // Get sample data
    $stmt = $pdo->query("SELECT * FROM cong_viec_quy_trinh LIMIT 3");
    $data = $stmt->fetchAll();
    
    echo json_encode([
        "success" => true,
        "table_exists" => true,
        "columns" => $columns,
        "sample_data" => $data,
        "count" => count($data)
    ]);
    
} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
