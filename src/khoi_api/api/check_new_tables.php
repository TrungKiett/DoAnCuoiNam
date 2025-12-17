<?php
require_once __DIR__ . '/config.php';

try {
    echo "<h2>Kiểm tra cấu trúc bảng quy_trinh_canh_tac và cong_viec_quy_trinh</h2>";
    
    // Kiểm tra bảng quy_trinh_canh_tac
    $stmt = $pdo->query("SHOW TABLES LIKE 'quy_trinh_canh_tac'");
    if ($stmt->rowCount() > 0) {
        echo "<p>✅ Bảng 'quy_trinh_canh_tac' tồn tại</p>";
        
        // Hiển thị cấu trúc
        $stmt = $pdo->query("DESCRIBE quy_trinh_canh_tac");
        $columns = $stmt->fetchAll();
        echo "<h3>Cấu trúc bảng quy_trinh_canh_tac:</h3>";
        echo "<table border='1'><tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
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
        
        // Hiển thị dữ liệu mẫu
        $stmt = $pdo->query("SELECT * FROM quy_trinh_canh_tac LIMIT 5");
        $data = $stmt->fetchAll();
        echo "<h3>Dữ liệu mẫu:</h3>";
        echo "<pre>" . print_r($data, true) . "</pre>";
    } else {
        echo "<p>❌ Bảng 'quy_trinh_canh_tac' không tồn tại</p>";
    }
    
    // Kiểm tra bảng cong_viec_quy_trinh
    $stmt = $pdo->query("SHOW TABLES LIKE 'cong_viec_quy_trinh'");
    if ($stmt->rowCount() > 0) {
        echo "<p>✅ Bảng 'cong_viec_quy_trinh' tồn tại</p>";
        
        // Hiển thị cấu trúc
        $stmt = $pdo->query("DESCRIBE cong_viec_quy_trinh");
        $columns = $stmt->fetchAll();
        echo "<h3>Cấu trúc bảng cong_viec_quy_trinh:</h3>";
        echo "<table border='1'><tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
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
        
        // Hiển thị dữ liệu mẫu
        $stmt = $pdo->query("SELECT * FROM cong_viec_quy_trinh LIMIT 5");
        $data = $stmt->fetchAll();
        echo "<h3>Dữ liệu mẫu:</h3>";
        echo "<pre>" . print_r($data, true) . "</pre>";
    } else {
        echo "<p>❌ Bảng 'cong_viec_quy_trinh' không tồn tại</p>";
    }
    
} catch (Exception $e) {
    echo "<p>❌ Lỗi: " . $e->getMessage() . "</p>";
}
?>
