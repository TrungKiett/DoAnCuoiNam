<?php
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once __DIR__ . '/../../api/config.php';  

try {
    // Đọc JSON từ React gửi xuống
    $input = json_decode(file_get_contents("php://input"), true);

    $ma_van_de       = $input['ma_van_de'] ?? null;
    $noi_dung_de_xuat = $input['noi_dung_de_xuat'] ?? null;
date_default_timezone_set('Asia/Ho_Chi_Minh');
$ngay_de_xuat = date('Y-m-d H:i:s');    $ma_quan_ly       = $input['ma_quan_ly'] ?? null;
    $ma_nong_dan      = $input['ma_nong_dan'] ?? null;
    $tai_lieu         = $input['tai_lieu'] ?? null;
    $trang_thai       = $input['trang_thai'] ?? 'da_gui';
    $ghi_chu          = $input['ghi_chu'] ?? null;

     if (!$ma_van_de || !$ma_quan_ly || !$ma_nong_dan) {
        echo json_encode([
            'success' => false,
            'message' => 'Thiếu dữ liệu bắt buộc: ma_van_de / ma_quan_ly / ma_nong_dan'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $sql = "INSERT INTO de_xuat_xu_ly 
            (ma_van_de, noi_dung_de_xuat, ngay_de_xuat, ma_quan_ly, ma_nong_dan, tai_lieu, trang_thai, ghi_chu)
            VALUES (:ma_van_de, :noi_dung_de_xuat, :ngay_de_xuat, :ma_quan_ly, :ma_nong_dan, :tai_lieu, :trang_thai, :ghi_chu)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':ma_van_de' => $ma_van_de,
        ':noi_dung_de_xuat' => $noi_dung_de_xuat,
        ':ngay_de_xuat' => $ngay_de_xuat,
        ':ma_quan_ly' => $ma_quan_ly,
        ':ma_nong_dan' => $ma_nong_dan,
        ':tai_lieu' => $tai_lieu,
        ':trang_thai' => $trang_thai,
        ':ghi_chu' => $ghi_chu
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Thêm đề xuất thành công',
        'insert_id' => $pdo->lastInsertId()
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}