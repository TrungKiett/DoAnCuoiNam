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

// Convert ma_nguoi_dung to array if it's not already
$ma_nguoi_dung_array = [];
if (is_array($ma_nguoi_dung)) {
    $ma_nguoi_dung_array = $ma_nguoi_dung;
} elseif ($ma_nguoi_dung !== null && $ma_nguoi_dung !== '') {
    // If it's a string (could be comma-separated), split it
    $ma_nguoi_dung_array = array_map('trim', explode(',', $ma_nguoi_dung));
}

// If no users specified, create one record with NULL
if (empty($ma_nguoi_dung_array)) {
    $ma_nguoi_dung_array = [null];
}

try {
    // Debug: Log the input data
    error_log("Create lich_lam_viec input: " . json_encode($input));
    
    $pdo->beginTransaction();
    
    $stmt = $pdo->prepare(
        "
        INSERT INTO lich_lam_viec (
            ma_ke_hoach, ten_cong_viec, mo_ta, loai_cong_viec, 
            ngay_bat_dau, thoi_gian_bat_dau, ngay_ket_thuc, thoi_gian_ket_thuc, thoi_gian_du_kien, 
            trang_thai, uu_tien, ma_nguoi_dung, 
            ghi_chu, ket_qua, hinh_anh
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    
    $inserted_ids = [];
    
    // Create a separate record for each user
    foreach ($ma_nguoi_dung_array as $user_id) {
        $stmt->execute([
            $ma_ke_hoach, $ten_cong_viec, $mo_ta, $loai_cong_viec,
            $ngay_bat_dau, $thoi_gian_bat_dau, $ngay_ket_thuc, $thoi_gian_ket_thuc, $thoi_gian_du_kien,
            $trang_thai, $uu_tien, $user_id,
            $ghi_chu, $ket_qua, $hinh_anh
        ]);
        
        $inserted_ids[] = $pdo->lastInsertId();
    }
    
    $pdo->commit();
    
    echo json_encode([
        "success" => true, 
        "ids" => $inserted_ids,
        "count" => count($inserted_ids)
    ]);
    
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    error_log("Create lich_lam_viec error: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}