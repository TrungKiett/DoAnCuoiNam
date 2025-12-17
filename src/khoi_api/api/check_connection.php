<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo "=== KIỂM TRA KẾT NỐI DATABASE ===\n\n";

try {
    // Kiểm tra file config
    if (!file_exists('config.php')) {
        echo "❌ File config.php không tồn tại\n";
        exit;
    }
    echo "✅ File config.php tồn tại\n";
    
    // Load config
    require_once 'config.php';
    echo "✅ File config.php loaded\n";
    
    // Kiểm tra biến PDO
    if (!isset($pdo)) {
        echo "❌ Biến \$pdo không tồn tại\n";
        exit;
    }
    echo "✅ Biến \$pdo tồn tại\n";
    
    // Test query đơn giản
    $stmt = $pdo->query("SELECT 1 as test");
    $result = $stmt->fetch();
    if ($result['test'] == 1) {
        echo "✅ Database connection: OK\n";
    } else {
        echo "❌ Database connection: FAIL\n";
        exit;
    }
    
    // Kiểm tra bảng nguoi_dung
    $stmt = $pdo->query("SHOW TABLES LIKE 'nguoi_dung'");
    $table = $stmt->fetch();
    if ($table) {
        echo "✅ Bảng nguoi_dung tồn tại\n";
    } else {
        echo "❌ Bảng nguoi_dung không tồn tại\n";
        exit;
    }
    
    // Đếm số user
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM nguoi_dung");
    $count = $stmt->fetch();
    echo "✅ Tổng số user: " . $count['count'] . "\n";
    
    // Kiểm tra nông dân
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM nguoi_dung WHERE vai_tro = 'nong_dan'");
    $farmers = $stmt->fetch();
    echo "✅ Số nông dân: " . $farmers['count'] . "\n";
    
    // Hiển thị tất cả nông dân
    $stmt = $pdo->query("SELECT ma_nguoi_dung, ten_dang_nhap, ho_ten, so_dien_thoai, vai_tro FROM nguoi_dung WHERE vai_tro = 'nong_dan'");
    $farmerList = $stmt->fetchAll();
    echo "\n=== DANH SÁCH NÔNG DÂN ===\n";
    foreach ($farmerList as $farmer) {
        echo "ID: " . $farmer['ma_nguoi_dung'] . 
             " | Username: " . $farmer['ten_dang_nhap'] . 
             " | Name: " . $farmer['ho_ten'] . 
             " | Phone: " . $farmer['so_dien_thoai'] . 
             " | Role: " . $farmer['vai_tro'] . "\n";
    }
    
    echo "\n✅ Tất cả kiểm tra đều OK!\n";
    
} catch (Exception $e) {
    echo "❌ LỖI: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
?>
