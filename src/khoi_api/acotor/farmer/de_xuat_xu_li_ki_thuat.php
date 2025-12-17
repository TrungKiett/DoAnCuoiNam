<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

require_once __DIR__ . '/../../api/config.php'; // file config có $pdo
// include '../../uploads';
$input = $_POST ?? [];

// Ưu tiên lấy từ formData → session → DB
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

// Xử lý upload file
$hinhAnhPath = null;
if (!empty($_FILES['hinh_anh']['name'])) {
    // Đường dẫn tuyệt đối tới thư mục uploads
    $uploadDir = __DIR__ . '/../../uploads/';  
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Tạo tên file duy nhất
    $fileName = time() . "_" . basename($_FILES['hinh_anh']['name']);
    $targetFile = $uploadDir . $fileName;

    if (move_uploaded_file($_FILES['hinh_anh']['tmp_name'], $targetFile)) {
        // Đường dẫn tương đối để frontend truy cập
        $hinhAnhPath = "../../be_management/uploads/" . $fileName;
    }
}


try {
    $sql = "INSERT INTO van_de_bao_cao
            (noi_dung, loai_van_de, ngay_bao_cao, ma_nong_dan, ma_lo_trong, hinh_anh, trang_thai, ghi_chu)
            VALUES (:noi_dung, :loai_van_de, :ngay_bao_cao, :ma_nong_dan, :ma_lo_trong, :hinh_anh, :trang_thai, :ghi_chu)";
    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":noi_dung"     => $input['noi_dung'] ?? null,
        ":loai_van_de"  => $input['loai_van_de'] ?? null,
        ":ngay_bao_cao" => $input['ngay_bao_cao'] ?? date("Y-m-d"),
        ":ma_nong_dan"  => $farmerId,
        ":ma_lo_trong"  => $input['ma_lo_trong'] ?? null,
        ":hinh_anh"     => $hinhAnhPath,
        ":trang_thai"   => $input['trang_thai'] ?? "Chờ xử lý",
        ":ghi_chu"      => $input['ghi_chu'] ?? null
    ]);

    echo json_encode(['success' => true, 'message' => 'Thêm yêu cầu thành công!']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => "Lỗi: " . $e->getMessage()]);
}