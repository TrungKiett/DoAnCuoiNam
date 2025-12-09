<?php
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS')
    exit(0);

require_once __DIR__ . '/../../api/config.php'; // $pdo kết nối DB

// Lấy id nông dân từ query string
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
                vd.ma_van_de,
                vd.noi_dung,
                vd.loai_van_de,
                vd.ngay_bao_cao,
                vd.ma_nong_dan,
                vd.ma_lo_trong,
                vd.hinh_anh,
                vd.trang_thai,
                vd.ghi_chu,nd.ho_ten,
                dx.tai_lieu, dx.noi_dung_de_xuat,dx.ghi_chu,dx.ngay_de_xuat
            FROM van_de_bao_cao vd
            INNER JOIN nguoi_dung nd ON vd.ma_nong_dan = nd.ma_nguoi_dung
            join de_xuat_xu_ly dx on dx.ma_van_de= vd.ma_van_de
            WHERE vd.ma_nong_dan = :ma_nong_dan and vd.trang_thai= N'cho_xu_ly'
            ORDER BY vd.ngay_bao_cao DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':ma_nong_dan' => $farmerId]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Chuẩn hóa đường dẫn ảnh
    foreach ($data as &$row) {
        if (!empty($row['hinh_anh'])) {
            // Nếu DB lưu dạng "../../be_management/uploads/1759117179_NS.png"
            $fileName = basename($row['hinh_anh']);
            $row['hinh_anh'] = "http://localhost/doancuoinam/src/be_management/uploads/" . $fileName;
        }
    }

    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi: ' . $e->getMessage()
    ]);
}