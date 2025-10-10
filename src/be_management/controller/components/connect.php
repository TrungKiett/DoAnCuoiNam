<?php
// Unified DB connection for auth components
$host = 'localhost';
$port = 4306; // port MySQL trên XAMPP
$db   = 'test_kl_demo';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";

try {
    $conn = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    // Expose PDO instance for APIs that include config.php
    $pdo = $conn;
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'status'  => 'error',
        'message' => 'DB connect failed: ' . $e->getMessage()
    ]);
    exit;
}
?>