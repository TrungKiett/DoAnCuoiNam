<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$ma_ke_hoach = $input['ma_ke_hoach'] ?? null;
$ten_cong_viec = $input['ten_cong_viec'] ?? null;
$mo_ta = $input['mo_ta'] ?? null;
$loai_cong_viec = $input['loai_cong_viec'] ?? null;
$ngay_bat_dau = $input['ngay_bat_dau'] ?? null;
$thoi_gian_bat_dau = $input['thoi_gian_bat_dau'] ?? null;
$ngay_ket_thuc = $input['ngay_ket_thuc'] ?? null;
$thoi_gian_ket_thuc = $input['thoi_gian_ket_thuc'] ?? null;
$thoi_gian_du_kien = $input['thoi_gian_du_kien'] ?? 1;
$trang_thai = $input['trang_thai'] ?? 'chua_bat_dau';
$uu_tien = $input['uu_tien'] ?? 'trung_binh';
$ma_nguoi_dung = $input['ma_nguoi_dung'] ?? null;
$ghi_chu = $input['ghi_chu'] ?? null;
$ket_qua = $input['ket_qua'] ?? null;
$hinh_anh = $input['hinh_anh'] ?? null;

if ($ten_cong_viec === null || $loai_cong_viec === null || $ngay_bat_dau === null || $ngay_ket_thuc === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

// Allow ma_ke_hoach to be NULL for independent tasks
if ($ma_ke_hoach === '' || $ma_ke_hoach === 'null') {
    $ma_ke_hoach = null;
}

try {
    // Debug: Log the input data
    error_log("Create lich_lam_viec input: " . json_encode($input));
    
    $stmt = $pdo->prepare(
        "
        INSERT INTO lich_lam_viec (
            ma_ke_hoach, ten_cong_viec, mo_ta, loai_cong_viec, 
            ngay_bat_dau, thoi_gian_bat_dau, ngay_ket_thuc, thoi_gian_ket_thuc, thoi_gian_du_kien, 
            trang_thai, uu_tien, ma_nguoi_dung, 
            ghi_chu, ket_qua, hinh_anh
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    
    $stmt->execute([
        $ma_ke_hoach, $ten_cong_viec, $mo_ta, $loai_cong_viec,
        $ngay_bat_dau, $thoi_gian_bat_dau, $ngay_ket_thuc, $thoi_gian_ket_thuc, $thoi_gian_du_kien,
        $trang_thai, $uu_tien, $ma_nguoi_dung,
        $ghi_chu, $ket_qua, $hinh_anh
    ]);
    
    echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("Create lich_lam_viec error: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
