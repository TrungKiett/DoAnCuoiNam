<?php
// Database connection config for XAMPP (phpMyAdmin)
// Update the database name below

// new
define('DB_NAME', 'farm');
define('DB_USER', 'root');
define('DB_PASSWORD', '');  
define('DB_HOST', 'localhost');
define('DB_PORT', '4306');
define('FONTEND_URL', 'http://localhost:3000');
define('BACKEND_URL', 'http://yensonfarm.io.vn/khoi_api/');
// end new

// Use central connection from controller/components/connect.php
require_once __DIR__ . '/../controller/components/connect.php';

header("Content-Type: application/json; charset=UTF-8");

// CORS: cho phép frontend localhost gọi
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Vary: Origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

// $pdo is provided by included connect.php; ensure it exists
if (!isset($pdo)) {
    http_response_code(500);
    echo json_encode(["error" => "DB connection not initialized"]);
    exit;
}


