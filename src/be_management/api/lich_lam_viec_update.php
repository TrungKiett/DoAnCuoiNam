<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$id = $input['id'] ?? null;
$ten_cong_viec = $input['ten_cong_viec'] ?? null;
$mo_ta = $input['mo_ta'] ?? null;
$ngay_bat_dau = $input['ngay_bat_dau'] ?? null; // YYYY-MM-DD
$ngay_ket_thuc = $input['ngay_ket_thuc'] ?? null; // YYYY-MM-DD
$trang_thai = $input['trang_thai'] ?? null;
$ket_qua = $input['ket_qua'] ?? null;
$ghi_chu = $input['ghi_chu'] ?? null;
$hinh_anh = $input['hinh_anh'] ?? null;
$thoi_gian_bat_dau = $input['thoi_gian_bat_dau'] ?? null;
$thoi_gian_ket_thuc = $input['thoi_gian_ket_thuc'] ?? null;
$ma_nguoi_dung = $input['ma_nguoi_dung'] ?? null;

if ($id === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing task ID"]);
    exit;
}

try {
    // Build dynamic update query
    $updateFields = [];
    $values = [];
    
    if ($ten_cong_viec !== null) {
        $updateFields[] = "ten_cong_viec = ?";
        $values[] = $ten_cong_viec;
    }
    
    if ($mo_ta !== null) {
        $updateFields[] = "mo_ta = ?";
        $values[] = $mo_ta;
    }

    if ($ngay_bat_dau !== null) {
        $updateFields[] = "ngay_bat_dau = ?";
        $values[] = $ngay_bat_dau;
    }
    
    if ($ngay_ket_thuc !== null) {
        $updateFields[] = "ngay_ket_thuc = ?";
        $values[] = $ngay_ket_thuc;
    }

    if ($trang_thai !== null) {
        $updateFields[] = "trang_thai = ?";
        $values[] = $trang_thai;
    }
    
    if ($ket_qua !== null) {
        $updateFields[] = "ket_qua = ?";
        $values[] = $ket_qua;
    }
    
    if ($ghi_chu !== null) {
        $updateFields[] = "ghi_chu = ?";
        $values[] = $ghi_chu;
    }
    
    if ($hinh_anh !== null) {
        $updateFields[] = "hinh_anh = ?";
        $values[] = $hinh_anh;
    }
    
    if ($thoi_gian_bat_dau !== null) {
        $updateFields[] = "thoi_gian_bat_dau = ?";
        $values[] = $thoi_gian_bat_dau;
    }
    
    if ($thoi_gian_ket_thuc !== null) {
        $updateFields[] = "thoi_gian_ket_thuc = ?";
        $values[] = $thoi_gian_ket_thuc;
    }
    
    if ($ma_nguoi_dung !== null) {
        $updateFields[] = "ma_nguoi_dung = ?";
        $values[] = $ma_nguoi_dung;
    }
    
    if (empty($updateFields)) {
        echo json_encode(["success" => false, "error" => "No fields to update"]);
        exit;
    }
    
    // Always bump updated_at when updating
    $updateFields[] = "updated_at = NOW()";
    $values[] = $id;
    $sql = "UPDATE lich_lam_viec SET " . implode(", ", $updateFields) . " WHERE id = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);
    
    echo json_encode(["success" => true, "affected_rows" => $stmt->rowCount()]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("Update lich_lam_viec error: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
