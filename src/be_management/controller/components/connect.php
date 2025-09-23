<?php
// Unified DB connection for auth components
// Adjust these values if your MySQL differs
$db_name = 'mysql:host=127.0.0.1;dbname=farm;charset=utf8mb4';
$user_name = 'root';
$user_password = '';

try {
    $conn = new PDO($db_name, $user_name, $user_password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([ 'status' => 'error', 'message' => 'DB connect failed: '.$e->getMessage() ]);
    exit;
}
?>