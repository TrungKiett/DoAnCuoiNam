<?php
header('Content-Type: application/json; charset=UTF-8');

// ====== KẾT NỐI DB ======
include '../connect.php'; // chỉ cần dòng này, không tạo lại PDO

// ====== CORS ======
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");

// ====== LẤY DỮ LIỆU TỪ FRONTEND ======
$data = json_decode(file_get_contents("php://input"), true);
$emailOrPhone = $data['email'] ?? '';
$vaiTro = $data['vai_tro'] ?? null;

if (!$emailOrPhone) {
    echo json_encode(["status" => "error", "message" => "Vui lòng nhập email hoặc số điện thoại"], JSON_UNESCAPED_UNICODE);
    exit;
}

// ====== KIỂM TRA TÀI KHOẢN ======
if (!empty($vaiTro)) {
    $stmt = $conn->prepare("SELECT * FROM nguoi_dung WHERE (so_dien_thoai = ? OR email = ?) AND vai_tro = ? LIMIT 1");
    $stmt->execute([$emailOrPhone, $emailOrPhone, $vaiTro]);
} else {
    $stmt = $conn->prepare("SELECT * FROM nguoi_dung WHERE so_dien_thoai = ? OR email = ? LIMIT 1");
    $stmt->execute([$emailOrPhone, $emailOrPhone]);
}
$user = $stmt->fetch();

if (!$user) {
    echo json_encode(["status" => "error", "message" => "Tài khoản không tồn tại"], JSON_UNESCAPED_UNICODE);
    exit;
}

// ====== TẠO OTP ======
$userId = $user['ma_nguoi_dung'];
$recipientEmail = $user['email'];
$otp = random_int(100000, 999999);
$createdAt = date("Y-m-d H:i:s");
$expiredAt = date("Y-m-d H:i:s", strtotime("+2 minutes"));

// ====== GỬI MAIL OTP ======
require __DIR__ . '/../../../../../vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    $gmailUser = 'trankhoi671@gmail.com';
    $gmailAppPassword = 'fvgc wwxl drla mzfa'; // App Password từ Gmail

    $mail->isSMTP();
    $mail->SMTPDebug = 0;
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = $gmailUser;
    $mail->Password = $gmailAppPassword;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; 
    $mail->Port = 465;
    $mail->CharSet = 'UTF-8';

    // Người gửi
    $mail->setFrom($gmailUser, 'Farm_Manager');
    $mail->addReplyTo($gmailUser, 'Farm_Manager');

    // Người nhận
    if (!empty($recipientEmail) && filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
        $mail->addAddress($recipientEmail, $user['ho_ten'] ?? 'Người dùng');
    } else {
        echo json_encode(["status" => "error", "message" => "Email người nhận không hợp lệ"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Nội dung email
    $mail->isHTML(true);
    $mail->Subject = 'Mã OTP xác nhận đặt lại mật khẩu';
    $mail->Body = "
        Xin chào {$user['ho_ten']},<br>
        Mã OTP đặt lại mật khẩu của bạn là: <b style='color:blue;'>$otp</b><br>
        Mã có hiệu lực trong 2 phút.
    ";

    // Gửi mail
    $mail->send();

    // ====== LƯU OTP VÀO DB ======
    $insert = $conn->prepare("
        INSERT INTO otp_reset (ma_nguoi_dung, otp_code, thoi_gian_tao, thoi_gian_het_han)
        VALUES (?, ?, ?, ?)
    ");
    $success = $insert->execute([$userId, $otp, $createdAt, $expiredAt]);

    if ($success) {
        echo json_encode(["status" => "success", "message" => "OTP đã được gửi tới email của bạn"], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(["status" => "error", "message" => "Không thể lưu OTP vào cơ sở dữ liệu"], JSON_UNESCAPED_UNICODE);
    }

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Không thể gửi OTP: {$mail->ErrorInfo}"], JSON_UNESCAPED_UNICODE);
}

// ====== ĐÓNG KẾT NỐI ======
$conn = null;
?>