<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Kết nối database dùng file cấu hình chung
require_once __DIR__ . '/config.php';

try {
    // $pdo đã sẵn có từ config.php
    
    $farmerId = $_GET['farmer_id'] ?? null;
    
    // Nếu thiếu farmerId, vẫn trả về danh sách trống thay vì lỗi
    // để trang farmer hiển thị bình thường
    
    // Lấy công việc của nông dân
    // Kiểm tra xem ma_nguoi_dung có chứa farmer_id không (hỗ trợ multiple farmers)
    $where = "1=1";
    $params = [];
    if (!empty($farmerId)) {
        // Lấy thông tin nông dân để khớp thêm theo tên/SDT nếu lịch đang lưu dạng text
        $farmer = null;
        try {
            $uStmt = $pdo->prepare("SELECT ho_ten, so_dien_thoai FROM nguoi_dung WHERE ma_nguoi_dung = ? LIMIT 1");
            $uStmt->execute([$farmerId]);
            $farmer = $uStmt->fetch(PDO::FETCH_ASSOC) ?: null;
        } catch (Throwable $ignore) {}

        $nameLike = $farmer && !empty($farmer['ho_ten']) ? ('%' . $farmer['ho_ten'] . '%') : null;
        $phoneLike = $farmer && !empty($farmer['so_dien_thoai']) ? ('%' . $farmer['so_dien_thoai'] . '%') : null;

        // CHỈ lấy công việc được gán cụ thể cho nông dân này
        // Không lấy công việc chung chưa gán ai để tránh tất cả nông dân đều thấy
        // Khớp theo nhiều cách: bằng id, chứa id, có trong chuỗi CSV (FIND_IN_SET)
        $cond = [
            'ma_nguoi_dung = ?',
            'ma_nguoi_dung LIKE ?',
            'FIND_IN_SET(?, REPLACE(ma_nguoi_dung, " ", ""))',
        ];
        $params = [$farmerId, "%$farmerId%", $farmerId];
        if ($nameLike) { $cond[] = 'ma_nguoi_dung LIKE ?'; $params[] = $nameLike; }
        if ($phoneLike) { $cond[] = 'ma_nguoi_dung LIKE ?'; $params[] = $phoneLike; }
        // Đã xóa: $cond[] = 'ma_nguoi_dung IS NULL';
        // Đã xóa: $cond[] = "ma_nguoi_dung = ''";
        $where = '(' . implode(' OR ', $cond) . ') AND ma_nguoi_dung IS NOT NULL AND ma_nguoi_dung != \'\'';
    }

    $sql = "
        SELECT 
            id,
            ten_cong_viec,
            mo_ta,
            loai_cong_viec,
            ngay_bat_dau,
            ngay_ket_thuc,
            thoi_gian_bat_dau,
            thoi_gian_ket_thuc,
            thoi_gian_du_kien,
            trang_thai,
            uu_tien,
            ma_nguoi_dung,
            ghi_chu,
            ket_qua,
            hinh_anh,
            created_at
        FROM lich_lam_viec 
        WHERE $where AND COALESCE(ten_cong_viec, '') <> ''
        ORDER BY ngay_bat_dau ASC, thoi_gian_bat_dau ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $tasks
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi hệ thống: ' . $e->getMessage()
    ]);
}
?>
