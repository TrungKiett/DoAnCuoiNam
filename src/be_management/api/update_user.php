<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$id = intval($input['id'] ?? 0);
$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');
$fullName = trim($input['full_name'] ?? '');
$phone    = trim($input['phone'] ?? '');
$role     = trim($input['role'] ?? '');

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Missing id"]);
    exit;
}

// Map role to DB code
$roleCode = $role;
if (mb_strtolower($role, 'UTF-8') === mb_strtolower('Nông dân', 'UTF-8')) {
    $roleCode = 'nong_dan';
} elseif (mb_strtolower($role, 'UTF-8') === mb_strtolower('Quản trị', 'UTF-8')
    || mb_strtolower($role, 'UTF-8') === mb_strtolower('Quản lý', 'UTF-8')) {
    $roleCode = 'quan_ly';
}

try {
    $fields = [];
    $params = [];
    if ($username !== '') { $fields[] = 'ten_dang_nhap = ?'; $params[] = $username; }
    if ($password !== '') { $fields[] = 'mat_khau = ?';     $params[] = $password; }
    if ($fullName !== '') { $fields[] = 'ho_ten = ?';        $params[] = $fullName; }
    if ($phone !== '')    { $fields[] = 'so_dien_thoai = ?';$params[] = $phone; }
    if ($role !== '')     { $fields[] = 'vai_tro = ?';      $params[] = $roleCode; }
    if (empty($fields)) {
        echo json_encode(["ok" => true]);
        exit;
    }
    $params[] = $id;
    $sql = "UPDATE nguoi_dung SET " . implode(', ', $fields) . " WHERE ma_nguoi_dung = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(["ok" => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}


