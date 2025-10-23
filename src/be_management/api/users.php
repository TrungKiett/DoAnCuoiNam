<?php
require_once __DIR__ . '/config.php';

try {
    // Detect available columns to avoid unknown-column 500s across different schemas
    $colsStmt = $pdo->query("SHOW COLUMNS FROM nguoi_dung");
    $cols = $colsStmt->fetchAll(PDO::FETCH_COLUMN, 0);

    $usernameCol = in_array('ten_dang_nhap', $cols) ? 'ten_dang_nhap' : (in_array('so_dien_thoai', $cols) ? 'so_dien_thoai' : "''");
    $createdAtCol = in_array('ngay_tao', $cols) ? 'ngay_tao' : (in_array('created_at', $cols) ? 'created_at' : 'NOW()');
    $fullNameCol = in_array('ho_ten', $cols) ? 'ho_ten' : (in_array('ten', $cols) ? 'ten' : "''");
    $phoneCol = in_array('so_dien_thoai', $cols) ? 'so_dien_thoai' : (in_array('sdt', $cols) ? 'sdt' : "''");
    $roleCol = in_array('vai_tro', $cols) ? 'vai_tro' : "'nong_dan'";

    $sql = "SELECT ma_nguoi_dung AS id,
                   $usernameCol   AS username,
                   $fullNameCol   AS full_name,
                   $phoneCol      AS phone,
                   CASE
                     WHEN $roleCol = 'quan_ly' THEN 'Quản trị'
                     WHEN $roleCol = 'phan_phoi' THEN 'Phân phối'
                     WHEN $roleCol = 'nong_dan' THEN 'Nông dân'
                     ELSE COALESCE($roleCol, 'Nông dân')
                   END AS role,
                   'Hoạt động'     AS status,
                   $createdAtCol   AS created_at
            FROM nguoi_dung
            ORDER BY ma_nguoi_dung DESC";

    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll();
    // Frontend expects a plain array, not an object wrapper
    echo json_encode($rows);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}

