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
    
    if ($trangThai !== null && $trangThai !== '') {
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
    if ($result && $maNguoiDung) {
        // Chuẩn hóa ma_nguoi_dung trước
        $maNguoiDungNormalized = strval($maNguoiDung);
        if (preg_match('/^ND(\d+)$/i', $maNguoiDungNormalized, $matches)) {
            $maNguoiDungNormalized = $matches[1]; // Lấy số từ "ND040" -> "40"
        } else {
            // Nếu là số, giữ nguyên
            $maNguoiDungNormalized = strval(intval($maNguoiDungNormalized));
        }
        
        // Kiểm tra nếu trạng thái là hoàn thành (từ request hoặc từ database)
        // Chỉ cập nhật cham_cong khi trạng thái là hoàn thành
        $isCompleted = ($trangThai === 'hoan_thanh' || $trangThai === 'da_hoan_thanh' || 
                       $currentStatusBeforeUpdate === 'hoan_thanh' || $currentStatusBeforeUpdate === 'da_hoan_thanh');
        
        // Cập nhật record cham_cong nếu trạng thái là hoàn thành
        if ($isCompleted) {
        try {
            $checkTable = $pdo->query("SHOW TABLES LIKE 'cham_cong'");
            if ($checkTable->rowCount() > 0) {
                $ngayLamViec = $taskInfo['ngay_bat_dau'] ?: date('Y-m-d');
                $lichLamViecId = $taskInfo['id'];
                
                // maNguoiDungNormalized đã được chuẩn hóa ở trên

                // Kiểm tra record tồn tại: kiểm tra cả format số và "NDxxx"
                $maNguoiDungFormatted = 'ND' . str_pad($maNguoiDungNormalized, 3, '0', STR_PAD_LEFT);
                $checkStmt = $pdo->prepare("
                    SELECT id FROM cham_cong 
                    WHERE lich_lam_viec_id = ? 
                    AND (ma_nguoi_dung = ? OR ma_nguoi_dung = ?)
                    AND ngay = ?
                ");
                $checkStmt->execute([$lichLamViecId, $maNguoiDungNormalized, $maNguoiDungFormatted, $ngayLamViec]);
                $existingRecord = $checkStmt->fetch(PDO::FETCH_ASSOC);

                if ($existingRecord) {
                    // Record đã tồn tại (được tạo khi tạo lịch), chỉ cần cập nhật trang_thai thành 'hoan_thanh'
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
                    // Nếu record chưa tồn tại (trường hợp cũ hoặc lịch được tạo trước khi có logic tự động tạo cham_cong)
                    // Tạo mới record với trang_thai = 'hoan_thanh'
                    $insertStmt = $pdo->prepare("
                        INSERT INTO cham_cong (
                            lich_lam_viec_id, ma_nguoi_dung, ngay, trang_thai, ghi_chu, created_at, updated_at
                        ) VALUES (?, ?, ?, 'hoan_thanh', ?, NOW(), NOW())
                    ");
                    $insertStmt->execute([$lichLamViecId, $maNguoiDungNormalized, $ngayLamViec, $ghiChu]);

                    $chamCongResult = ['action' => 'inserted'];
                }
            }
        } catch (Exception $e) {
            error_log("Lỗi chấm công: " . $e->getMessage());
        }
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