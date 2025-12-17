<?php
require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');

try {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $workerId = $input['worker_id'] ?? null;
    $hourlyRate = isset($input['hourly_rate']) ? floatval($input['hourly_rate']) : null;
    $periodStart = $input['period_start'] ?? null;
    $periodEnd = $input['period_end'] ?? null;
    
    if ($workerId === null || $hourlyRate === null) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "error" => "Missing worker_id or hourly_rate"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // Format worker ID as "ND001" format
    $maNguoiDungFormat = 'ND' . str_pad($workerId, 3, '0', STR_PAD_LEFT);
    
    // Determine week number from period dates if needed
    $weekNumber = 1; // Default to week 1
    $year = date('Y');
    
    if ($periodStart) {
        $startDate = new DateTime($periodStart);
        $year = $startDate->format('Y');
        $weekNumber = (int)date('W', $startDate->getTimestamp());
    }
    
    // Get existing entry for this worker
    $checkStmt = $pdo->prepare("SELECT * FROM bang_luong WHERE ma_nguoi_dung = ? AND tuan = ? AND nam = ?");
    $checkStmt->execute([$maNguoiDungFormat, $weekNumber, $year]);
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    // Update or insert
    if ($existing) {
        // Update existing entry
        $updateStmt = $pdo->prepare("
            UPDATE bang_luong 
            SET muc_luong_gio = ?, 
                tong_thu_nhap = tong_gio_lam * ?,
                ngay_tao = CURRENT_TIMESTAMP
            WHERE id_luong = ?
        ");
        $updateStmt->execute([$hourlyRate, $hourlyRate, $existing['id_luong']]);
    } else {
        // Insert new entry
        $insertStmt = $pdo->prepare("
            INSERT INTO bang_luong (
                ten_bang, 
                ma_nguoi_dung, 
                tong_gio_lam, 
                muc_luong_gio, 
                tong_thu_nhap, 
                trang_thai, 
                tuan, 
                nam, 
                ngay_tao
            )
            VALUES(?, ?, 0, ?, 0, 'Chờ duyệt', ?, ?, CURRENT_TIMESTAMP)
        ");
        
        $periodName = "Chi tiết Bảng lương - Tuần $weekNumber/$year";
        $insertStmt->execute([$periodName, $maNguoiDungFormat, $hourlyRate, $weekNumber, $year]);
    }
    
    echo json_encode(["success" => true], JSON_UNESCAPED_UNICODE);
    
} catch (Throwable $e) {
    http_response_code(500);
    error_log('update_hourly_rate error: ' . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

