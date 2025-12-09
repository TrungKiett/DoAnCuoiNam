<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/config.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !isset($input['task_id'])) {
        echo json_encode(['success' => false, 'message' => 'Thiếu thông tin task_id']);
        exit;
    }

    $taskId = $input['task_id'];
$trangThai = $input['trang_thai'] ?? '';
    $ketQua = $input['ket_qua'] ?? '';
    $ghiChu = $input['ghi_chu'] ?? '';
$maNguoiDungInput = $input['ma_nguoi_dung'] ?? null;

// Chuẩn hóa danh sách mã người dùng (có thể là đơn lẻ hoặc mảng)
$maNguoiDungList = [];
if (is_array($maNguoiDungInput)) {
    $maNguoiDungList = $maNguoiDungInput;
} elseif ($maNguoiDungInput !== null && $maNguoiDungInput !== '') {
    $maNguoiDungList = [$maNguoiDungInput];
}

$maNguoiDungList = array_values(array_filter(array_map(function($item) {
    $val = trim(strval($item));
    if ($val === '') return null;
    if (preg_match('/^ND(\d+)$/i', $val, $matches)) {
        $val = $matches[1]; // ND040 -> 40
    } else {
        $val = strval(intval($val));
    }
    if ($val === '0' && !preg_match('/^0+$/', trim(strval($item)))) {
        return null; // tránh trường hợp chuỗi không hợp lệ thành 0
    }
    return $val;
}, $maNguoiDungList)));

