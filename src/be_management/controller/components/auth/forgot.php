<?php
header('Content-Type: application/json; charset=UTF-8');
include "../connect.php"; // connect.php phải trả về $conn = new PDO(...)

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");

// Nhận dữ liệu từ React
$data = json_decode(file_get_contents("php://input"), true);
$emailOrPhone = $data['email'] ?? '';

if (!$emailOrPhone) {
    echo json_encode(["status" => "error", "message" => "Vui lòng nhập email hoặc số điện thoại"], JSON_UNESCAPED_UNICODE);
    exit;
}

// Kiểm tra email hoặc số điện thoại
$stmt = $conn->prepare("SELECT * FROM nguoi_dung WHERE so_dien_thoai = ? OR email = ?");
$stmt->execute([$emailOrPhone, $emailOrPhone]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(["status" => "error", "message" => "Tài khoản không tồn tại"], JSON_UNESCAPED_UNICODE);
    exit;
}

$userId = $user['ma_nguoi_dung'];
$recipientEmail = $user['email'];

// Sinh OTP
$otp = random_int(100000, 999999); // an toàn hơn rand()
$createdAt = date("Y-m-d H:i:s");
$expiredAt = date("Y-m-d H:i:s", strtotime("+10 minutes"));

// Gửi OTP qua email với PHPMailer
require 'PHPMailer/PHPMailerAutoload.php';

$mail = new PHPMailer;
$mail->isSMTP();
$mail->SMTPDebug = 0; // Đổi thành 2 nếu muốn xem log chi tiết
$mail->Host = 'smtp.gmail.com';
$mail->SMTPAuth = true;
$mail->Username = 'trankhoits@gmail.com';   // Gmail thật
$mail->Password = 'Kh@its0901';      // Gmail App Password (KHÔNG dùng mật khẩu thường)
$mail->SMTPSecure = 'tls';                  // hoặc 'ssl'
$mail->Port = 587;                          // ssl thì 465
$mail->CharSet = 'UTF-8';  

// Địa chỉ gửi đi phải trùng với Username
$mail->setFrom('trankhoits@gmail.com', 'Your App');
$mail->addAddress($recipientEmail, $user['ho_ten'] ?? 'Người dùng');

$mail->isHTML(true);
$mail->Subject = 'Mã OTP xác nhận';
$mail->Body = "Xin chào {$user['ho_ten']},<br>Mã OTP của bạn là: <b>$otp</b><br>Hết hạn sau 10 phút.";

if ($mail->send()) {
    // Lưu OTP vào DB
    $stmt2 = $conn->prepare("INSERT INTO otp_reset(ma_nguoi_dung, otp_code, thoi_gian_tao, thoi_gian_het_han) 
                             VALUES (?, ?, ?, ?)");
    $stmt2->execute([$userId, $otp, $createdAt, $expiredAt]);

    echo json_encode(["status" => "success", "message" => "OTP đã được gửi tới email của bạn"], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(["status" => "error", "message" => "Không thể gửi OTP: " . $mail->ErrorInfo], JSON_UNESCAPED_UNICODE);
}

// Đóng kết nối
$conn = null;
?>