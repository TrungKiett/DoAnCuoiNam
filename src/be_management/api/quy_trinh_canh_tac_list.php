<?php
require_once __DIR__ . '/config.php';

try {
    // Kiểm tra xem bảng có tồn tại không
    $stmt = $pdo->query("SHOW TABLES LIKE 'quy_trinh_canh_tac'");
    if ($stmt->rowCount() == 0) {
        echo json_encode([
            "success" => false,
            "error" => "Bảng quy_trinh_canh_tac không tồn tại"
        ]);
        exit;
    }
    
    // Lấy tất cả dữ liệu không có điều kiện WHERE
    $stmt = $pdo->query("SELECT * FROM quy_trinh_canh_tac ORDER BY ma_quy_trinh");
    $processes = $stmt->fetchAll();
    
    echo json_encode([
        "success" => true,
        "data" => $processes
    ]);
    
} catch (Throwable $e) {
    http_response_code(500);
    error_log("List processes error: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>