<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$id = $input['id'] ?? null;
$trang_thai = $input['trang_thai'] ?? null;
$ket_qua = $input['ket_qua'] ?? null;
$ghi_chu = $input['ghi_chu'] ?? null;
$hinh_anh = $input['hinh_anh'] ?? null;
$thoi_gian_bat_dau = $input['thoi_gian_bat_dau'] ?? null;
$thoi_gian_ket_thuc = $input['thoi_gian_ket_thuc'] ?? null;

if ($id === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing task ID"]);
    exit;
}

try {
    // Build dynamic update query
    $updateFields = [];
    $values = [];
    
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
    
    if (empty($updateFields)) {
        echo json_encode(["success" => false, "error" => "No fields to update"]);
        exit;
    }
    
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
