<?php
header('Content-Type: application/json; charset=UTF-8');
include "../connect.php"; // connect.php phải trả về $conn = new PDO(...)

// CORS cho local/dev
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");

// Nhận dữ liệu từ React
$data = json_decode(file_get_contents("php://input"), true);
$emailOrPhone = $data['email'] ?? '';
$vaiTro = $data['vai_tro'] ?? null; // optional role filter

if (!$emailOrPhone) {
    echo json_encode(["status" => "error", "message" => "Vui lòng nhập email hoặc số điện thoại"], JSON_UNESCAPED_UNICODE);
    exit;
}

// Kiểm tra email hoặc số điện thoại theo vai trò (nếu cung cấp)
if (!empty($vaiTro)) {
    $stmt = $conn->prepare("SELECT * FROM nguoi_dung WHERE (so_dien_thoai = ? OR email = ?) AND vai_tro = ? LIMIT 1");
    $stmt->execute([$emailOrPhone, $emailOrPhone, $vaiTro]);
} else {
    $stmt = $conn->prepare("SELECT * FROM nguoi_dung WHERE so_dien_thoai = ? OR email = ? LIMIT 1");
    $stmt->execute([$emailOrPhone, $emailOrPhone]);
}
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(["status" => "error", "message" => "Tài khoản không tồn tại"], JSON_UNESCAPED_UNICODE);
    exit;
}

$userId = $user['ma_nguoi_dung'];
$recipientEmail = $user['email'];
$otp = random_int(100000, 999999);
$createdAt = date("Y-m-d H:i:s");
$expiredAt = date("Y-m-d H:i:s", strtotime("+2 minutes"));

require __DIR__ . '/../../../../../vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    // SMTP cấu hình
    $mail->isSMTP();
    $mail->SMTPDebug = 0;
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;

    // Lấy cấu hình từ ENV nếu có, fallback sang giá trị tạm
    $gmailUser = getenv('FARM_MAIL_USER') ?: 'trankhoi671@gmail.com';
    $gmailAppPassword = getenv('FARM_MAIL_APP_PASSWORD') ?: 'fvgc wwxl drla m';
    $gmailAppPassword = str_replace(' ', '', $gmailAppPassword); // chuẩn hóa, bỏ khoảng trắng

    $mail->Username = $gmailUser;
    $mail->Password = $gmailAppPassword;
    $mail->CharSet = 'UTF-8';

    // Mặc định dùng SMTPS 465, nếu lỗi sẽ thử STARTTLS 587
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = 465;

    // Người gửi phải trùng Username
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

    // Gửi mail, nếu fail với SMTPS 465 thì thử STARTTLS 587
    try {
        $mail->send();
    } catch (Exception $ex1) {
        // Thử lại với STARTTLS 587
        $mail->smtpClose();
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = $gmailUser;
        $mail->Password = $gmailAppPassword;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->send();
    }

    // Lưu OTP vào DB
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
    // Dev fallback: vẫn lưu OTP và trả về thành công để test local nếu chạy trên localhost
    $isLocal = isset($_SERVER['HTTP_HOST']) && (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || $_SERVER['REMOTE_ADDR'] === '127.0.0.1');
    if ($isLocal) {
        try {
            $insert = $conn->prepare("INSERT INTO otp_reset (ma_nguoi_dung, otp_code, thoi_gian_tao, thoi_gian_het_han) VALUES (?, ?, ?, ?)");
            $success = $insert->execute([$userId, $otp, $createdAt, $expiredAt]);
            if ($success) {
                echo json_encode(["status" => "success", "message" => "DEV: OTP đã được tạo (email thất bại)", "otp" => $otp], JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(["status" => "error", "message" => "Không thể lưu OTP (email lỗi): ".$e->getMessage()], JSON_UNESCAPED_UNICODE);
            }
        } catch (Throwable $t) {
            echo json_encode(["status" => "error", "message" => "Gửi OTP thất bại: ".$t->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Không thể gửi OTP: {$mail->ErrorInfo}"], JSON_UNESCAPED_UNICODE);
    }
}

$conn = null;