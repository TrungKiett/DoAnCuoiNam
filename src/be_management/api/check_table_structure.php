<?php
require_once __DIR__ . '/config.php';

try {
    // Kiểm tra cấu trúc bảng quy_trinh_canh_tac
    $stmt = $pdo->query("DESCRIBE quy_trinh_canh_tac");
    $columns = $stmt->fetchAll();
    
    echo json_encode([
        "success" => true,
        "quy_trinh_canh_tac_columns" => $columns
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
