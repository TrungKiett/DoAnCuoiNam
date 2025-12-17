<?php
require_once __DIR__ . '/config.php';

try {
    // Kiểm tra cấu trúc bảng quy_trinh_canh_tac
    $stmt = $pdo->query("DESCRIBE quy_trinh_canh_tac");
    $columns = $stmt->fetchAll();
    
    echo "<h3>Cấu trúc bảng quy_trinh_canh_tac:</h3>";
    echo "<table border='1'><tr><th>Field</th><th>Type</th></tr>";
    foreach ($columns as $col) {
        echo "<tr><td>" . $col['Field'] . "</td><td>" . $col['Type'] . "</td></tr>";
    }
    echo "</table>";
    
    // Kiểm tra cấu trúc bảng cong_viec_quy_trinh
    $stmt = $pdo->query("DESCRIBE cong_viec_quy_trinh");
    $columns = $stmt->fetchAll();
    
    echo "<h3>Cấu trúc bảng cong_viec_quy_trinh:</h3>";
    echo "<table border='1'><tr><th>Field</th><th>Type</th></tr>";
    foreach ($columns as $col) {
        echo "<tr><td>" . $col['Field'] . "</td><td>" . $col['Type'] . "</td></tr>";
    }
    echo "</table>";
    
} catch (Exception $e) {
    echo "<p>❌ Lỗi: " . $e->getMessage() . "</p>";
}
?>
