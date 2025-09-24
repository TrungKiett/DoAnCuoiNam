<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Kết nối database
$host = "localhost";
$db = "farm";
$user = "root";
$pass = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Thêm cột updated_at nếu chưa có
    $stmt = $pdo->query("SHOW COLUMNS FROM lich_lam_viec LIKE 'updated_at'");
    $columnExists = $stmt->fetch();
    
    if (!$columnExists) {
        $pdo->exec("ALTER TABLE lich_lam_viec ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        echo json_encode(['success' => true, 'message' => 'Đã thêm cột updated_at']);
    } else {
        echo json_encode(['success' => true, 'message' => 'Cột updated_at đã tồn tại']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()]);
}
?>
