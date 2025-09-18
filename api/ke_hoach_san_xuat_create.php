<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$ma_lo_trong = $input['ma_lo_trong'] ?? null;
$dien_tich_trong = $input['dien_tich_trong'] ?? null; // decimal(10,2)
$ngay_du_kien_thu_hoach = $input['ngay_du_kien_thu_hoach'] ?? null; // date
$ngay_bat_dau = $input['ngay_bat_dau'] ?? null; // date
$trang_thai = $input['trang_thai'] ?? null; // enum('chuan_bi','dang_trong','da_thu_hoach') or localized value mapping
$ma_nong_dan = $input['ma_nong_dan'] ?? null;
$ghi_chu = $input['ghi_chu'] ?? null;
$ma_giong = $input['ma_giong'] ?? null;

if ($ma_lo_trong === null || $dien_tich_trong === null || $trang_thai === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

try {
    // Debug: Log the input data
    error_log("Input data: " . json_encode($input));
    
    // Insert with optional fields
    $stmt = $pdo->prepare("INSERT INTO ke_hoach_san_xuat (ma_lo_trong, dien_tich_trong, ngay_bat_dau, ngay_du_kien_thu_hoach, trang_thai, ma_nong_dan, ghi_chu, ma_giong) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$ma_lo_trong, $dien_tich_trong, $ngay_bat_dau, $ngay_du_kien_thu_hoach, $trang_thai, $ma_nong_dan, $ghi_chu, $ma_giong]);
    echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("Database error: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => $e->getMessage(), "details" => "Check server logs for more info"]);
}


