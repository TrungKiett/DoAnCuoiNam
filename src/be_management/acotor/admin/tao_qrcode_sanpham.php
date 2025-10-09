<?php
header('Content-Type: application/json; charset=utf-8');

// Kết nối DB qua config.php (PDO)
require_once __DIR__ . '/../../api/config.php';

// Thư viện QR code phpqrcode
require_once('../../../../vendor/testqr/phpqrcode/qrlib.php');

try {
    // Lấy tham số ma_giong từ URL
    if (!isset($_GET['ma_giong'])) {
        echo json_encode(["status" => "error", "message" => "Thiếu tham số ma_giong"]);
        exit;
    }
    $ma_giong = $_GET['ma_giong'];

    // Kiểm tra giống cây đã có QR chưa
    $check = $conn->prepare("SELECT ma_qr, thong_tin_truy_xuat 
                             FROM truy_xuat_nguon_goc 
                             WHERE ma_giong = ? LIMIT 1");
    $check->execute([$ma_giong]);
    $existQr = $check->fetch(PDO::FETCH_ASSOC);

    if ($existQr) {
        // Nếu đã có QR thì trả về thông tin cũ
        echo json_encode([
            "status" => "exists",
            "message" => "Giống cây này đã có QR",
            "ma_qr" => $existQr['ma_qr'],
            "thong_tin" => $existQr['thong_tin_truy_xuat'],
            "qr_url" => "http://localhost/doancuoinam/src/be_management/acotor/uploads/" . $existQr['ma_qr']
        ]);
        exit;
    }

    // Lấy dữ liệu từ bảng để tạo QR
    $sql = "SELECT GC.ten_giong, LT.ma_lo_trong, LT.ngay_gieo, KH.dien_tich_trong
            FROM giong_cay GC
            JOIN lo_trong LT ON GC.ma_giong = LT.ma_giong
            JOIN ke_hoach_san_xuat KH ON KH.ma_lo_trong = LT.ma_lo_trong
            WHERE GC.ma_giong = ?
            LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$ma_giong]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        echo json_encode(["status" => "error", "message" => "Không có dữ liệu"]);
        exit;
    }

    // Chuẩn bị dữ liệu đưa vào QR
    $thongTin = "Giống: {$row['ten_giong']}\n"
        . "Lô trồng: {$row['ma_lo_trong']}\n"
        . "Ngày gieo: {$row['ngay_gieo']}\n"
        . "Diện tích: {$row['dien_tich_trong']}";

    // Thư mục lưu QR code (đồng bộ với URL trả về)
    $qrDir = __DIR__ . '/../uploads/';
    if (!file_exists($qrDir)) {
        mkdir($qrDir, 0777, true);
    }

    // Tạo mã gói duy nhất
    $maGoi = uniqid("GOI_");
    $qrFile = $qrDir . $maGoi . ".png";

    // Tạo QR bằng phpqrcode
    QRcode::png($thongTin, $qrFile, QR_ECLEVEL_L, 6);

    // Insert vào bảng truy_xuat_nguon_goc
    $stmt = $conn->prepare("INSERT INTO truy_xuat_nguon_goc (ma_qr, thong_tin_truy_xuat, ma_giong) VALUES (?, ?, ?)");
    $stmt->execute([$maGoi . ".png", $thongTin, $ma_giong]);

    // Trả JSON cho frontend React
    echo json_encode([
        "status" => "success",
        "ma_goi" => $maGoi,
        "ma_qr" => $maGoi . ".png",
        "thong_tin" => $thongTin,
        "qr_url" => "http://localhost/doancuoinam/src/be_management/acotor/uploads/" . $maGoi . ".png"
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}