<?php
// Test file để debug API create_urgent_task
require_once __DIR__ . '/config.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // Test connection
    $pdo->query("SELECT 1");
    echo json_encode([
        "success" => true,
        "message" => "Database connection OK",
        "database" => "farm"
    ]);
    
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ]);
}
?>



































