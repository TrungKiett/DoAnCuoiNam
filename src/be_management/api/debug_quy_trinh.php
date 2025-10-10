<?php
require_once __DIR__ . '/config.php';

try {
    // Kiểm tra cấu trúc bảng
    $stmt = $pdo->query("DESCRIBE quy_trinh_canh_tac");
    $columns = $stmt->fetchAll();
    
    // Lấy dữ liệu mẫu
    $stmt = $pdo->query("SELECT * FROM quy_trinh_canh_tac LIMIT 3");
    $data = $stmt->fetchAll();
    
    echo json_encode([
        "success" => true,
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
