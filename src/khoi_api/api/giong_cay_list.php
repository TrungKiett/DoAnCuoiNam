<?php
require_once __DIR__ . '/config.php';

try {
    // Optimized query - assume table exists
    $stmt = $pdo->query("SELECT ma_giong AS id, ten_giong FROM giong_cay ORDER BY ten_giong ASC");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "data" => $rows]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log('giong_cay_list error: ' . $e->getMessage());
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}


