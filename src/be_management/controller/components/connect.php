<?php
$db_name = 'mysql:host=127.0.0.1;port=3306;dbname=farm;charset=utf8mb4';
// $db_name = 'mysql:host=127.0.0.1;dbname=quan_li_bv;charset=utf8mb4';
$user_name = 'root';
$user_password = '';

try {
    $conn = new PDO($db_name, $user_name, $user_password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $pdo = $conn;
} catch (Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([ 'status' => 'error', 'message' => 'DB connect failed: '.$e->getMessage() ]);
    exit;
}
?>
