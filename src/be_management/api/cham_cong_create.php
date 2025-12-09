<?php
require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$lich_lam_viec_id = $input['lich_lam_viec_id'] ?? null;
$ma_nguoi_dung_list = $input['ma_nguoi_dung'] ?? []; // Mảng các ID người dùng
$ngay = $input['ngay'] ?? null;
$trang_thai = $input['trang_thai'] ?? 'hoan_thanh';
$ghi_chu = $input['ghi_chu'] ?? null;

if ($lich_lam_viec_id === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing lich_lam_viec_id"]);
    exit;
}

if (empty($ma_nguoi_dung_list) || !is_array($ma_nguoi_dung_list)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "ma_nguoi_dung phải là mảng không rỗng"]);
    exit;
}

if ($ngay === null) {
    // Lấy ngày từ lich_lam_viec nếu không có
    try {
        $stmtNgay = $pdo->prepare("SELECT ngay_bat_dau FROM lich_lam_viec WHERE id = ?");
        $stmtNgay->execute([$lich_lam_viec_id]);
        $ngay = $stmtNgay->fetchColumn();
        if (!$ngay) {
            $ngay = date('Y-m-d');
        }
    } catch (Exception $e) {
        $ngay = date('Y-m-d');
    }
}

try {
    $checkStmt = $pdo->prepare("
        SELECT id FROM cham_cong 
        WHERE lich_lam_viec_id = ? AND ma_nguoi_dung = ? AND ngay = ?
    ");
    
    $insertStmt = $pdo->prepare("
        INSERT INTO cham_cong (
            lich_lam_viec_id, ma_nguoi_dung, ngay, trang_thai, ghi_chu, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    ");
    
    $updateStmt = $pdo->prepare("
        UPDATE cham_cong 
        SET trang_thai = ?, 
            ghi_chu = COALESCE(?, ghi_chu),
            updated_at = NOW()
        WHERE id = ?
    ");
    
    $inserted = 0;
    $updated = 0;
    
    foreach ($ma_nguoi_dung_list as $ma_nguoi_dung) {
        // Chuẩn hóa ma_nguoi_dung
        $maNguoiDungNormalized = strval($ma_nguoi_dung);
        if (preg_match('/^ND(\d+)$/i', $maNguoiDungNormalized, $matches)) {
            $maNguoiDungNormalized = $matches[1];
        } else {
            $maNguoiDungNormalized = strval(intval($maNguoiDungNormalized));
        }
        
        // Kiểm tra record đã tồn tại chưa
        $checkStmt->execute([$lich_lam_viec_id, $maNguoiDungNormalized, $ngay]);
        $existingId = $checkStmt->fetchColumn();
        
        if ($existingId) {
            // Cập nhật record đã tồn tại
            $updateStmt->execute([$trang_thai, $ghi_chu, $existingId]);
            $updated += $updateStmt->rowCount();
        } else {
            // Tạo mới record
            $insertStmt->execute([$lich_lam_viec_id, $maNguoiDungNormalized, $ngay, $trang_thai, $ghi_chu]);
            $inserted += 1;
        }
    }
    
    echo json_encode([
        "success" => true,
        "inserted" => $inserted,
        "updated" => $updated,
        "total" => count($ma_nguoi_dung_list)
    ]);
    
} catch (Throwable $e) {
    http_response_code(500);
    error_log("Create cham_cong error: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>

