<?php
require_once __DIR__ . '/config.php';

try {
    // If table doesn't exist, return empty list gracefully
    $stmt = $pdo->query("SHOW TABLES LIKE 'giong_cay'");
    if ($stmt->rowCount() == 0) {
        echo json_encode(["success" => true, "data" => []]);
        exit;
    }

    // Map primary key ma_giong to id for frontend convenience
    $stmt = $pdo->query("SELECT ma_giong AS id, ten_giong FROM giong_cay ORDER BY ten_giong ASC");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "data" => $rows]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log('giong_cay_list error: ' . $e->getMessage());
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}


