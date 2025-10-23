<?php
require_once __DIR__ . '/config.php';

// Function to safely get count from table
function safeCount($pdo, $table, $default = 0) {
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM $table");
        return $stmt->fetch()['total'];
    } catch (Exception $e) {
        return $default;
    }
}

// Function to safely execute query with fallback
function safeQuery($pdo, $sql, $params = [], $fallback = []) {
    try {
        if (empty($params)) {
            $stmt = $pdo->query($sql);
        } else {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        return $fallback;
    }
}

try {
    $stats = [];
    
    // 1. Tổng người dùng
    $stats['total_users'] = safeCount($pdo, 'nguoi_dung', 0);
    
    // 2. Tổng lô trồng
    $stats['total_lots'] = safeCount($pdo, 'lo_trong', 0);
    
    // 3. Kế hoạch sản xuất
    $stats['total_plans'] = safeCount($pdo, 'ke_hoach_san_xuat', 0);
    
    // 4. Công việc hôm nay
    $today = date('Y-m-d');
    $stats['today_tasks'] = safeCount($pdo, 'lich_lam_viec', 0);
    
    // 5. Thống kê trạng thái lô
    $stats['lot_status'] = safeQuery($pdo, "
        SELECT 
            CASE 
                WHEN trang_thai = 'san_sang' THEN 'Sẵn sàng'
                WHEN trang_thai = 'dang_chuan_bi' THEN 'Đang chuẩn bị'
                WHEN trang_thai = 'chua_bat_dau' THEN 'Chưa bắt đầu'
                WHEN trang_thai = 'dang_canh_tac' THEN 'Đang canh tác'
                WHEN trang_thai = 'hoan_thanh' THEN 'Hoàn thành'
                WHEN trang_thai = 'can_bao_tri' THEN 'Cần bảo trì'
                ELSE trang_thai
            END as status,
            COUNT(*) as count
        FROM lo_trong 
        GROUP BY trang_thai
    ", [], [
        ['status' => 'Chưa có dữ liệu', 'count' => 0]
    ]);
    
    // 6. Công việc sắp tới (7 ngày tới)
    $stats['upcoming_tasks'] = safeQuery($pdo, "
        SELECT 
            llv.ten_cong_viec,
            llv.ngay_bat_dau,
            llv.thoi_gian_bat_dau,
            llv.thoi_gian_ket_thuc,
            lt.ten_lo,
            lt.vi_tri
        FROM lich_lam_viec llv
        LEFT JOIN lo_trong lt ON llv.ma_lo_trong = lt.ma_lo_trong
        WHERE llv.ngay_bat_dau BETWEEN ? AND DATE_ADD(?, INTERVAL 7 DAY)
        ORDER BY llv.ngay_bat_dau, llv.thoi_gian_bat_dau
        LIMIT 10
    ", [$today, $today], []);
    
    // 7. Thống kê kế hoạch theo trạng thái
    $stats['plan_status'] = safeQuery($pdo, "
        SELECT 
            CASE 
                WHEN trang_thai = 'chuan_bi' THEN 'Chuẩn bị'
                WHEN trang_thai = 'dang_trong' THEN 'Đang canh tác'
                WHEN trang_thai = 'da_thu_hoach' THEN 'Hoàn thành'
                ELSE trang_thai
            END as status,
            COUNT(*) as count
        FROM ke_hoach_san_xuat 
        GROUP BY trang_thai
    ", [], [
        ['status' => 'Chưa có dữ liệu', 'count' => 0]
    ]);
    
    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);
    
} catch (Throwable $e) {
    // Fallback data if everything fails
    $fallbackStats = [
        'total_users' => 0,
        'total_lots' => 0,
        'total_plans' => 0,
        'today_tasks' => 0,
        'lot_status' => [['status' => 'Chưa có dữ liệu', 'count' => 0]],
        'upcoming_tasks' => [],
        'plan_status' => [['status' => 'Chưa có dữ liệu', 'count' => 0]]
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $fallbackStats,
        'warning' => 'Sử dụng dữ liệu mặc định do lỗi: ' . $e->getMessage()
    ]);
}
?>
