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
$ma_nguoi_dung = $input['ma_nguoi_dung'] ?? null; // có thể là mảng hoặc chuỗi
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
    
    // Chuẩn hóa danh sách ma_nguoi_dung -> mảng các mã số (loại bỏ tiền tố ND, trim, bỏ trống, unique)
    $maNguoiDungList = [];
    if (is_array($ma_nguoi_dung)) {
        $maNguoiDungList = $ma_nguoi_dung;
    } elseif (is_string($ma_nguoi_dung) && $ma_nguoi_dung !== '') {
        // Chuỗi có thể dạng "20,21" hoặc "ND020, ND021"
        $maNguoiDungList = explode(',', $ma_nguoi_dung);
    } elseif ($ma_nguoi_dung !== null && $ma_nguoi_dung !== '') {
        $maNguoiDungList = [$ma_nguoi_dung];
    }

    $maNguoiDungList = array_values(array_filter(array_map(function($item) {
        $val = trim(strval($item));
        if ($val === '') return null;
        if (preg_match('/^ND(\d+)$/i', $val, $m)) {
            $val = $m[1]; // bỏ tiền tố ND
        }
        return strval(intval($val));
    }, $maNguoiDungList)));

    // Loại bỏ giá trị rỗng và trùng lặp
    $maNguoiDungList = array_values(array_unique(array_filter($maNguoiDungList, fn($v) => $v !== '')));

    // Lưu xuống DB ở dạng chuỗi, phục vụ giao diện hiện tại
    $maNguoiDungCsv = !empty($maNguoiDungList) ? implode(',', $maNguoiDungList) : null;

    $stmt->execute([
        $ma_ke_hoach, $ten_cong_viec, $mo_ta, $loai_cong_viec,
        $ngay_bat_dau, $thoi_gian_bat_dau, $ngay_ket_thuc, $thoi_gian_ket_thuc, $thoi_gian_du_kien,
        $trang_thai, $uu_tien, $maNguoiDungCsv,
        $ghi_chu, $ket_qua, $hinh_anh
    ]);
    
    $lichLamViecId = $pdo->lastInsertId();

    // Tự động tạo bản ghi cham_cong cho từng người (nếu có danh sách)
    if (!empty($maNguoiDungList)) {
        $ngayLamViec = $ngay_bat_dau ?: date('Y-m-d');

        // Chuẩn bị statement kiểm tra/insert
        $checkStmt = $pdo->prepare("
            SELECT id FROM cham_cong 
            WHERE lich_lam_viec_id = ? AND ma_nguoi_dung = ? AND ngay = ?
        ");

        $insertStmt = $pdo->prepare("
            INSERT INTO cham_cong (
                lich_lam_viec_id, ma_nguoi_dung, ngay, trang_thai, ghi_chu, created_at, updated_at
            ) VALUES (?, ?, ?, 'chua_bat_dau', ?, NOW(), NOW())
        ");

        foreach ($maNguoiDungList as $maNguoiDung) {
            // Nếu đã tồn tại bản ghi (tránh trùng), bỏ qua
            $checkStmt->execute([$lichLamViecId, $maNguoiDung, $ngayLamViec]);
            $existingId = $checkStmt->fetchColumn();
            if ($existingId) {
                continue;
            }
            $insertStmt->execute([$lichLamViecId, $maNguoiDung, $ngayLamViec, $ghi_chu]);
        }
    }

    echo json_encode(["success" => true, "id" => $lichLamViecId]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("Create lich_lam_viec error: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
