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

    // ======== Nhận dữ liệu ========
    $taskId = $input['task_id'];
    $trangThai = $input['trang_thai'] ?? '';
    $ketQua = $input['ket_qua'] ?? '';
    $ghiChu = $input['ghi_chu'] ?? '';
    $maNguoiDung = $input['ma_nguoi_dung'] ?? null;   // cần để update cham_cong

    // ======== UPDATE lich_lam_viec ========
    $stmt = $pdo->prepare("
        UPDATE lich_lam_viec 
        SET trang_thai = ?, ket_qua = ?, ghi_chu = ?, updated_at = NOW()
        WHERE id = ?
    ");
    $result = $stmt->execute([$trangThai, $ketQua, $ghiChu, $taskId]);


    // ======== UPDATE / INSERT cham_cong ========
    if ($maNguoiDung !== null) {

        // Kiểm tra xem đã tồn tại bản ghi cham_cong theo lich_lam_viec_id chưa
        $stmtCheck = $pdo->prepare("SELECT id FROM cham_cong WHERE lich_lam_viec_id = ?");
        $stmtCheck->execute([$taskId]);
        $existing = $stmtCheck->fetchColumn();

        if ($existing) {
            // ===== ĐÃ TỒN TẠI → UPDATE =====
            $stmtUpdateCC = $pdo->prepare("
                UPDATE cham_cong 
                SET trang_thai = ?, ma_nguoi_dung = ?, updated_at = NOW()
                WHERE lich_lam_viec_id = ?
            ");
            $stmtUpdateCC->execute([$trangThai, $maNguoiDung, $taskId]);

            $chamCongResult = [
                "action" => "updated",
                "affected_rows" => $stmtUpdateCC->rowCount()
            ];

        } else {
            // ===== CHƯA TỒN TẠI → INSERT =====
            $stmtInsertCC = $pdo->prepare("
                INSERT INTO cham_cong (lich_lam_viec_id, ma_nguoi_dung, trang_thai, created_at)
                VALUES (?, ?, ?, NOW())
            ");
            $stmtInsertCC->execute([$taskId, $maNguoiDung, $trangThai]);

            $chamCongResult = [
                "action" => "inserted",
                "id" => $pdo->lastInsertId(),
                "affected_rows" => $stmtInsertCC->rowCount()
            ];
        }
    } else {
        $chamCongResult = [
            "action" => "ignored",
            "message" => "Không có ma_nguoi_dung nên không update cham_cong"
        ];
    }


    // ======== TRẢ VỀ KẾT QUẢ ========
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