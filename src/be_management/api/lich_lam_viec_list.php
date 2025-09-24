<?php
require_once __DIR__ . '/config.php';

try {
    // Check if table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'lich_lam_viec'");
    if ($stmt->rowCount() == 0) {
        echo json_encode(["success" => true, "data" => []]);
        exit;
    }
    
    // Check which columns exist
    $stmt = $pdo->query("SHOW COLUMNS FROM lich_lam_viec");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $selectFields = ['llv.id', 'llv.ma_ke_hoach', 'llv.ten_cong_viec', 'llv.mo_ta', 'llv.ngay_bat_dau', 'llv.thoi_gian_bat_dau', 'llv.ngay_ket_thuc', 'llv.thoi_gian_ket_thuc', 'llv.trang_thai', 'llv.created_at', 'llv.updated_at'];
    
    // Add optional columns if they exist
    if (in_array('loai_cong_viec', $columns)) $selectFields[] = 'llv.loai_cong_viec';
    if (in_array('thoi_gian_du_kien', $columns)) $selectFields[] = 'llv.thoi_gian_du_kien';
    if (in_array('uu_tien', $columns)) $selectFields[] = 'llv.uu_tien';
    if (in_array('ma_nguoi_dung', $columns)) $selectFields[] = 'llv.ma_nguoi_dung';
    if (in_array('ghi_chu', $columns)) $selectFields[] = 'llv.ghi_chu';
    if (in_array('ket_qua', $columns)) $selectFields[] = 'llv.ket_qua';
    if (in_array('hinh_anh', $columns)) $selectFields[] = 'llv.hinh_anh';
    
    $selectFields[] = 'khs.ma_lo_trong';
    
    $query = "
        SELECT " . implode(', ', $selectFields) . "
        FROM lich_lam_viec llv
        LEFT JOIN ke_hoach_san_xuat khs ON llv.ma_ke_hoach = khs.ma_ke_hoach
        ORDER BY llv.ngay_bat_dau ASC
    ";
    
    $stmt = $pdo->query($query);
    $rows = $stmt->fetchAll();
    
    // Transform data: return raw enum codes and field names expected by frontend
    $tasks = array_map(function($row) {
        return [
            'id' => $row['id'],
            'ma_ke_hoach' => $row['ma_ke_hoach'],
            'ten_cong_viec' => $row['ten_cong_viec'],
            'mo_ta' => $row['mo_ta'] ?? '',
            'loai_cong_viec' => isset($row['loai_cong_viec']) ? $row['loai_cong_viec'] : 'khac',
            'ngay_bat_dau' => $row['ngay_bat_dau'],
            'thoi_gian_bat_dau' => $row['thoi_gian_bat_dau'],
            'ngay_ket_thuc' => $row['ngay_ket_thuc'],
            'thoi_gian_ket_thuc' => $row['thoi_gian_ket_thuc'],
            'thoi_gian_du_kien' => isset($row['thoi_gian_du_kien']) ? intval($row['thoi_gian_du_kien']) : 1,
            'trang_thai' => $row['trang_thai'],
            'uu_tien' => isset($row['uu_tien']) ? $row['uu_tien'] : 'trung_binh',
            'ma_nguoi_dung' => $row['ma_nguoi_dung'] ?? '',
            'ghi_chu' => $row['ghi_chu'] ?? '',
            'ket_qua' => $row['ket_qua'] ?? '',
            'hinh_anh' => $row['hinh_anh'] ?? '',
            'ma_lo_trong' => $row['ma_lo_trong'] ?? null,
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at']
        ];
    }, $rows);
    
    error_log("List lich_lam_viec query returned " . count($tasks) . " tasks");
    echo json_encode(["success" => true, "data" => $tasks]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("List lich_lam_viec error: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
