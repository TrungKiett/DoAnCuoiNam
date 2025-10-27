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
  $id = $_POST['id'];
  $ten_giong = $_POST['ten_giong'];
  $nha_cung_cap = $_POST['nha_cung_cap'];
  $so_luong_ton = $_POST['so_luong_ton'];
  $ngay_mua = $_POST['ngay_mua'];

  // Nếu có hình ảnh mới
  if (isset($_FILES['hinh_anh']) && $_FILES['hinh_anh']['error'] == 0) {
    $uploadDir = '../../../uploads/';
    $fileName = basename($_FILES['hinh_anh']['name']);
    $targetPath = $uploadDir . $fileName;
    move_uploaded_file($_FILES['hinh_anh']['tmp_name'], $targetPath);

    $sql = "UPDATE giong_cay 
            SET ten_giong=?, nha_cung_cap=?, so_luong_ton=?, ngay_mua=?, hinh_anh=? 
            WHERE ma_giong=?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$ten_giong, $nha_cung_cap, $so_luong_ton, $ngay_mua, $fileName, $id]);
  } else {
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
?>