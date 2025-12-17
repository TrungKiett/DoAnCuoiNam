<?php
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../../api/config.php'; 

 $farmerId = $_GET['ma_nong_dan'] ?? null;

if (!$farmerId) {
    echo json_encode([
        'success' => false,
        'message' => 'Thiếu mã nông dân'
    ]);
    exit;
}

try {
     $sql = "SELECT 
                *
            FROM thu_hoach
            WHERE ma_nong_dan = :ma_nong_dan
             ORDER BY ngay_thu_hoach DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':ma_nong_dan' => $farmerId]);

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi: ' . $e->getMessage()
    ]);
}