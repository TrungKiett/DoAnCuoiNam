<?php
require_once __DIR__ . '/config.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    exit; 
}

try {
    $result = [];
    
    // Check if ke_hoach_san_xuat table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'ke_hoach_san_xuat'");
    if ($stmt->rowCount() == 0) {
        $result[] = "Table ke_hoach_san_xuat does not exist. Creating...";
        
        // Create table with so_luong_nhan_cong column
        $createTable = "
        CREATE TABLE ke_hoach_san_xuat (
            ma_ke_hoach INT AUTO_INCREMENT PRIMARY KEY,
            ma_lo_trong INT,
            dien_tich_trong DECIMAL(10,2),
            ngay_bat_dau DATE,
            ngay_du_kien_thu_hoach DATE,
            trang_thai ENUM('chuan_bi', 'dang_trong', 'da_thu_hoach') DEFAULT 'chuan_bi',
            so_luong_nhan_cong INT DEFAULT 0,
            ghi_chu TEXT,
            ma_giong INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        
        $pdo->exec($createTable);
        $result[] = "Table ke_hoach_san_xuat created successfully!";
    } else {
        $result[] = "Table ke_hoach_san_xuat exists. Checking columns...";
        
        // Check if so_luong_nhan_cong column exists
        $stmt = $pdo->query("SHOW COLUMNS FROM ke_hoach_san_xuat LIKE 'so_luong_nhan_cong'");
        if ($stmt->rowCount() == 0) {
            $result[] = "Column so_luong_nhan_cong does not exist. Adding...";
            
            // Add the column
            $pdo->exec("ALTER TABLE ke_hoach_san_xuat ADD COLUMN so_luong_nhan_cong INT DEFAULT 0 AFTER trang_thai");
            $result[] = "Column so_luong_nhan_cong added successfully!";
        } else {
            $result[] = "Column so_luong_nhan_cong already exists.";
        }

        // Ensure chi_tiet_cong_viec column exists
        $stmt = $pdo->query("SHOW COLUMNS FROM ke_hoach_san_xuat LIKE 'chi_tiet_cong_viec'");
        if ($stmt->rowCount() == 0) {
            $result[] = "Column chi_tiet_cong_viec does not exist. Adding...";
            $pdo->exec("ALTER TABLE ke_hoach_san_xuat ADD COLUMN chi_tiet_cong_viec MEDIUMTEXT NULL AFTER ghi_chu");
            $result[] = "Column chi_tiet_cong_viec added successfully!";
        } else {
            $result[] = "Column chi_tiet_cong_viec already exists.";
        }
        
        // Check if ma_nong_dan column exists and remove it if it does
        $stmt = $pdo->query("SHOW COLUMNS FROM ke_hoach_san_xuat LIKE 'ma_nong_dan'");
        if ($stmt->rowCount() > 0) {
            $result[] = "Column ma_nong_dan exists. Removing...";
            $pdo->exec("ALTER TABLE ke_hoach_san_xuat DROP COLUMN ma_nong_dan");
            $result[] = "Column ma_nong_dan removed successfully!";
        }
    }
    
    // Show current table structure
    $result[] = "Current table structure:";
    $stmt = $pdo->query("DESCRIBE ke_hoach_san_xuat");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $column) {
        $result[] = "- {$column['Field']}: {$column['Type']}";
    }
    
    echo json_encode([
        "success" => true,
        "message" => "Database update completed successfully!",
        "details" => $result
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
        "details" => $result ?? []
    ]);
}
?>
