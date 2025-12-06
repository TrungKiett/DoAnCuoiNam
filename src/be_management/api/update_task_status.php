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
    $maNguoiDung = $input['ma_nguoi_dung'] ?? null;

    // Lấy thông tin công việc
    $stmtTask = $pdo->prepare("
        SELECT id, ngay_bat_dau, ma_nguoi_dung 
        FROM lich_lam_viec 
        WHERE id = ?
    ");
    $stmtTask->execute([$taskId]);
    $taskInfo = $stmtTask->fetch(PDO::FETCH_ASSOC);

    if (!$taskInfo) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy công việc']);
        exit;
    }

    // Cập nhật trạng thái công việc
    $stmt = $pdo->prepare("
        UPDATE lich_lam_viec 
        SET trang_thai = ?, ket_qua = ?, ghi_chu = ?, updated_at = NOW()
        WHERE id = ?
    ");
    $result = $stmt->execute([$trangThai, $ketQua, $ghiChu, $taskId]);

    $chamCongResult = null;

    // Nếu hoàn thành thì ghi chấm công
    if ($result && $trangThai === 'hoan_thanh' && $maNguoiDung) {
        try {
            $checkTable = $pdo->query("SHOW TABLES LIKE 'cham_cong'");
            if ($checkTable->rowCount() > 0) {
                $ngayLamViec = $taskInfo['ngay_bat_dau'] ?: date('Y-m-d');
                $maNguoiDungFormatted = strval($maNguoiDung);
                $lichLamViecId = $taskInfo['id'];

                $checkStmt = $pdo->prepare("
                    SELECT id FROM cham_cong 
                    WHERE lich_lam_viec_id = ? 
                    AND ma_nguoi_dung = ? 
                    AND ngay = ?
                ");
                $checkStmt->execute([$lichLamViecId, $maNguoiDungFormatted, $ngayLamViec]);
                $existingRecord = $checkStmt->fetch(PDO::FETCH_ASSOC);

                if ($existingRecord) {
                    $updateStmt = $pdo->prepare("
                        UPDATE cham_cong 
                        SET trang_thai = 'hoan_thanh', 
                            ghi_chu = COALESCE(NULLIF(?, ''), ghi_chu),
                            updated_at = NOW()
                        WHERE id = ?
                    ");
                    $updateStmt->execute([$ghiChu, $existingRecord['id']]);

                    $chamCongResult = ['action' => 'updated'];
                } else {
                    $insertStmt = $pdo->prepare("
                        INSERT INTO cham_cong (
lich_lam_viec_id, ma_nguoi_dung, ngay, trang_thai, ghi_chu, created_at, updated_at
                        ) VALUES (?, ?, ?, 'hoan_thanh', ?, NOW(), NOW())
                    ");
                    $insertStmt->execute([$lichLamViecId, $maNguoiDungFormatted, $ngayLamViec, $ghiChu]);

                    $chamCongResult = ['action' => 'inserted'];
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