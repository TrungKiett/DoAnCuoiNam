<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';

try {
    // Tạo tài khoản nông dân test
    $stmt = $pdo->prepare("
        INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau, ho_ten, vai_tro, so_dien_thoai, ngay_tao) 
        VALUES (?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
        mat_khau = VALUES(mat_khau),
        ho_ten = VALUES(ho_ten)
    ");
    
    $result = $stmt->execute([
        'nongdan_test',
        '123456',  // Mật khẩu plaintext
        'Nguyễn Văn Nông Dân',
        'nong_dan',
        '0912345678'
    ]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Tạo tài khoản nông dân test thành công',
            'data' => [
                'so_dien_thoai' => '0912345678',
                'mat_khau' => '123456',
                'ho_ten' => 'Nguyễn Văn Nông Dân'
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Không thể tạo tài khoản test'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi: ' . $e->getMessage()
    ]);
}
?>
