<?php
session_start();
include "../connect.php";

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");

// Nhận dữ liệu từ React
$data = json_decode(file_get_contents("php://input"), true);
$soDienThoai = $data['username'] ?? '';  
$matKhau = $data['password'] ?? '';

try {
    $sql = "SELECT * FROM nguoi_dung WHERE so_dien_thoai = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$soDienThoai]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Nếu DB đang lưu plain text
        if ($matKhau === $user['mat_khau']) {
        // Nếu DB đang lưu hash thì thay dòng trên bằng:
        // if (password_verify($matKhau, $user['mat_khau'])) {

            $_SESSION['ma_nguoi_dung'] = $user['ma_nguoi_dung'];
            $_SESSION['vai_tro'] = $user['vai_tro'];

            echo json_encode([
                "status" => "success",
                "message" => "Đăng nhập thành công",
                "user" => [
                    "ma_nguoi_dung" => $user['ma_nguoi_dung'],
                    "ho_ten" => $user['ho_ten'],
                    "vai_tro" => $user['vai_tro'],
                    "so_dien_thoai" => $user['so_dien_thoai']
                ]
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Sai mật khẩu"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Số điện thoại không tồn tại"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Lỗi CSDL: " . $e->getMessage()]);
}