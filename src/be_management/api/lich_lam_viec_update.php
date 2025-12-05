<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];

// ===== Lấy dữ liệu từ JSON =====
$id = $input['id'] ?? null;
$ma_nguoi_dung = $input['ma_nguoi_dung'] ?? null;
$trang_thai = $input['trang_thai'] ?? null;

$ten_cong_viec = $input['ten_cong_viec'] ?? null;
$mo_ta = $input['mo_ta'] ?? null;
$ngay_bat_dau = $input['ngay_bat_dau'] ?? null;
$ngay_ket_thuc = $input['ngay_ket_thuc'] ?? null;
$ket_qua = $input['ket_qua'] ?? null;
$ghi_chu = $input['ghi_chu'] ?? null;
$hinh_anh = $input['hinh_anh'] ?? null;
$thoi_gian_bat_dau = $input['thoi_gian_bat_dau'] ?? null;
$thoi_gian_ket_thuc = $input['thoi_gian_ket_thuc'] ?? null;

// ===== Check missing ID =====
if ($id === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing task ID"]);
    exit;
}

try {

    // ===== UPDATE lich_lam_viec =====
    $updateFields = [];
    $values = [];

    $fieldsMap = [
        'ten_cong_viec' => $ten_cong_viec,
        'mo_ta' => $mo_ta,
        'ngay_bat_dau' => $ngay_bat_dau,
        'ngay_ket_thuc' => $ngay_ket_thuc,
        'trang_thai' => $trang_thai,
        'ket_qua' => $ket_qua,
        'ghi_chu' => $ghi_chu,
        'hinh_anh' => $hinh_anh,
        'thoi_gian_bat_dau' => $thoi_gian_bat_dau,
        'thoi_gian_ket_thuc' => $thoi_gian_ket_thuc,
        'ma_nguoi_dung' => $ma_nguoi_dung
    ];

    foreach ($fieldsMap as $field => $val) {
        if ($val !== null) {
            $updateFields[] = "$field = ?";
            $values[] = $val;
        }
    }

    if (!empty($updateFields)) {
        $updateFields[] = "updated_at = NOW()";
        $values[] = $id;

        $sqlUpdate = "UPDATE lich_lam_viec SET " . implode(", ", $updateFields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sqlUpdate);
        $stmt->execute($values);
        $affectedRowsLLV = $stmt->rowCount();
    } else {
        $affectedRowsLLV = 0;
    }


    // Kiểm tra tồn tại lich_lam_viec_id
    $stmtCheck = $pdo->prepare("SELECT id FROM cham_cong WHERE lich_lam_viec_id = ?");
    $stmtCheck->execute([$id]);
    $existing = $stmtCheck->fetchColumn();

    if ($existing) {
        $stmtUpdateCC = $pdo->prepare("
            UPDATE cham_cong 
            SET ma_nguoi_dung = ?, trang_thai = ?, updated_at = NOW()
            WHERE lich_lam_viec_id = ?
        ");
        $stmtUpdateCC->execute([$ma_nguoi_dung, $trang_thai, $id]);

        $chamCongResult = [
            "action" => "updated",
            "affected_rows" => $stmtUpdateCC->rowCount()
        ];

    } else {
        $stmtInsertCC = $pdo->prepare("
            INSERT INTO cham_cong (lich_lam_viec_id, ma_nguoi_dung, trang_thai, created_at)
            VALUES (?, ?, ?, NOW())
        ");
        $stmtInsertCC->execute([$id, $ma_nguoi_dung, $trang_thai]);

        $chamCongResult = [
            "action" => "inserted",
            "id" => $pdo->lastInsertId(),
            "affected_rows" => $stmtInsertCC->rowCount()
        ];
    }

    // ===== Trả về kết quả =====
    echo json_encode([
        "success" => true,
        "lich_lam_viec_updated" => $affectedRowsLLV,
        "cham_cong" => $chamCongResult
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    error_log("Update lich_lam_viec / cham_cong error: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
        "code" => $e->getCode()
    ]);
}