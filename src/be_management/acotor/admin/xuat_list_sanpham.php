<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

require_once __DIR__ . '/../../api/config.php'; // đã có $pdo

try {
    // Nếu có ma_giong được gửi lên, kiểm tra có QR chưa
    if (isset($_GET['ma_giong'])) {
        $ma_giong = $_GET['ma_giong'];

        $sqlCheck = "SELECT COUNT(*) AS total FROM truy_xuat_nguon_goc WHERE ma_giong = ?";
        $stmtCheck = $pdo->prepare($sqlCheck);
        $stmtCheck->execute([$ma_giong]);
        $row = $stmtCheck->fetch(PDO::FETCH_ASSOC);

        if ($row['total'] == 0) {
            // Nếu chưa có mã QR -> chuyển sang trang tạo mã QR
            header("Location: http://localhost/doancuoinam/src/be_management/acotor/admin/tao_qrcode_sanpham.php?ma_giong=$ma_giong");
            exit();
        } else {
            echo json_encode([
                "status" => "info",
                "message" => "Giống cây đã có mã QR."
            ]);
            exit();
        }
    }

    // 1. Lấy tất cả giống cây
    $sql1 = "SELECT ma_giong, ten_giong,  nha_cung_cap, so_luong_ton, ngay_mua FROM giong_cay";
    $stmt1 = $pdo->prepare($sql1);
    $stmt1->execute();
    $allCrops = $stmt1->fetchAll(PDO::FETCH_ASSOC);

    // 2. Lấy giống cây đã có QR (chỉ lấy 1 QR duy nhất cho mỗi ma_giong)
    $sql2 = "SELECT gc.ma_giong, gc.ten_giong,  gc.nha_cung_cap, gc.so_luong_ton, gc.ngay_mua, MIN(qr.ma_qr) AS ma_qr
             FROM giong_cay gc
             JOIN truy_xuat_nguon_goc qr ON gc.ma_giong = qr.ma_giong
             GROUP BY gc.ma_giong";
    $stmt2 = $pdo->prepare($sql2);
    $stmt2->execute();
    $cropsWithQr = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    // Tạo mảng check
    $qrMap = [];
    foreach ($cropsWithQr as $row) {
        $qrMap[$row['ma_giong']] = $row['ma_qr'];
    }

    // 3. Gắn trạng thái QR
    $result = [];
    foreach ($allCrops as $row) {
        $ma_giong = $row['ma_giong'];
        if (isset($qrMap[$ma_giong])) {
            $row['ma_qr'] = $qrMap[$ma_giong];
            $row['can_create_qr'] = false;
        } else {
            $row['ma_qr'] = null;
            $row['can_create_qr'] = true;
        }
        $result[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "data" => $result
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}