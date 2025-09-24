<?php
require_once __DIR__ . '/config.php';

try {
    $stmt = $pdo->query("SELECT ma_ke_hoach, ma_lo_trong, dien_tich_trong, ngay_bat_dau, ngay_du_kien_thu_hoach, trang_thai, so_luong_nhan_cong, ghi_chu, ma_giong FROM ke_hoach_san_xuat ORDER BY ma_ke_hoach DESC");
    $rows = $stmt->fetchAll();
    error_log("List plans query returned " . count($rows) . " rows");
    echo json_encode(["success" => true, "data" => $rows]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("List plans error: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
