<?php
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit(0);
}

require_once __DIR__ . '/../../api/config.php';

try {
  // ======== LẤY DỮ LIỆU TỪ FORM ========
  $ma_giong = $_POST['ma_giong'] ?? null; // nếu có thì update
  $ten_giong = trim($_POST['ten_giong'] ?? '');
  $nha_cung_cap = trim($_POST['nha_cung_cap'] ?? '');
  $so_luong_ton = intval($_POST['so_luong_ton'] ?? 0);
  $ngay_mua = $_POST['ngay_mua'] ?? null;

  if ($ten_giong === '') {
    throw new Exception("⚠️ Thiếu tên giống cây!");
  }

  // ======== XỬ LÝ UPLOAD HÌNH ẢNH ========
  $hinh_anh_path = "";
  if (isset($_FILES['hinh_anh']) && $_FILES['hinh_anh']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../uploads_giongcay/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    $fileTmpPath = $_FILES['hinh_anh']['tmp_name'];
    $fileName = time() . "_" . basename($_FILES['hinh_anh']['name']);
    $destPath = $uploadDir . $fileName;

    if (move_uploaded_file($fileTmpPath, $destPath)) {
      $hinh_anh_path = 'uploads_giongcay/' . $fileName;
    } else {
      throw new Exception("❌ Lỗi khi lưu file hình ảnh!");
    }
  }

  // ======== PHÂN NHÁNH: THÊM MỚI HOẶC CẬP NHẬT ========
  if (!empty($ma_giong)) {
    // 🔹 UPDATE
    if ($hinh_anh_path !== "") {
      $sql = "UPDATE giong_cay 
              SET ten_giong=?, nha_cung_cap=?, so_luong_ton=?, ngay_mua=?, hinh_anh=?
              WHERE ma_giong=?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$ten_giong, $nha_cung_cap, $so_luong_ton, $ngay_mua, $hinh_anh_path, $ma_giong]);
    } else {
      $sql = "UPDATE giong_cay 
              SET ten_giong=?, nha_cung_cap=?, so_luong_ton=?, ngay_mua=?
              WHERE ma_giong=?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$ten_giong, $nha_cung_cap, $so_luong_ton, $ngay_mua, $ma_giong]);
    }

    $message = "✅ Đã cập nhật giống cây thành công!";
  } else {
    // 🔹 INSERT
    // Kiểm tra trùng tên trước khi thêm
    $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM giong_cay WHERE ten_giong = ?");
    $checkStmt->execute([$ten_giong]);
    if ($checkStmt->fetchColumn() > 0) {
      echo json_encode([
        "success" => false,
        "message" => "⚠️ Tên giống cây đã tồn tại!"
      ]);
      exit;
    }

    $stmt = $pdo->prepare("
      INSERT INTO giong_cay (ten_giong, hinh_anh, nha_cung_cap, so_luong_ton, ngay_mua)
      VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$ten_giong, $hinh_anh_path, $nha_cung_cap, $so_luong_ton, $ngay_mua]);
    $message = "✅ Đã thêm giống cây mới!";
  }

  // ======== TRẢ VỀ DANH SÁCH CẬP NHẬT ========
  $listStmt = $pdo->query("SELECT * FROM giong_cay ORDER BY ma_giong DESC");
  $list = $listStmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode([
    "success" => true,
    "message" => $message,
    "data" => $list
  ]);
} catch (Throwable $e) {
  echo json_encode([
    "success" => false,
    "message" => $e->getMessage()
  ]);
}
?>