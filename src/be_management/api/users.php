<?php
require_once __DIR__ . '/config.php';

// Map DB columns -> API fields expected by frontend
// DB: ma_nguoi_dung, ten_dang_nhap, mat_khau, ho_ten, vai_tro, so_dien_thoai, ngay_tao

$sql = "SELECT ma_nguoi_dung AS id,
               ten_dang_nhap   AS username,
               ho_ten          AS full_name,
               so_dien_thoai   AS phone,
               CASE
                 WHEN vai_tro = 'quan_ly' THEN 'Quản trị'
                 WHEN vai_tro = 'phan_phoi' THEN 'Phân phối'
                 WHEN vai_tro = 'nong_dan' THEN 'Nông dân'
                 ELSE COALESCE(vai_tro, 'Nông dân')
               END AS role,
               'Hoạt động'     AS status,
               ngay_tao        AS created_at
        FROM nguoi_dung
        ORDER BY ma_nguoi_dung DESC";

try {
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll();
    echo json_encode($rows);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}


