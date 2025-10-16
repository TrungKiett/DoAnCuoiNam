<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once __DIR__ . '/../../api/config.php'; // file config có $pdo

try {
    $farmerId = $_GET['farmer_id'] ?? null;
    $params = [];
    $where = "1=1"; // Mặc định để tránh lỗi khi không có điều kiện

    if (!empty($farmerId)) {
        // Lấy thông tin nông dân
        $uStmt = $pdo->prepare("SELECT ho_ten, so_dien_thoai FROM nguoi_dung WHERE ma_nguoi_dung = ? LIMIT 1");
        $uStmt->execute([$farmerId]);
        $farmer = $uStmt->fetch(PDO::FETCH_ASSOC);

        $cond = [
            "l.ma_nguoi_dung = ?",
            "l.ma_nguoi_dung LIKE ?",
            "FIND_IN_SET(?, REPLACE(l.ma_nguoi_dung, ' ', ''))"
        ];
        $params = [$farmerId, "%$farmerId%", $farmerId];

        if (!empty($farmer['ho_ten'])) {
            $cond[] = "l.ma_nguoi_dung LIKE ?";
            $params[] = "%" . $farmer['ho_ten'] . "%";
        }

        if (!empty($farmer['so_dien_thoai'])) {
            $cond[] = "l.ma_nguoi_dung LIKE ?";
            $params[] = "%" . $farmer['so_dien_thoai'] . "%";
        }

        // Bao gồm công việc chưa gán ai
        $cond[] = "l.ma_nguoi_dung IS NULL";
        $cond[] = "l.ma_nguoi_dung = ''";

        $where = "(" . implode(" OR ", $cond) . ")";
    }

    $sql = "
        SELECT 
            l.id, l.ten_cong_viec, l.mo_ta, l.loai_cong_viec, l.ngay_bat_dau, 
            l.ngay_ket_thuc, l.thoi_gian_bat_dau, l.thoi_gian_ket_thuc, 
            l.thoi_gian_du_kien, l.trang_thai, l.uu_tien, l.ma_nguoi_dung, 
            l.ghi_chu, l.ket_qua, l.hinh_anh, l.created_at, kh.ma_lo_trong
        FROM lich_lam_viec AS l
        LEFT JOIN nguoi_dung AS nd ON l.ma_nguoi_dung = nd.ma_nguoi_dung
        LEFT JOIN ke_hoach_san_xuat AS kh ON kh.ma_ke_hoach = l.ma_ke_hoach
        WHERE $where 
          AND l.ten_cong_viec LIKE '%Thu hoạch%'
        ORDER BY l.ngay_bat_dau ASC, l.thoi_gian_bat_dau ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'count' => count($tasks),
        'data' => $tasks
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi hệ thống: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>