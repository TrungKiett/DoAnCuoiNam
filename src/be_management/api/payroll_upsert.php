<?php
require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');

try {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $workerId = $input['worker_id'] ?? null; // numeric id
    $totalHours = isset($input['total_hours']) ? floatval($input['total_hours']) : null;
    $hourlyRate = isset($input['hourly_rate']) ? floatval($input['hourly_rate']) : null;
    $status = $input['status'] ?? 'pending'; // pending | approved | paid | (VN variants)
    $week = isset($input['week']) ? intval($input['week']) : null;
    $year = isset($input['year']) ? intval($input['year']) : null;
    $periodName = $input['period_name'] ?? null;

    if ($workerId === null || $totalHours === null || $hourlyRate === null || $week === null || $year === null) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required fields'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Store numeric ma_nguoi_dung to match table nguoi_dung
    $maNguoiDungNumeric = (string)intval($workerId);
    $maNguoiDungFormatted = 'ND' . str_pad((string)$workerId, 3, '0', STR_PAD_LEFT);
    // Normalize status to VN labels stored in DB
    $statusNorm = strtolower(trim((string)$status));
    if ($statusNorm === 'approved' || $statusNorm === 'da_duyet' || $statusNorm === 'đã duyệt' || $statusNorm === 'da duyet') {
        $statusDb = 'Đã duyệt';
    } elseif ($statusNorm === 'paid' || $statusNorm === 'da thanh toan' || $statusNorm === 'đã thanh toán') {
        $statusDb = 'Đã thanh toán';
    } else {
        $statusDb = 'Chờ duyệt';
    }
    $totalIncome = round($totalHours * $hourlyRate, 2);
    if ($periodName === null) {
        $periodName = "Chi tiết Bảng lương - Tuần $week/$year";
    }

    // Check existing record for same worker/week/year (support both old formatted 'NDxxx' and numeric ids)
    $check = $pdo->prepare("SELECT id_luong FROM bang_luong WHERE (ma_nguoi_dung = ? OR ma_nguoi_dung = ?) AND tuan = ? AND nam = ?");
    $check->execute([$maNguoiDungNumeric, $maNguoiDungFormatted, $week, $year]);
    $exists = $check->fetch(PDO::FETCH_ASSOC);

    if ($exists) {
        // Normalize existing row to store numeric ma_nguoi_dung
        $upd = $pdo->prepare("UPDATE bang_luong SET ten_bang = ?, ma_nguoi_dung = ?, tong_gio_lam = ?, muc_luong_gio = ?, tong_thu_nhap = ?, trang_thai = ?, ngay_tao = CURRENT_TIMESTAMP WHERE id_luong = ?");
        $upd->execute([$periodName, $maNguoiDungNumeric, $totalHours, $hourlyRate, $totalIncome, $statusDb, $exists['id_luong']]);
    } else {
        $ins = $pdo->prepare("INSERT INTO bang_luong (ten_bang, ma_nguoi_dung, tong_gio_lam, muc_luong_gio, tong_thu_nhap, trang_thai, tuan, nam, ngay_tao) VALUES(?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
        $ins->execute([$periodName, $maNguoiDungNumeric, $totalHours, $hourlyRate, $totalIncome, $statusDb, $week, $year]);
    }

    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>


