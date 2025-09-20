<?php
require_once __DIR__ . '/../config.php';

try {
    echo "Checking lich_lam_viec table for task 'xới đất'...\n";
    
    $stmt = $pdo->prepare("SELECT * FROM lich_lam_viec WHERE ten_cong_viec = ? LIMIT 1");
    $stmt->execute(['xới đất']);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($row) {
        echo "Found task: " . json_encode($row) . "\n";
        if (isset($row['hinh_anh']) && !empty($row['hinh_anh'])) {
            echo "Image path in DB: " . $row['hinh_anh'] . "\n";
        } else {
            echo "Image path in DB is empty or NULL.\n";
        }
    } else {
        echo "Task 'xới đất' not found in database.\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
