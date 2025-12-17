<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$ma_quy_trinh = $input['ma_quy_trinh'] ?? null; // null => create
$ten_quy_trinh = $input['ten_quy_trinh'] ?? null;
$ma_giong = $input['ma_giong'] ?? null;
$mo_ta = $input['mo_ta'] ?? null;
$ngay_bat_dau = $input['ngay_bat_dau'] ?? null; // optional
$ngay_ket_thuc = $input['ngay_ket_thuc'] ?? null; // optional
$ghi_chu = $input['ghi_chu'] ?? null; // optional

if ($ten_quy_trinh === null || $ma_giong === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing required fields (ten_quy_trinh, ma_giong)"]);
    exit;
}

try {
    if ($ma_quy_trinh) {
        // update
        $fields = [];
        $values = [];
        $fields[] = 'ten_quy_trinh = ?'; $values[] = $ten_quy_trinh;
        $fields[] = 'ma_giong = ?'; $values[] = $ma_giong;
        if ($mo_ta !== null) { $fields[] = 'mo_ta = ?'; $values[] = $mo_ta; }
        if ($ngay_bat_dau !== null) { $fields[] = 'ngay_bat_dau = ?'; $values[] = $ngay_bat_dau; }
        if ($ngay_ket_thuc !== null) { $fields[] = 'ngay_ket_thuc = ?'; $values[] = $ngay_ket_thuc; }
        if ($ghi_chu !== null) { $fields[] = 'ghi_chu = ?'; $values[] = $ghi_chu; }
        $values[] = $ma_quy_trinh;
        $sql = 'UPDATE quy_trinh_canh_tac SET ' . implode(', ', $fields) . ' WHERE ma_quy_trinh = ?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        echo json_encode(["success" => true, "mode" => "update", "affected_rows" => $stmt->rowCount()]);
    } else {
        // create
        $stmt = $pdo->prepare('INSERT INTO quy_trinh_canh_tac (ten_quy_trinh, ma_giong, mo_ta, ngay_bat_dau, ngay_ket_thuc, ghi_chu) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([$ten_quy_trinh, $ma_giong, $mo_ta, $ngay_bat_dau, $ngay_ket_thuc, $ghi_chu]);
        echo json_encode(["success" => true, "mode" => "create", "ma_quy_trinh" => $pdo->lastInsertId()]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>


