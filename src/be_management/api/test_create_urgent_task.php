<?php
require_once __DIR__ . '/config.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

try {
    // Test connection
    $pdo->query("SELECT 1");
    
    // Debug input
    $debug_info = [
        "method" => $_SERVER['REQUEST_METHOD'],
        "input_received" => $input,
        "input_keys" => array_keys($input),
        "ten_nhiem_vu" => $input['ten_nhiem_vu'] ?? 'NOT_SET',
        "nguoi_tham_gia" => $input['nguoi_tham_gia'] ?? 'NOT_SET'
    ];
    
    // Check table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'nhiem_vu_khan_cap'");
    $table_exists = $stmt->rowCount() > 0;
    $debug_info["table_exists"] = $table_exists;
    
    if (!$table_exists) {
        $debug_info["message"] = "Table does not exist, will create it";
    }
    
    echo json_encode([
        "success" => true,
        "debug" => $debug_info
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage(),
        "debug" => [
            "method" => $_SERVER['REQUEST_METHOD'],
            "input" => $input
        ]
    ], JSON_UNESCAPED_UNICODE);
}
?>



