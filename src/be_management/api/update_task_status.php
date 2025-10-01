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
    
    // Cập nhật trạng thái công việc
    $stmt = $pdo->prepare("
        UPDATE lich_lam_viec 
        SET trang_thai = ?, ket_qua = ?, ghi_chu = ?, updated_at = NOW()
        WHERE id = ?
    ");
    
    $result = $stmt->execute([$trangThai, $ketQua, $ghiChu, $taskId]);
    
    if ($result) {
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
