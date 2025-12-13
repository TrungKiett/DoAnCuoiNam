<?php
require_once __DIR__ . '/../config.php';

try {
    echo "Testing view task with image...\n";
    
    // Get task with image
    $stmt = $pdo->prepare("SELECT * FROM lich_lam_viec WHERE id = ?");
    $stmt->execute([4]);
    $task = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($task) {
        echo "Task ID 4:\n";
        echo "Name: " . $task['ten_cong_viec'] . "\n";
        echo "Image: " . $task['hinh_anh'] . "\n";
        
        // Check if image file exists
        $imagePath = __DIR__ . '/' . $task['hinh_anh'];
        if (file_exists($imagePath)) {
            echo "Image file exists: YES\n";
            echo "File size: " . filesize($imagePath) . " bytes\n";
        } else {
            echo "Image file exists: NO\n";
        }
        
        // Test image URL
        $imageUrl = "http://yensonfarm.io.vn/" . $task['hinh_anh'];
        echo "Image URL: " . $imageUrl . "\n";
        
    } else {
        echo "Task ID 4 not found\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
