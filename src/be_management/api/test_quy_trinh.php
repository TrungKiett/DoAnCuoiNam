<?php
require_once __DIR__ . '/config.php';

try {
    // Lấy tất cả dữ liệu từ bảng quy_trinh_canh_tac
    $stmt = $pdo->query("SELECT * FROM quy_trinh_canh_tac LIMIT 5");
    $data = $stmt->fetchAll();
    
    echo json_encode([
        "success" => true,
        "data" => $data
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
