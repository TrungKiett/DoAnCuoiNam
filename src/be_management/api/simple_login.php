<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Kết nối database trực tiếp
$host = "localhost";
$db = "farm";
$user = "root";
$pass = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Lấy dữ liệu từ POST
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode(['success' => false, 'message' => 'Không có dữ liệu đầu vào']);
        exit;
    }
    
    $phone = $input['so_dien_thoai'] ?? '';
    $password = $input['mat_khau'] ?? '';
    $expectedRole = $input['vai_tro_expect'] ?? null; // optional: 'quan_ly', 'nong_dan', ...
    
    if (empty($phone) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Thiếu số điện thoại hoặc mật khẩu']);
        exit;
    }
    
    // Tìm user theo số điện thoại (không giới hạn vai trò)
    $stmt = $pdo->prepare("SELECT * FROM nguoi_dung WHERE so_dien_thoai = ? LIMIT 1");
    $stmt->execute([$phone]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy tài khoản với số điện thoại này']);
        exit;
    }
    
    // Nếu có yêu cầu vai trò kỳ vọng, kiểm tra khớp
    if (!empty($expectedRole) && $user['vai_tro'] !== $expectedRole) {
        echo json_encode(['success' => false, 'message' => 'Tài khoản không có quyền truy cập (vai trò: ' . $user['vai_tro'] . ')']);
        exit;
    }
    
    // Kiểm tra mật khẩu
    if ($user['mat_khau'] !== $password) {
        echo json_encode(['success' => false, 'message' => 'Mật khẩu không đúng']);
        exit;
    }
    
    // Đăng nhập thành công
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
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Lỗi hệ thống: ' . $e->getMessage()]);
}
?>
