<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");

// Kết nối DB
require_once __DIR__ . '/../../api/config.php';

try {
    // Kiểm tra tham số ma_giong
    if (!isset($_GET['ma_giong'])) {
        echo json_encode([
            "status" => "error",
            "message" => "Thiếu tham số ma_giong"
        ]);
        exit;
    }

    $ma_giong = $_GET['ma_giong'];

    // Lấy thông tin chi tiết của giống cây (JOIN các bảng liên quan)
    $sql = "SELECT 
                GC.ma_giong,
                GC.ten_giong, 
                LT.ma_lo_trong, 
                LT.ngay_gieo, 
                KH.dien_tich_trong,
                GC.nha_cung_cap,
                GC.so_luong_ton,
                GC.ngay_mua,
                QR.ma_qr
             FROM giong_cay GC
            LEFT JOIN lo_trong LT ON GC.ma_giong = LT.ma_giong
            LEFT JOIN ke_hoach_san_xuat KH ON KH.ma_lo_trong = LT.ma_lo_trong
            LEFT JOIN truy_xuat_nguon_goc QR ON QR.ma_giong = GC.ma_giong
            WHERE GC.ma_giong = ?
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$ma_giong]);
    $info = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$info) {
        echo json_encode([
            "status" => "error",
            "message" => "Không tìm thấy thông tin giống cây"
        ]);
        exit;
    }

    echo json_encode([
        "status" => "success",
        "data" => $info
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}