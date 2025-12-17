<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');
$fullName = trim($input['full_name'] ?? '');
$phone    = trim($input['phone'] ?? '');
$role     = trim($input['role'] ?? '');

if ($username === '' || $password === '' || $fullName === '') {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

try {
    // Map role text from UI to DB code values
    $roleCode = $role;
    if (mb_strtolower($role, 'UTF-8') === mb_strtolower('Nông dân', 'UTF-8')) {
        $roleCode = 'nong_dan';
    } elseif (mb_strtolower($role, 'UTF-8') === mb_strtolower('Quản trị', 'UTF-8')
        || mb_strtolower($role, 'UTF-8') === mb_strtolower('Quản lý', 'UTF-8')) {
        $roleCode = 'quan_ly';
    }

    // Store plaintext password as requested (NOT recommended for production)
    $plain = $password;

    $stmt = $pdo->prepare("INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau, ho_ten, vai_tro, so_dien_thoai, ngay_tao)
                           VALUES (?, ?, ?, ?, ?, NOW())");
    $stmt->execute([$username, $plain, $fullName, $roleCode, $phone]);

    echo json_encode(["ok" => true, "id" => $pdo->lastInsertId()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}


