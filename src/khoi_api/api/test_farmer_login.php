<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';

try {
    // Kiểm tra kết nối database
    echo "Database connection: OK\n";
    
    // Kiểm tra bảng nguoi_dung
    $stmt = $pdo->query("SHOW TABLES LIKE 'nguoi_dung'");
    $tableExists = $stmt->fetch();
    
    if (!$tableExists) {
        echo "Table 'nguoi_dung' does not exist\n";
        exit;
    }
    
    echo "Table 'nguoi_dung' exists\n";
    
    // Kiểm tra cấu trúc bảng
    $stmt = $pdo->query("DESCRIBE nguoi_dung");
    $columns = $stmt->fetchAll();
    echo "Table structure:\n";
    foreach ($columns as $column) {
        echo "- " . $column['Field'] . " (" . $column['Type'] . ")\n";
    }
    
    // Kiểm tra dữ liệu
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM nguoi_dung");
    $count = $stmt->fetch();
    echo "Total records: " . $count['count'] . "\n";
    
    // Kiểm tra nông dân
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM nguoi_dung WHERE vai_tro = 'nong_dan'");
    $farmerCount = $stmt->fetch();
    echo "Farmer records: " . $farmerCount['count'] . "\n";
    
    // Hiển thị một vài bản ghi nông dân
    $stmt = $pdo->query("SELECT ma_nguoi_dung, ho_ten, so_dien_thoai, vai_tro FROM nguoi_dung WHERE vai_tro = 'nong_dan' LIMIT 3");
    $farmers = $stmt->fetchAll();
    echo "Sample farmer records:\n";
    foreach ($farmers as $farmer) {
        echo "- ID: " . $farmer['ma_nguoi_dung'] . ", Name: " . $farmer['ho_ten'] . ", Phone: " . $farmer['so_dien_thoai'] . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
