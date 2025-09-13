<?php
require_once __DIR__ . '/config.php';

try {
    // Check if table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'lo_trong'");
    if ($stmt->rowCount() == 0) {
        // Table doesn't exist, return empty array
        echo json_encode(["success" => true, "data" => []]);
        exit;
    }
    
    $stmt = $pdo->query("
        SELECT 
            lt.ma_lo_trong,
            lt.ten_lo,
            lt.vi_tri,
            lt.dien_tich,
            lt.toa_do_lat,
            lt.toa_do_lng,
            lt.trang_thai,
            khs.ghi_chu,
            khs.ngay_du_kien_thu_hoach
        FROM lo_trong lt
        LEFT JOIN ke_hoach_san_xuat khs ON lt.ma_lo_trong = khs.ma_lo_trong
        ORDER BY lt.ma_lo_trong
    ");
    $rows = $stmt->fetchAll();
    
    // Transform data to match frontend format
    $lots = array_map(function($row) {
        $statusMap = [
            'san_sang' => 'Sẵn sàng',
            'dang_chuan_bi' => 'Đang chuẩn bị', 
            'chua_bat_dau' => 'Chưa bắt đầu',
            'dang_canh_tac' => 'Đang canh tác',
            'hoan_thanh' => 'Hoàn thành',
            'can_bao_tri' => 'Cần bảo trì'
        ];
        
        return [
            'id' => 'Lô ' . $row['ma_lo_trong'],
            'ma_lo_trong' => $row['ma_lo_trong'],
            'status' => $statusMap[$row['trang_thai']] ?? $row['trang_thai'],
            'location' => $row['vi_tri'],
            'area' => floatval($row['dien_tich']),
            'crop' => $row['ghi_chu'] ?? '',
            'season' => $row['ngay_du_kien_thu_hoach'] ? date('d/m/Y', strtotime($row['ngay_du_kien_thu_hoach'])) : '',
            'lat' => floatval($row['toa_do_lat']),
            'lng' => floatval($row['toa_do_lng'])
        ];
    }, $rows);
    
    error_log("List lots query returned " . count($lots) . " lots");
    echo json_encode(["success" => true, "data" => $lots]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("List lots error: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
