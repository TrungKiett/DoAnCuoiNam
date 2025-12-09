<?php
require_once __DIR__ . '/config.php';

try {
    // Check if nguoi_dung table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'nguoi_dung'");
    if ($stmt->rowCount() == 0) {
        echo "❌ Table 'nguoi_dung' does not exist. Creating table...\n";
        
        // Create nguoi_dung table
        $pdo->exec("
            CREATE TABLE nguoi_dung (
                ma_nguoi_dung INT AUTO_INCREMENT PRIMARY KEY,
                ten_dang_nhap VARCHAR(50) UNIQUE NOT NULL,
                mat_khau VARCHAR(255) NOT NULL,
                ho_ten VARCHAR(255) NOT NULL,
                vai_tro ENUM('quan_ly', 'phan_phoi', 'nong_dan') DEFAULT 'nong_dan',
                so_dien_thoai VARCHAR(20),
                ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ");
        echo "✅ Table 'nguoi_dung' created successfully\n";
    }
    
    // Check if there are any users
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM nguoi_dung");
    $totalUsers = $stmt->fetch()['total'];
    
    if ($totalUsers == 0) {
        echo "📝 No users found. Creating sample users...\n";
        
        // Insert sample users
        $sampleUsers = [
            ['admin', 'admin123', 'Quản trị viên', 'quan_ly', '0123456789'],
            ['farmer1', 'farmer123', 'Nguyễn Văn An', 'nong_dan', '0987654321'],
            ['farmer2', 'farmer123', 'Trần Thị Bình', 'nong_dan', '0369852147'],
            ['distributor1', 'dist123', 'Lê Văn Cường', 'phan_phoi', '0912345678'],
            ['farmer3', 'farmer123', 'Phạm Thị Dung', 'nong_dan', '0923456789']
        ];
        
        $stmt = $pdo->prepare("
            INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau, ho_ten, vai_tro, so_dien_thoai) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        foreach ($sampleUsers as $user) {
            $stmt->execute($user);
        }
        
        echo "✅ Created " . count($sampleUsers) . " sample users\n";
    } else {
        echo "✅ Found $totalUsers existing users\n";
    }
    
    // Show current users
    $stmt = $pdo->query("SELECT ma_nguoi_dung, ten_dang_nhap, ho_ten, vai_tro FROM nguoi_dung");
    $users = $stmt->fetchAll();
    
    echo "\n📋 Current users in database:\n";
    foreach ($users as $user) {
        echo "- ID: {$user['ma_nguoi_dung']}, Username: {$user['ten_dang_nhap']}, Name: {$user['ho_ten']}, Role: {$user['vai_tro']}\n";
    }
    
    echo "\n🎯 Dashboard should now show: " . count($users) . " total users\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
