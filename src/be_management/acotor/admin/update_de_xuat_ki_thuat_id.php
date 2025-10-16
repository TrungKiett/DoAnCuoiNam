<?php 
session_start();
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");

require_once __DIR__ . '/../../api/config.php'; 

try {
    if (!isset($_GET['ma_de_xuat'])) {
        echo json_encode(["status" => "error", "message" => "Thiếu mã đề xuất"]);
        exit;
    }

    $ma_de_xuat = $_GET['ma_de_xuat'];

    $sql = "SELECT dx.ma_de_xuat, dx.ma_van_de, dx.noi_dung_de_xuat, dx.ngay_de_xuat, 
                   dx.ma_quan_ly, dx.ghi_chu, dx.ma_nong_dan, dx.tai_lieu, dx.trang_thai, 
                   nd.ho_ten, vd.loai_van_de, vd.ma_lo_trong
            FROM de_xuat_xu_ly dx 
            JOIN nguoi_dung nd ON dx.ma_quan_ly = nd.ma_nguoi_dung
            JOIN van_de_bao_cao vd ON dx.ma_van_de = vd.ma_van_de
            WHERE dx.ma_de_xuat = ?";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$ma_de_xuat]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => $data
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>