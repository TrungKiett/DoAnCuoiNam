<?php
require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');

try {
    // Get all farmers (nong_dan) with their details
    $stmt = $pdo->query("
        SELECT 
            ma_nguoi_dung AS id, 
            ho_ten AS full_name, 
            so_dien_thoai AS phone,
            email,
            vai_tro
        FROM nguoi_dung 
        WHERE vai_tro = 'nong_dan' 
        ORDER BY ho_ten
    ");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true, 
        "data" => $rows,
        "count" => count($rows)
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
