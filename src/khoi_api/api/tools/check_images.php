<?php
require_once __DIR__ . '/../config.php';

try {
    echo "Checking tasks with images...\n";
    
    $stmt = $pdo->query("SELECT id, ten_cong_viec, hinh_anh FROM lich_lam_viec WHERE hinh_anh IS NOT NULL AND hinh_anh != ''");
    $rows = $stmt->fetchAll();
    
    echo "Tasks with images: " . count($rows) . "\n";
    foreach($rows as $row) {
        echo "ID: " . $row['id'] . ", Name: " . $row['ten_cong_viec'] . ", Image: " . $row['hinh_anh'] . "\n";
    }
    
    echo "\nAll tasks:\n";
    $stmt = $pdo->query("SELECT id, ten_cong_viec, hinh_anh FROM lich_lam_viec ORDER BY id");
    $rows = $stmt->fetchAll();
    
    foreach($rows as $row) {
        $imageStatus = empty($row['hinh_anh']) ? 'NO IMAGE' : 'HAS IMAGE';
        echo "ID: " . $row['id'] . ", Name: " . $row['ten_cong_viec'] . ", Image: " . $row['hinh_anh'] . " [$imageStatus]\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
