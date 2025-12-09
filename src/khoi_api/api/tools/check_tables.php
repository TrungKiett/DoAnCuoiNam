<?php
// Script kiểm tra các bảng trong database
require_once __DIR__ . '/../config.php';

echo "<h2>Kiểm tra các bảng trong database 'farm'</h2>";

try {
    // Kiểm tra các bảng tồn tại
    $tables = ['lo_trong', 'ke_hoach_san_xuat', 'nong_dan', 'users', 'lich_lam_viec'];
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "<p>✅ Bảng '$table' đã tồn tại</p>";
            
            // Đếm số record
            $countStmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
            $count = $countStmt->fetch()['count'];
            echo "<p>&nbsp;&nbsp;📊 Có $count records</p>";
        } else {
            echo "<p>❌ Bảng '$table' chưa tồn tại</p>";
        }
    }
    
    // Kiểm tra cấu trúc bảng ke_hoach_san_xuat
    echo "<h3>Cấu trúc bảng ke_hoach_san_xuat:</h3>";
    $stmt = $pdo->query("DESCRIBE ke_hoach_san_xuat");
    $columns = $stmt->fetchAll();
    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    foreach ($columns as $col) {
        echo "<tr>";
        echo "<td>" . $col['Field'] . "</td>";
        echo "<td>" . $col['Type'] . "</td>";
        echo "<td>" . $col['Null'] . "</td>";
        echo "<td>" . $col['Key'] . "</td>";
        echo "<td>" . $col['Default'] . "</td>";
        echo "<td>" . $col['Extra'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // Kiểm tra foreign keys
    echo "<h3>Foreign Keys trong ke_hoach_san_xuat:</h3>";
    $stmt = $pdo->query("
        SELECT 
            CONSTRAINT_NAME,
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = 'farm' 
        AND TABLE_NAME = 'ke_hoach_san_xuat' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ");
    $fks = $stmt->fetchAll();
    
    if (count($fks) > 0) {
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>Constraint</th><th>Column</th><th>References Table</th><th>References Column</th></tr>";
        foreach ($fks as $fk) {
            echo "<tr>";
            echo "<td>" . $fk['CONSTRAINT_NAME'] . "</td>";
            echo "<td>" . $fk['COLUMN_NAME'] . "</td>";
            echo "<td>" . $fk['REFERENCED_TABLE_NAME'] . "</td>";
            echo "<td>" . $fk['REFERENCED_COLUMN_NAME'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>Không có foreign keys</p>";
    }
    
} catch (Exception $e) {
    echo "<p>❌ Lỗi: " . $e->getMessage() . "</p>";
}
?>
