<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['so_dien_thoai']) || !isset($input['mat_khau'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Thiếu thông tin đăng nhập']);
    exit;
}

$so_dien_thoai = trim($input['so_dien_thoai']);
$mat_khau = trim($input['mat_khau']);

try {
    // Debug: Log input data
    error_log("Farmer login attempt - Phone: " . $so_dien_thoai);
    
    // Tìm người dùng với số điện thoại và vai trò nông dân
    $stmt = $pdo->prepare("
        SELECT ma_nguoi_dung as id, ho_ten as full_name, so_dien_thoai, mat_khau, vai_tro, ten_dang_nhap as username, email, ngay_tao as created_at
        FROM nguoi_dung 
        WHERE so_dien_thoai = ? AND vai_tro = 'nong_dan'
    ");
    $stmt->execute([$so_dien_thoai]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Debug: Log query result
    error_log("Query result: " . json_encode($user));

    if (!$user) {
        // Debug: Kiểm tra xem có user với số điện thoại này không
        $stmt2 = $pdo->prepare("SELECT * FROM nguoi_dung WHERE so_dien_thoai = ?");
        $stmt2->execute([$so_dien_thoai]);
        $anyUser = $stmt2->fetch();
        
        if ($anyUser) {
            echo json_encode([
                'success' => false, 
                'message' => 'Số điện thoại tồn tại nhưng không phải tài khoản nông dân. Vai trò: ' . $anyUser['vai_tro']
            ]);
        } else {
            echo json_encode([
                'success' => false, 
                'message' => 'Số điện thoại không tồn tại trong hệ thống'
            ]);
        }
        exit;
    }

    // Kiểm tra mật khẩu (plaintext comparison as per create_user.php)
    if ($mat_khau !== $user['mat_khau']) {
        echo json_encode([
            'success' => false, 
            'message' => 'Mật khẩu không đúng'
        ]);
        exit;
    }

    // Tạo session hoặc token (tùy chọn)
    session_start();
    $_SESSION['farmer_id'] = $user['id'];
    $_SESSION['farmer_name'] = $user['full_name'];
    $_SESSION['farmer_phone'] = $user['so_dien_thoai'];
    $_SESSION['farmer_role'] = $user['vai_tro'];

    // Trả về thông tin người dùng (không bao gồm mật khẩu)
    unset($user['mat_khau']);
    
    echo json_encode([
        'success' => true,
        'message' => 'Đăng nhập thành công',
        'data' => $user
    ]);

} catch (PDOException $e) {
    error_log("Database error in farmer_login.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Lỗi hệ thống, vui lòng thử lại sau'
    ]);
} catch (Exception $e) {
    error_log("General error in farmer_login.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Lỗi hệ thống, vui lòng thử lại sau'
    ]);
}
?>
