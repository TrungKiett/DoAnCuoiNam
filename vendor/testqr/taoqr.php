<?php
include '../components/connect.php';
require_once('phpqrcode/qrlib.php'); // Thư viện QR code

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

// Tạo QR nếu có ID sản phẩm
$qrData = '';
$qrFile = '';
if (isset($_GET['id'])) {
    $id_sanpham = $_GET['id'];
    try {
        $stmt = $conn->prepare("SELECT sp.ten_sanpham, sp.mo_ta, sp.gia, nd.ho_ten, nd.so_dien_thoai, tt.vi_tri_trang_trai, tt.phuong_phap_trong_trot, tt.ngay_thu_hoach 
                                FROM sanpham sp 
                                JOIN nguoidung nd ON sp.id_nongdan = nd.id_nguoidung 
                                JOIN thongtinnongdan tt ON nd.id_nguoidung = tt.id_nongdan 
                                WHERE sp.id_sanpham = :id LIMIT 1");
        $stmt->execute(['id' => $id_sanpham]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $qrData  = "Tên SP: {$row['ten_sanpham']}\nMô tả: {$row['mo_ta']}\nGiá: {$row['gia']} VNĐ\n";
            $qrData .= "Nông dân: {$row['ho_ten']} - {$row['so_dien_thoai']}\n";
            $qrData .= "Vị trí: {$row['vi_tri_trang_trai']}\nPhương pháp: {$row['phuong_phap_trong_trot']}\n";
            $qrData .= "Ngày thu hoạch: {$row['ngay_thu_hoach']}";
            $fileName = 'qr_' . md5($qrData . time()) . '.png';
            $qrFile = $tempDir . $fileName;
            QRcode::png($qrData, $qrFile, 'L', 5, 2);
        } else {
            $qrData = "Không tìm thấy sản phẩm có ID = $id_sanpham";
        }
    } catch (PDOException $e) {
        $qrData = "Lỗi truy vấn: " . $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Quản lý và Tạo mã QR sản phẩm</title>
    <link rel="stylesheet" href="../css/style.css">
        <link rel="shortcut icon" href="./imgs/hospital-solid.svg" type="image/x-icon">
    <!-- font awesome cdn link  -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
    <!-- custom css file link  -->
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <?php include '../components/user_header_nongdan.php'; ?>

    <h2>Form Tạo Mã QR cho Sản Phẩm</h2>
    <form method="POST">
        <label>Tên sản phẩm:</label>
        <select name="txt_tensanpham" required>
            <?php
            try {
                $query = $conn->prepare("SELECT id_sanpham, ten_sanpham FROM sanpham WHERE id_nongdan = ?");
                $query->execute([$id_nongdan]);
                while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
                    echo "<option value='{$row['id_sanpham']}'>{$row['ten_sanpham']}</option>";
                }
            } catch (PDOException $e) {
                echo "<option value=''>Lỗi: {$e->getMessage()}</option>";
            }
            ?>
        </select><br><br>

        <label>Ngày tạo:</label>
        <input type="datetime-local" name="txt_ngaytao" id="txt_ngaytao"><br><br>

        <button type="submit" name="add">Tạo mã QR</button>
    </form>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const now = new Date();
            const formatted = now.toISOString().slice(0, 16);
            document.getElementById('txt_ngaytao').value = formatted;
        });
    </script>

    <?php
    if (isset($_POST['add'])) {
        $id_sanpham = $_POST['txt_tensanpham'];
        $ngay_tao = $_POST['txt_ngaytao'];

        // Update ngày tạo
        $update = $conn->prepare("UPDATE sanpham SET ngay_tao = ? WHERE id_sanpham = ?");
        $success = $update->execute([$ngay_tao, $id_sanpham]);

        if ($success) {
            echo "<script>alert('Đã cập nhật ngày tạo sản phẩm!'); window.location.href='?id=$id_sanpham';</script>";
        } else {
            echo "<script>alert('Lỗi cập nhật!');</script>";
        }
    }
    ?>

    <?php if ($qrFile): ?>
        <h3>QR Code Sản phẩm</h3>
        <div class="result">
            <img src="<?= $qrFile ?>" alt="QR Code">
            <pre><?= htmlspecialchars($qrData) ?></pre>
            <a href="<?= $qrFile ?>" download>Tải mã QR</a>
        </div>
    <?php elseif ($qrData): ?>
        <p style="color:red;"><?= htmlspecialchars($qrData) ?></p>
    <?php endif; ?>

    <hr>
    <h3>Sản phẩm gần đây của bạn</h3>
    <table border="1" cellpadding="8">
        <thead>
            <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Ngày tạo</th>
                <th>QR</th>
            </tr>
        </thead>
        <tbody>
            <?php
            $stmt = $conn->prepare("SELECT * FROM sanpham WHERE id_nongdan = ? ORDER BY ngay_tao DESC LIMIT 10");
            $stmt->execute([$id_nongdan]);
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                echo "<tr>";
                echo "<td><a href='?id={$row['id_sanpham']}'>{$row['id_sanpham']}</a></td>";
                echo "<td>{$row['ten_sanpham']}</td>";
                echo "<td>" . number_format($row['gia'], 0, ',', '.') . " VND</td>";
                echo "<td>{$row['so_luong_ton']}</td>";
                echo "<td>{$row['ngay_tao']}</td>";
                echo "<td><a href='?id={$row['id_sanpham']}'>Tạo mã QR</a></td>";
                echo "</tr>";
            }
            ?>
        </tbody>
    </table>

    <?php include '../components/footer_admin.php'; ?>
</body>
</html>
