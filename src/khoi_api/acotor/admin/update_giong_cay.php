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
  $id = $_POST['id'] ?? null;
  $ten_giong = $_POST['ten_giong'] ?? '';
  $nha_cung_cap = $_POST['nha_cung_cap'] ?? '';
  $so_luong_ton = intval($_POST['so_luong_ton'] ?? 0);
  $ngay_mua = $_POST['ngay_mua'] ?? null;

  if (empty($id)) throw new Exception("Thiếu id");

  // Chuẩn bị thư mục upload (dùng __DIR__ để path chính xác)
  $uploadDir = __DIR__ . '/../uploads_giongcay/'; // ví dụ: script ở backend/api/... sửa cho phù hợp
  if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0777, true)) {
      throw new Exception("Không thể tạo thư mục upload: $uploadDir");
    }
  }
  if (!is_writable($uploadDir)) {
    throw new Exception("Thư mục upload không có quyền ghi: $uploadDir");
  }

  $hinh_anh_db = null;

  // Lấy tên ảnh cũ (nếu muốn giữ hoặc xóa)
  $oldStmt = $pdo->prepare("SELECT hinh_anh FROM giong_cay WHERE ma_giong = ?");
  $oldStmt->execute([$id]);
  $oldImg = $oldStmt->fetchColumn();

  // Nếu có file upload
  if (isset($_FILES['hinh_anh']) && $_FILES['hinh_anh']['error'] === UPLOAD_ERR_OK) {
    // Kiểm tra kích thước và loại (tùy chọn)
    $tmp = $_FILES['hinh_anh']['tmp_name'];
    $mime = mime_content_type($tmp);
    $allowed = ['image/jpeg','image/png','image/webp'];
    if (!in_array($mime, $allowed)) {
      throw new Exception("Chỉ chấp nhận JPG/PNG/WEBP. Loại hiện tại: $mime");
    }

    // Tạo tên file duy nhất
    $ext = pathinfo($_FILES['hinh_anh']['name'], PATHINFO_EXTENSION);
    $fileName = time() . '_' . bin2hex(random_bytes(6)) . '.' . $ext;
    $targetPath = $uploadDir . $fileName;

    if (!move_uploaded_file($tmp, $targetPath)) {
      // Ghi log chi tiết
      $err = error_get_last();
      throw new Exception("Không thể di chuyển file lên $targetPath. Lỗi: " . json_encode($err));
    }

    // Nếu muốn xóa file cũ
    if (!empty($oldImg)) {
      $oldFullPath = $uploadDir . basename($oldImg);
      if (file_exists($oldFullPath)) {
        @unlink($oldFullPath);
      }
    }

    // Lưu đường dẫn tương đối vào DB (tùy bạn - ví dụ 'uploads_giongcay/filename.jpg')
    $hinh_anh_db = 'uploads_giongcay/' . $fileName;

    // Update có ảnh mới
    $sql = "UPDATE giong_cay 
            SET ten_giong=?, nha_cung_cap=?, so_luong_ton=?, ngay_mua=?, hinh_anh=? 
            WHERE ma_giong=?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$ten_giong, $nha_cung_cap, $so_luong_ton, $ngay_mua, $hinh_anh_db, $id]);
  } else {
    // Không có file mới -> giữ nguyên hinh_anh cũ
    $sql = "UPDATE giong_cay 
            SET ten_giong=?, nha_cung_cap=?, so_luong_ton=?, ngay_mua=? 
            WHERE ma_giong=?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$ten_giong, $nha_cung_cap, $so_luong_ton, $ngay_mua, $id]);
  }

  echo json_encode(["success" => true]);
} catch (Throwable $e) {
  echo json_encode(["success" => false, "message" => $e->getMessage()]);
}