// Nếu không có mã người dùng hợp lệ, xem như cập nhật trạng thái chung
$hasPerUserUpdate = !empty($maNguoiDungList);

    // Lấy thông tin công việc (bao gồm trạng thái hiện tại)
    $stmtTask = $pdo->prepare("
        SELECT id, ngay_bat_dau, ma_nguoi_dung, trang_thai 
        FROM lich_lam_viec 
        WHERE id = ?
    ");
    $stmtTask->execute([$taskId]);
    $taskInfo = $stmtTask->fetch(PDO::FETCH_ASSOC);

    if (!$taskInfo) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy công việc']);
        exit;
    }

    // Lấy trạng thái hiện tại trước khi update
    $currentStatusBeforeUpdate = $taskInfo['trang_thai'] ?? '';

    // Cập nhật trạng thái công việc (chỉ update các field có giá trị)
    $updateFields = [];
    $updateValues = [];
    
    // Nếu cập nhật theo từng người (có ma_nguoi_dung) thì không cập nhật trạng thái chung của task ở đây
    if (!$hasPerUserUpdate && $trangThai !== null && $trangThai !== '') {
        $updateFields[] = "trang_thai = ?";
        $updateValues[] = $trangThai;
    }
    if ($ketQua !== null && $ketQua !== '') {
        $updateFields[] = "ket_qua = ?";
        $updateValues[] = $ketQua;
    }
    if ($ghiChu !== null && $ghiChu !== '') {
        $updateFields[] = "ghi_chu = ?";
        $updateValues[] = $ghiChu;
    }
    
    // Luôn cập nhật updated_at
    $updateFields[] = "updated_at = NOW()";
    $updateValues[] = $taskId;
    
    $result = true;
    if (!empty($updateFields)) {
        $sql = "UPDATE lich_lam_viec SET " . implode(", ", $updateFields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute($updateValues);
    }

    $chamCongResult = null;

    // Cập nhật record cham_cong cho người chấm công nếu có ma_nguoi_dung
    // QUAN TRỌNG: 
    // - Record cham_cong đã được tạo sẵn khi tạo lịch (trong lich_lam_viec_create.php)
    // - Chỉ cần cập nhật trang_thai thành 'hoan_thanh' khi người dùng chấm công
    // - Mỗi người có record riêng trong cham_cong, chỉ hiển thị trong Chi tiết bảng lương khi trang_thai = 'hoan_thanh'
    if ($result && $hasPerUserUpdate) {
        try {
            $checkTable = $pdo->query("SHOW TABLES LIKE 'cham_cong'");
            if ($checkTable->rowCount() > 0) {
                $ngayLamViec = $taskInfo['ngay_bat_dau'] ?: date('Y-m-d');
                $lichLamViecId = $taskInfo['id'];

                // Kiểm tra record tồn tại: kiểm tra cả format số và "NDxxx"
                $checkStmt = $pdo->prepare("
                    SELECT id FROM cham_cong 
                    WHERE lich_lam_viec_id = ? 
                    AND (ma_nguoi_dung = ? OR ma_nguoi_dung = ?)
                    AND ngay = ?
                ");

                $updateStmt = $pdo->prepare("
                    UPDATE cham_cong 
                    SET trang_thai = ?, 
                        ghi_chu = COALESCE(NULLIF(?, ''), ghi_chu),
                        updated_at = NOW()
                    WHERE id = ?
                ");

                $insertStmt = $pdo->prepare("
                    INSERT INTO cham_cong (
                        lich_lam_viec_id, ma_nguoi_dung, ngay, trang_thai, ghi_chu, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                ");

                $chamCongResult = [];

                foreach ($maNguoiDungList as $maNguoiDung) {
                    $maNguoiDungFormatted = 'ND' . str_pad($maNguoiDung, 3, '0', STR_PAD_LEFT);
                    $checkStmt->execute([$lichLamViecId, $maNguoiDung, $maNguoiDungFormatted, $ngayLamViec]);
                    $existingRecord = $checkStmt->fetch(PDO::FETCH_ASSOC);

                    $newStatus = $trangThai ?: 'dang_thuc_hien'; // mặc định nếu không gửi

                    if ($existingRecord) {
                        // Cập nhật trạng thái riêng cho người này
                        $updateStmt->execute([$newStatus, $ghiChu, $existingRecord['id']]);
                        $chamCongResult[] = ['user' => $maNguoiDung, 'action' => 'updated', 'status' => $newStatus];
                    } else {
                        // Tạo mới record cho người này
                        $insertStmt->execute([$lichLamViecId, $maNguoiDung, $ngayLamViec, $newStatus, $ghiChu]);
                        $chamCongResult[] = ['user' => $maNguoiDung, 'action' => 'inserted', 'status' => $newStatus];
                    }
                }

                // Tính lại trạng thái chung của công việc dựa trên tất cả người được giao
                $assignedCsv = $taskInfo['ma_nguoi_dung'] ?? '';
                $assignedList = array_values(array_filter(array_map(function($item) {
                    $val = trim(strval($item));
                    if ($val === '') return null;
                    if (preg_match('/^ND(\d+)$/i', $val, $m)) return $m[1];
                    return strval(intval($val));
                }, explode(',', $assignedCsv))));

                if (!empty($assignedList)) {
                    $placeholders = implode(',', array_fill(0, count($assignedList), '?'));
                    $params = array_merge([$lichLamViecId, $ngayLamViec], $assignedList);

                    $sqlStatuses = "
                        SELECT ma_nguoi_dung, trang_thai 
                        FROM cham_cong
                        WHERE lich_lam_viec_id = ?
                          AND ngay = ?
                          AND ma_nguoi_dung IN ($placeholders)
                    ";
                    $stmtStatuses = $pdo->prepare($sqlStatuses);
                    $stmtStatuses->execute($params);
                    $rows = $stmtStatuses->fetchAll(PDO::FETCH_ASSOC);

                    $statusMap = [];
                    foreach ($rows as $r) {
                        $statusMap[$r['ma_nguoi_dung']] = $r['trang_thai'];
                    }

                    $allDone = true;
                    $anyWorking = false;
                    foreach ($assignedList as $assignedId) {
                        $st = $statusMap[$assignedId] ?? 'chua_bat_dau';
                        if ($st !== 'hoan_thanh') {
                            $allDone = false;
                        }
                        if (in_array($st, ['dang_thuc_hien', 'da_bat_dau', 'hoan_thanh'])) {
                            $anyWorking = true;
                        }
                    }

                    $overallStatus = $currentStatusBeforeUpdate;
                    if ($allDone) {
                        $overallStatus = 'hoan_thanh';
                    } elseif ($anyWorking) {
                        $overallStatus = 'dang_thuc_hien';
                    } else {
                        $overallStatus = 'chua_bat_dau';
                    }

                    // Cập nhật trạng thái chung (không đè kết quả/ghi chú)
                    $stmtOverall = $pdo->prepare("UPDATE lich_lam_viec SET trang_thai = ?, updated_at = NOW() WHERE id = ?");
                    $stmtOverall->execute([$overallStatus, $lichLamViecId]);
                }
            }
        } catch (Exception $e) {
            error_log("Lỗi chấm công: " . $e->getMessage());
        }
    }

    // ===== Chỉ TRẢ VỀ JSON 1 LẦN =====
    echo json_encode([
        'success' => $result,
        'message' => $result ? 'Cập nhật trạng thái thành công' : 'Không thể cập nhật trạng thái',
        'cham_cong' => $chamCongResult
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi hệ thống: ' . $e->getMessage()
    ]);
}
?>