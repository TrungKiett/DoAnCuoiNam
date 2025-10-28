<?php
include '../components/connect.php';
require_once('phpqrcode/qrlib.php');
session_start();

$id_nongdan = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

if (!$id_nongdan) {
    echo "<script>alert('Bạn chưa đăng nhập'); window.location.href='../login.php';</script>";
    exit();
}

$tempDir = "qrcodes/";
if (!file_exists($tempDir)) {
    mkdir($tempDir, 0755, true);
}

$qrData = '';
$qrFile = '';

if (isset($_GET['id'])) {
    $id_qrcode = $_GET['id'];
    try {
        $stmt = $conn->prepare("SELECT qr.id_qrcode, sp.ten_sanpham, sp.mo_ta, sp.gia, sp.so_luong_ton,
                                       nd.ho_ten, nd.so_dien_thoai, 
                                       tt.vi_tri_trang_trai, tt.phuong_phap_trong_trot, tt.ngay_thu_hoach
                                FROM qrcode qr
                                JOIN sanpham sp ON qr.id_sanpham = sp.id_sanpham
                                JOIN nguoidung nd ON sp.id_nongdan = nd.id_nguoidung
                                JOIN thongtinnongdan tt ON nd.id_nguoidung = tt.id_nongdan
                                WHERE qr.id_qrcode = :id LIMIT 1");
        $stmt->execute(['id' => $id_qrcode]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $qrData = "Mã QR ID: {$row['id_qrcode']}\n";
            $qrData .= "Sản phẩm: {$row['ten_sanpham']}\nGiá: " . number_format($row['gia'], 0, ',', '.') . " VNĐ\n";
            $qrData .= "Số lượng: {$row['so_luong_ton']}\n";
            $qrData .= "Nông dân: {$row['ho_ten']} - {$row['so_dien_thoai']}\n";
            $qrData .= "Vị trí: {$row['vi_tri_trang_trai']}\nPhương pháp: {$row['phuong_phap_trong_trot']}\n";
            $qrData .= "Ngày thu hoạch: {$row['ngay_thu_hoach']}";

            $fileName = 'qr_' . $row['id_qrcode'] . '_' . md5(time()) . '.png';
            $qrFile = $tempDir . $fileName;
            QRcode::png($qrData, $qrFile, 'L', 5, 2);
        } else {
            $qrData = "Không tìm thấy mã QR có ID = $id_qrcode";
        }
    } catch (PDOException $e) {
        $qrData = "Lỗi truy vấn: " . $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Quản lý và Tạo mã QR sản phẩm</title>
    <link rel="shortcut icon" href="./imgs/hospital-solid.svg" type="image/x-icon" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css" />
    <link rel="stylesheet" href="../css/style.css" />
</head>

<body>

    <?php
    if (isset($_SESSION['phanquyen']) && $_SESSION['phanquyen'] === 'nongdan') {
        require("../components/user_header_nongdan.php");
    } else {
        include("../components/user_header.php");
    }
    ?>

    <div class="heading">
        <h3>Quản Lí Nông Sản</h3>
        <p><a href="../home.php">Trang chủ</a> <span> / Quản lí </span></p>
    </div>
    <section class="products_1">
        <div class="product-wrapper">
            <div class="menu-box">
                <a href="../quanlisanpham.php"><i class="fa-solid fa-gear"></i> Quản lí</a>
                <a href="#"><i class="fa fa-plus-square"></i> Xem chi tiết</a>
                <a href="#"><i class="fa fa-plus-square"></i> Thêm sản phẩm</a>
            </div>

            <div class="form-box">
                <div class="form-title">TẠO MÃ QR</div>
                <form method="POST" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="txt_idqr">ID QR</label>
                        <input type="text" id="txt_idqr" name="txt_idqr" required>
                    </div>

                    <div class="form-group" style="display: none;">
                        <label for="txt_maqr">Mã QR</label>
                        <input type="text" id="txt_maqr" name="txt_maqr">
                    </div>
                    <div class="form-group" style="display: none;">
                        <label for="txt_duongdan">Đường dẫn</label>
                        <input type="text" id="txt_duongdan" name="txt_duongdan">
                    </div>

                    <div class="form-group">
                        <label for="txt_tensanpham">Tên sản phẩm</label>
                        <select id="txt_tensanpham" name="txt_tensanpham" required>
                            <?php
                            try {
                                $query = $conn->prepare("SELECT id_sanpham, ten_sanpham FROM sanpham");
                                $query->execute();

                                if ($query->rowCount() > 0) {
                                    while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
                                        echo "<option value='" . htmlspecialchars($row['id_sanpham']) . "'>" . htmlspecialchars($row['ten_sanpham']) . "</option>";
                                    }
                                } else {
                                    echo "<option value=''>Không có sản phẩm</option>";
                                }
                            } catch (PDOException $e) {
                                echo "<option value=''>Lỗi: " . $e->getMessage() . "</option>";
                            }
                            ?>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="txt_ngaytao">Ngày tạo</label>
                        <input type="datetime-local" id="txt_ngaytao" name="txt_ngaytao" required>
                    </div>

                    <script>
                        document.addEventListener('DOMContentLoaded', function () {
                            const now = new Date();
                            const year = now.getFullYear();
                            const month = String(now.getMonth() + 1).padStart(2, '0');
                            const day = String(now.getDate()).padStart(2, '0');
                            const hours = String(now.getHours()).padStart(2, '0');
                            const minutes = String(now.getMinutes()).padStart(2, '0');
                            const localDatetime = `${year}-${month}-${day}T${hours}:${minutes}`;
                            document.getElementById("txt_ngaytao").value = localDatetime;
                        });
                    </script>

                    <div class="form-group">
                        <button type="submit" name="add" class="submit-btn">Xác nhận</button>
                    </div>
                </form>
            </div>
        </div>

        <?php
        if (isset($_POST['add'])) {
            $id_qrcode = $_POST['txt_idqr'] ?? '';
            $id_sanpham = $_POST['txt_tensanpham'] ?? '';
            $ngay_tao = $_POST['txt_ngaytao'];

            // Lấy thông tin sản phẩm để tạo QR
            $stmt = $conn->prepare("SELECT sp.ten_sanpham, sp.mo_ta, sp.gia, sp.so_luong_ton,
                                   nd.ho_ten, nd.so_dien_thoai,
                                   tt.vi_tri_trang_trai, tt.phuong_phap_trong_trot, tt.ngay_thu_hoach
                            FROM sanpham sp
                            JOIN nguoidung nd ON sp.id_nongdan = nd.id_nguoidung
                            JOIN thongtinnongdan tt ON nd.id_nguoidung = tt.id_nongdan
                            WHERE sp.id_sanpham = :id LIMIT 1");
            $stmt->execute(['id' => $id_sanpham]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row) {
                // Tạo dữ liệu QR
                $qrData = "Mã QR ID: {$id_qrcode}\n";
                $qrData .= "Sản phẩm: {$row['ten_sanpham']}\nGiá: " . number_format($row['gia'], 0, ',', '.') . " VNĐ\n";
                $qrData .= "Số lượng: {$row['so_luong_ton']}\n";
                $qrData .= "Nông dân: {$row['ho_ten']} - {$row['so_dien_thoai']}\n";
                $qrData .= "Vị trí: {$row['vi_tri_trang_trai']}\nPhương pháp: {$row['phuong_phap_trong_trot']}\n";
                $qrData .= "Ngày thu hoạch: {$row['ngay_thu_hoach']}";

                // Tạo mã QR
                $fileName = 'qr_' . $id_qrcode . '_' . md5(time()) . '.png';
                $qrFile = $tempDir . $fileName;
                QRcode::png($qrData, $qrFile, 'L', 5, 2);

                try {
                    $insert = $conn->prepare("INSERT INTO qrcode 
                (id_qrcode, ma_qrcode, duong_dan, ngay_tao, id_sanpham) 
                VALUES (?, ?, ?, ?, ?)");

                    $success = $insert->execute([
                        $id_qrcode,
                        $id_qrcode, // Gán luôn mã QR = ID (hoặc bạn có thể dùng random)
                        $qrFile,    // Đường dẫn ảnh QR
                        $ngay_tao,
                        $id_sanpham
                    ]);

                    if ($success) {
                        echo "<script>alert('Tạo mã QR thành công'); location.href='?id=$id_qrcode';</script>";
                        exit();
                    } else {
                        echo "<script>alert('Tạo thất bại');</script>";
                    }
                } catch (PDOException $e) {
                    echo "<script>alert('Lỗi: " . $e->getMessage() . "');</script>";
                }
            } else {
                echo "<script>alert('Không tìm thấy sản phẩm');</script>";
            }
        }


        ?>
    </section>
    <?php
 
// 1. Xử lý xóa mã QR nếu có tham số delete_qr
if (isset($_GET['delete_qr'])) {
    $id_to_delete = $_GET['delete_qr'];

    try {
        // Lấy đường dẫn ảnh trước khi xóa
        $stmt = $conn->prepare("SELECT duong_dan FROM qrcode WHERE id_qrcode = ?");
        $stmt->execute([$id_to_delete]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        // Xóa bản ghi
        $delete = $conn->prepare("DELETE FROM qrcode WHERE id_qrcode = ?");
        $delete->execute([$id_to_delete]);

        // Xóa ảnh QR khỏi server nếu tồn tại
        if ($row && file_exists($row['duong_dan'])) {
            unlink($row['duong_dan']);
        }

        echo "<script>alert('Đã xóa mã QR thành công'); location.href='?';</script>";
        exit;
    } catch (PDOException $e) {
        echo "<script>alert('Lỗi khi xóa: " . $e->getMessage() . "');</script>";
    }
}
?>

<section class="products_1">
    <div class="form-title">SẢN PHẨM GẦN ĐÂY CỦA BẠN</div>

    <table class="product-table" border="1" cellpadding="8" cellspacing="0"
        style="width:100%; border-collapse: collapse;">
        <thead>
            <tr>
                <th>ID_QR</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Ngày tạo QR</th>
                <th>Hành động</th>
                <th>Xóa QR</th>
            </tr>
        </thead>
        <tbody>
            <?php
            $stmt = $conn->prepare("
                SELECT sp.ten_sanpham, sp.mo_ta, sp.gia, sp.so_luong_ton, nd.ho_ten, nd.so_dien_thoai, 
                       tt.vi_tri_trang_trai, tt.phuong_phap_trong_trot, tt.ngay_thu_hoach, qr.id_qrcode, qr.ngay_tao AS qr_ngay_tao
                FROM sanpham sp
                JOIN nguoidung nd ON sp.id_nongdan = nd.id_nguoidung
                JOIN thongtinnongdan tt ON nd.id_nguoidung = tt.id_nongdan
                LEFT JOIN qrcode qr ON sp.id_sanpham = qr.id_sanpham
                WHERE sp.id_nongdan = ?
                ORDER BY qr.ngay_tao DESC
                LIMIT 10
            ");
            $stmt->execute([$id_nongdan]);

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $id_qr = $row['id_qrcode'] ?? 'Chưa có';
                $link_qr = ($id_qr !== 'Chưa có') ? "?id=$id_qr" : '#';
                echo "<tr>";
                echo "<td><a href='{$link_qr}'>" . htmlspecialchars($id_qr) . "</a></td>";
                echo "<td>" . htmlspecialchars($row['ten_sanpham']) . "</td>";
                echo "<td>" . number_format($row['gia'], 0, ',', '.') . " VND</td>";
                echo "<td>" . intval($row['so_luong_ton']) . "</td>";
                echo "<td>" . ($row['qr_ngay_tao'] ?? 'Chưa tạo') . "</td>";
                echo "<td>";
                if ($id_qr === 'Chưa có') {
                    echo "Chưa có mã QR";
                } else {
                    echo "<a href='{$link_qr}'>Xem/Tạo mã QR</a>";
                }
                echo "</td>";
                echo "<td>";
                if ($id_qr !== 'Chưa có') {
                    echo "<a href='?delete_qr={$id_qr}' onclick=\"return confirm('Bạn có chắc muốn xóa mã QR này?');\">Xóa</a>";
                } else {
                    echo "-";
                }
                echo "</td>";
                echo "</tr>";
            }
            ?>
        </tbody>
    </table>

    <?php if (!empty($qrFile)): ?>
        <div class="qr-box" style="
                    margin-top: 20px;
                    padding: 15px;
                    border: 1px solid #ccc;
                    max-width: 350px;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    margin-left: 50%;
                        ">
            <h3 style="margin-bottom: 10px;">QR Code Sản phẩm</h3>
            <div class="result" style="text-align: center;">
                <img src="<?= htmlspecialchars($qrFile) ?>" alt="QR Code"
                    style="width: 300px; height: 300px; margin-bottom: 10px;" />
                <pre style="
        white-space: pre-wrap;
        word-wrap: break-word;
        text-align: left;
        background-color: #fff;
        padding: 10px;
        border: 1px dashed #ccc;
        border-radius: 5px;
        overflow-x: auto;
        max-height: 300px;
    "><?= htmlspecialchars($qrData) ?></pre>
                <a href="<?= htmlspecialchars($qrFile) ?>" download
                    style="display: inline-block; margin-top: 10px; color: #007bff;">Tải mã QR</a>
            </div>
        </div>
    <?php elseif (!empty($qrData)): ?>
        <p style="color:red;"><?= htmlspecialchars($qrData) ?></p>
    <?php endif; ?>
</section>


    <?php include '../components/footer_admin.php'; ?>

    <script src="../js/script.js"></script>
</body>

</html>