<?php
require_once __DIR__ . '/config.php';

header("Content-Type: application/json; charset=UTF-8");

try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS materials_usage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ma_lo_trong INT NOT NULL,
        ngay DATE NOT NULL,
        ten VARCHAR(255) NOT NULL,
        so_luong DECIMAL(10,2) NOT NULL,
        don_vi VARCHAR(50) DEFAULT 'kg',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    $where = '';
    if (isset($_GET['ma_lo_trong'])) {
        $where = 'WHERE ma_lo_trong = :ma';
    }
    $stmt = $pdo->prepare("SELECT * FROM materials_usage $where ORDER BY ngay DESC, id DESC");
    if ($where) $stmt->bindValue(':ma', (int)$_GET['ma_lo_trong'], PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();
    echo json_encode([ 'success' => true, 'data' => $rows ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([ 'success' => false, 'error' => $e->getMessage() ]);
}
?>


