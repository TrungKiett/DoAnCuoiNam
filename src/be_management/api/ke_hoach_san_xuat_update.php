<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$ma_ke_hoach = $input['ma_ke_hoach'] ?? null;

if ($ma_ke_hoach === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing ma_ke_hoach"]);
    exit;
}

try {
    $fields = [];
    $values = [];
    foreach ([
        'ma_lo_trong','dien_tich_trong','ngay_bat_dau','ngay_du_kien_thu_hoach','trang_thai','so_luong_nhan_cong','ghi_chu','ma_giong','chi_tiet_cong_viec'
    ] as $key) {
        if (array_key_exists($key, $input)) {
            $fields[] = "$key = ?";
            $values[] = $input[$key];
        }
    }
    if (empty($fields)) {
        echo json_encode(["success" => false, "error" => "No fields to update"]);
        exit;
    }
    $values[] = $ma_ke_hoach;
    $sql = "UPDATE ke_hoach_san_xuat SET " . implode(', ', $fields) . " WHERE ma_ke_hoach = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);
    echo json_encode(["success" => true, "affected_rows" => $stmt->rowCount()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$ma_ke_hoach = $input['ma_ke_hoach'] ?? null;
if ($ma_ke_hoach === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "ma_ke_hoach is required"]);
    exit;
}

$fields = ['ma_lo_trong','dien_tich_trong','ngay_du_kien_thu_hoach','trang_thai','so_luong_nhan_cong','ghi_chu'];
$updates = [];
$params = [];
foreach ($fields as $f) {
    if (array_key_exists($f, $input)) {
        $updates[] = "$f = ?";
        $params[] = $input[$f];
    }
}

if (empty($updates)) {
    echo json_encode(["success" => true, "message" => "No changes"]);
    exit;
}

$params[] = $ma_ke_hoach;

try {
    $sql = "UPDATE ke_hoach_san_xuat SET " . implode(', ', $updates) . " WHERE ma_ke_hoach = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(["success" => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}


