<?php
header('Content-Type: application/json; charset=UTF-8');
include "../connect.php";

// Cấu hình CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Nếu trình duyệt gửi preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$otp = $data['otp'] ?? '';
$newPassword = $data['new_password'] ?? '';

if (!$otp) {
  echo json_encode([
    "status" => "error",
    "message" => "Thiếu mã OTP"
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// 1. Lấy OTP từ DB
$stmt = $conn->prepare("SELECT * FROM otp_reset WHERE otp_code = ? ORDER BY thoi_gian_tao DESC LIMIT 1");
$stmt->execute([$otp]);
$otpRecord = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$otpRecord) {
  echo json_encode([
    "status" => "error",
    "message" => "Mã OTP không hợp lệ"
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// 2. Kiểm tra thời hạn
$currentTime = date("Y-m-d H:i:s");
if ($otpRecord['thoi_gian_het_han'] < $currentTime) {
  echo json_encode([
    "status" => "error",
    "message" => "Mã OTP đã hết hạn"
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// --- Trường hợp chỉ kiểm tra OTP (chưa nhập mật khẩu mới) ---
if (empty($newPassword)) {
  echo json_encode([
    "status" => "success",
    "message" => "OTP hợp lệ"
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

$maNguoiDung = $otpRecord['ma_nguoi_dung'];

// 3. Cập nhật mật khẩu (không mã hóa)
$update = $conn->prepare("UPDATE nguoi_dung SET mat_khau = ? WHERE ma_nguoi_dung = ?");
if ($update->execute([$newPassword, $maNguoiDung])) {
  // 4. Xoá OTP đã dùng
  $delete = $conn->prepare("DELETE FROM otp_reset WHERE id = ?");
  $delete->execute([$otpRecord['id']]);

  echo json_encode([
    "status" => "success",
    "message" => "Mật khẩu đã được đặt lại thành công"
  ], JSON_UNESCAPED_UNICODE);
} else {
  echo json_encode([
    "status" => "error",
    "message" => "Không thể cập nhật mật khẩu"
  ], JSON_UNESCAPED_UNICODE);
}

$conn = null;