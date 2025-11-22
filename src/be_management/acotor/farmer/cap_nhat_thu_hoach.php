<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

require_once __DIR__ . '/../../api/config.php'; // Kết nối PDO

// ⚠️ Sửa điểm này: lấy dữ liệu trực tiếp từ $_POST (FormData không dùng $input ?? [])
$input = $_POST ?? [];
if (empty($input)) {
    parse_str(file_get_contents("php://input"), $input);
}
// 🔹 Lấy mã nông dân
$farmerId = $input['ma_nong_dan'] ?? ($_SESSION['ma_nong_dan'] ?? null);
if (!$farmerId) {
    $stmt = $pdo->prepare("SELECT ma_nguoi_dung FROM nguoi_dung WHERE vai_tro = 'nong_dan' LIMIT 1");
    $stmt->execute();
    $farmer = $stmt->fetch(PDO::FETCH_ASSOC);
    $farmerId = $farmer['ma_nguoi_dung'] ?? null;
}
if (!$farmerId) {
    echo json_encode(['success' => false, 'message' => 'Không tìm thấy mã nông dân']);
    exit;
}

 
// 🔹 Lấy ngày thu hoạch hiện tại
$ngayThuHoach = date("Y-m-d H:i:s");

try {
    $sql = "INSERT INTO thu_hoach
            (ma_lo_trong, ngay_thu_hoach, san_luong, chat_luong, ma_nong_dan, ghi_chu)
            VALUES (:ma_lo_trong, :ngay_thu_hoach, :san_luong, :chat_luong, :ma_nong_dan, :ghi_chu)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":ma_lo_trong"   => $input['ma_lo_trong'] ?? null,
        ":ngay_thu_hoach" => $ngayThuHoach,
        ":san_luong"     => $input['san_luong'] ?? null,
        ":chat_luong"    => $input['chat_luong'] ?? null,
        ":ma_nong_dan"   => $farmerId,
        ":ghi_chu"       => $input['ghi_chu'] ?? null,
     ]);

    echo json_encode([
        'success' => true,
        'message' => 'Thêm dữ liệu thu hoạch thành công!',
        'inserted_id' => $pdo->lastInsertId()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => "Lỗi: " . $e->getMessage()
    ]);
}