<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require_once __DIR__ . '/config.php'; // provides $pdo

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$phone = $input['so_dien_thoai'] ?? '';
$password = $input['mat_khau'] ?? '';
$expectedRole = $input['vai_tro_expect'] ?? null; // optional

if (empty($phone) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Thiếu số điện thoại hoặc mật khẩu']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT * FROM nguoi_dung WHERE so_dien_thoai = ? LIMIT 1');
    $stmt->execute([$phone]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy tài khoản với số điện thoại này']);
        exit;
    }

    if (!empty($expectedRole) && $user['vai_tro'] !== $expectedRole) {
        echo json_encode(['success' => false, 'message' => 'Tài khoản không có quyền truy cập (vai trò: ' . $user['vai_tro'] . ')']);
        exit;
    }

    // Plain-text check to match current DB; replace with password_verify if hashed
    if ($user['mat_khau'] !== $password) {
        echo json_encode(['success' => false, 'message' => 'Mật khẩu không đúng']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Đăng nhập thành công',
        'data' => [
            'id' => $user['ma_nguoi_dung'],
            'full_name' => $user['ho_ten'],
            'so_dien_thoai' => $user['so_dien_thoai'],
            'vai_tro' => $user['vai_tro']
        ]
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi hệ thống: '.$e->getMessage()]);
}