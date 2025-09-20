<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$ma_lo_trong = $input['ma_lo_trong'] ?? null;
$dien_tich_trong = $input['dien_tich_trong'] ?? null; // decimal(10,2)
$ngay_du_kien_thu_hoach = $input['ngay_du_kien_thu_hoach'] ?? null; // date
$ngay_bat_dau = $input['ngay_bat_dau'] ?? null; // date
$trang_thai = $input['trang_thai'] ?? null; // enum('chuan_bi','dang_trong','da_thu_hoach') or localized value mapping
$so_luong_nhan_cong = $input['so_luong_nhan_cong'] ?? null;
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
    
    // Check if table exists and has the right structure
    $stmt = $pdo->query("SHOW COLUMNS FROM ke_hoach_san_xuat LIKE 'so_luong_nhan_cong'");
    if ($stmt->rowCount() == 0) {
        throw new Exception("Column 'so_luong_nhan_cong' does not exist in ke_hoach_san_xuat table. Please run update_database.php first.");
    }
    
    // Insert with optional fields
    $stmt = $pdo->prepare("INSERT INTO ke_hoach_san_xuat (ma_lo_trong, dien_tich_trong, ngay_bat_dau, ngay_du_kien_thu_hoach, trang_thai, so_luong_nhan_cong, ghi_chu, ma_giong) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$ma_lo_trong, $dien_tich_trong, $ngay_bat_dau, $ngay_du_kien_thu_hoach, $trang_thai, $so_luong_nhan_cong, $ghi_chu, $ma_giong]);
    
    $insertedId = $pdo->lastInsertId();
    error_log("Successfully created plan with ID: " . $insertedId);
    
    echo json_encode([
        "success" => true, 
        "id" => $insertedId,
        "message" => "Kế hoạch đã được tạo thành công"
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("Database error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage(),
        "details" => "Database operation failed. Check server logs for more info.",
        "input_data" => $input
    ]);
}


