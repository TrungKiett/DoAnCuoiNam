<?php
// Database connection config for XAMPP (phpMyAdmin)
// Update the database name below

// Use central connection from controller/components/connect.php
require_once __DIR__ . '/../controller/components/connect.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

// $pdo is provided by included connect.php; ensure it exists
if (!isset($pdo)) {
    http_response_code(500);
    echo json_encode(["error" => "DB connection not initialized"]);
    exit;
}


