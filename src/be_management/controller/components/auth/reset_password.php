<?php
header('Content-Type: application/json; charset=UTF-8');
include "../connect.php"; // $conn = new PDO(...)

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true) ?? [];
$otp = $data['otp'] ?? '';
$newPassword = $data['new_password'] ?? '';
$emailOrPhone = $data['email'] ?? '';
$vaiTro = $data['vai_tro'] ?? null;

if (empty($otp) || empty($newPassword) || empty($emailOrPhone)) {
    echo json_encode(["status" => "error", "message" => "Thiếu dữ liệu bắt buộc"]);
    exit;
}

try {
    // Tìm người dùng theo email/phone (và vai trò nếu có)
    if (!empty($vaiTro)) {
        $stmt = $conn->prepare("SELECT * FROM nguoi_dung WHERE (so_dien_thoai = ? OR email = ?) AND vai_tro = ? LIMIT 1");
        $stmt->execute([$emailOrPhone, $emailOrPhone, $vaiTro]);
    } else {
        $stmt = $conn->prepare("SELECT * FROM nguoi_dung WHERE so_dien_thoai = ? OR email = ? LIMIT 1");
        $stmt->execute([$emailOrPhone, $emailOrPhone]);
    }
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) {
        echo json_encode(["status" => "error", "message" => "Tài khoản không tồn tại"]);
        exit;
    }

    $userId = $user['ma_nguoi_dung'];

    // Kiểm tra OTP còn hạn
    $check = $conn->prepare("SELECT * FROM otp_reset WHERE ma_nguoi_dung = ? AND otp_code = ? AND thoi_gian_het_han >= NOW() ORDER BY id DESC LIMIT 1");
    $check->execute([$userId, $otp]);
    $otpRow = $check->fetch(PDO::FETCH_ASSOC);
    if (!$otpRow) {
        echo json_encode(["status" => "error", "message" => "OTP không hợp lệ hoặc đã hết hạn"]);
        exit;
    }

    // Cập nhật mật khẩu (plaintext để tương thích hiện trạng; nên thay bằng hash sau)
    $upd = $conn->prepare("UPDATE nguoi_dung SET mat_khau = ? WHERE ma_nguoi_dung = ?");
    $upd->execute([$newPassword, $userId]);

    // Xóa/bỏ hiệu lực OTP (tùy chọn)
    $conn->prepare("DELETE FROM otp_reset WHERE id = ?")->execute([$otpRow['id']]);

    echo json_encode(["status" => "success", "message" => "Đổi mật khẩu thành công"]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Lỗi hệ thống: ".$e->getMessage()]);
}

?>


