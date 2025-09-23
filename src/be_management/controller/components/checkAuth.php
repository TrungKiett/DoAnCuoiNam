<!-- kiểm tra trạng thái đăng nhập -->
<?php
session_start();

 header('Content-Type: application/json; charset=utf-8');

// Nếu có session thì trả thông tin người dùng
if (isset($_SESSION['ma_nguoi_dung'])) {
    echo json_encode([
        "authenticated" => true,
        "user" => [
            "ma_nguoi_dung" => $_SESSION['ma_nguoi_dung'],
            "vai_tro" => $_SESSION['vai_tro']
        ]
    ]);
} else {
    echo json_encode([
        "authenticated" => false,
        "message" => "Người dùng chưa đăng nhập"
    ]);
}