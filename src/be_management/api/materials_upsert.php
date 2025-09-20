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

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) throw new Exception('Invalid JSON');

    $required = ['ma_lo_trong','ngay','ten','so_luong'];
    foreach ($required as $k) {
        if (!isset($input[$k]) || $input[$k] === '') {
            http_response_code(400);
            echo json_encode(['success'=>false,'error'=>"Thiếu thông tin bắt buộc: $k"]);
            exit;
        }
    }

    $stmt = $pdo->prepare("INSERT INTO materials_usage(ma_lo_trong, ngay, ten, so_luong, don_vi)
                            VALUES(:ma, :ngay, :ten, :so_luong, :don_vi)");
    $stmt->execute([
        ':ma' => (int)$input['ma_lo_trong'],
        ':ngay' => $input['ngay'],
        ':ten' => $input['ten'],
        ':so_luong' => (float)$input['so_luong'],
        ':don_vi' => $input['don_vi'] ?? 'kg'
    ]);

    echo json_encode(['success'=>true, 'id'=>$pdo->lastInsertId()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([ 'success' => false, 'error' => $e->getMessage() ]);
}
?>


