<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

require_once __DIR__ . '/../../api/config.php'; // đã có $pdo

try {
    $sql = "SELECT ma_giong,ten_giong, ma_loai_cay,nha_cung_cap,so_luong_ton,ngay_mua
            FROM giong_cay";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $crops = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => $crops
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}