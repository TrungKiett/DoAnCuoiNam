<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Kết nối database dùng file cấu hình chung
require_once __DIR__ . '/config.php';

try {
    // $pdo đã sẵn có từ config.php
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['task_id'])) {
        echo json_encode(['success' => false, 'message' => 'Thiếu thông tin task_id']);
        exit;
    }
    
    $taskId = $input['task_id'];
    $trangThai = $input['trang_thai'] ?? '';
    $ketQua = $input['ket_qua'] ?? '';
    $ghiChu = $input['ghi_chu'] ?? '';
    $maNguoiDung = $input['ma_nguoi_dung'] ?? null; // ID của nông dân đang cập nhật
    
    // Lấy thông tin công việc để lấy ngày làm việc
    $stmtTask = $pdo->prepare("
        SELECT id, ngay_bat_dau, ma_nguoi_dung 
        FROM lich_lam_viec 
        WHERE id = ?
    ");
    $stmtTask->execute([$taskId]);
    $taskInfo = $stmtTask->fetch(PDO::FETCH_ASSOC);
    
    if (!$taskInfo) {
        echo json_encode([
            'success' => false,
            'message' => 'Không tìm thấy công việc'
        ]);
        exit;
    }
    
    // Cập nhật trạng thái công việc
    $stmt = $pdo->prepare("
        UPDATE lich_lam_viec 
        SET trang_thai = ?, ket_qua = ?, ghi_chu = ?, updated_at = NOW()
        WHERE id = ?
    ");
    
    $result = $stmt->execute([$trangThai, $ketQua, $ghiChu, $taskId]);
    
    if ($result) {
        // Nếu trạng thái là "hoan_thanh" và có mã người dùng, ghi vào bảng cham_cong
        if ($trangThai === 'hoan_thanh' && $maNguoiDung) {
            try {
                // Kiểm tra bảng cham_cong có tồn tại không
                $checkTable = $pdo->query("SHOW TABLES LIKE 'cham_cong'");
                $tableExists = $checkTable->rowCount() > 0;
                
                if ($tableExists) {
                    // Lấy ngày làm việc (sử dụng ngày bắt đầu của công việc)
                    $ngayLamViec = $taskInfo['ngay_bat_dau'] ? $taskInfo['ngay_bat_dau'] : date('Y-m-d');
                    
                    // Chuyển đổi ma_nguoi_dung sang string để đảm bảo định dạng
                    $maNguoiDungStr = strval($maNguoiDung);
                    // Tạo mã định dạng ND001 nếu cần (tùy chọn)
                    $maNguoiDungFormatted = $maNguoiDungStr;
                    
                    // Kiểm tra xem nông dân có được phân công vào công việc này không
                    $taskAssignees = $taskInfo['ma_nguoi_dung'] ?? '';
                    $isAssigned = false;
                    
                    if ($taskAssignees) {
                        // Kiểm tra nếu ma_nguoi_dung chứa ID hoặc mã của nông dân
                        $assigneeList = array_map('trim', explode(',', $taskAssignees));
                        $workerCode = 'ND' . str_pad($maNguoiDungStr, 3, '0', STR_PAD_LEFT);
                        
                        if (in_array($maNguoiDungStr, $assigneeList) || 
                            in_array($workerCode, $assigneeList) ||
                            $taskAssignees === $maNguoiDungStr) {
                            $isAssigned = true;
                        }
                    }
                    
                    // Chỉ ghi chấm công nếu nông dân được phân công (hoặc không kiểm tra nếu không có thông tin)
                    if ($isAssigned || empty($taskAssignees)) {
                        // Kiểm tra xem đã có bản ghi chấm công chưa
                        // Sử dụng id từ lich_lam_viec để đảm bảo lich_lam_viec_id chính xác
                        $lichLamViecId = $taskInfo['id']; // Lấy ID từ bảng lich_lam_viec
                        
                        $checkStmt = $pdo->prepare("
                            SELECT id FROM cham_cong 
                            WHERE lich_lam_viec_id = ? 
                            AND ma_nguoi_dung = ? 
                            AND ngay = ?
                        ");
                        $checkStmt->execute([$lichLamViecId, $maNguoiDungFormatted, $ngayLamViec]);
                        $existingRecord = $checkStmt->fetch(PDO::FETCH_ASSOC);
                        
                        if ($existingRecord) {
                            // Cập nhật bản ghi đã tồn tại
                            $updateStmt = $pdo->prepare("
                                UPDATE cham_cong 
                                SET trang_thai = 'hoan_thanh', 
                                    ghi_chu = COALESCE(NULLIF(?, ''), ghi_chu),
                                    updated_at = NOW()
                                WHERE id = ?
                            ");
                            $updateStmt->execute([$ghiChu, $existingRecord['id']]);
                        } else {
                            // Tạo bản ghi mới (đã có $lichLamViecId từ trên)
                            $insertStmt = $pdo->prepare("
                                INSERT INTO cham_cong (
                                    lich_lam_viec_id, 
                                    ma_nguoi_dung, 
                                    ngay, 
                                    trang_thai, 
                                    ghi_chu,
                                    created_at,
                                    updated_at
                                ) VALUES (?, ?, ?, 'hoan_thanh', ?, NOW(), NOW())
                            ");
                            $insertStmt->execute([
                                $lichLamViecId, // Sử dụng ID từ lich_lam_viec
                                $maNguoiDungFormatted, 
                                $ngayLamViec, 
                                $ghiChu ? $ghiChu : null
                            ]);
                        }
                    }
                }
            } catch (Exception $e) {
                // Ghi log lỗi nhưng không làm gián đoạn quá trình cập nhật trạng thái
                error_log("Lỗi khi ghi chấm công: " . $e->getMessage());
            }
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Cập nhật trạng thái thành công'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Không thể cập nhật trạng thái'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi hệ thống: ' . $e->getMessage()
    ]);
}
?>
