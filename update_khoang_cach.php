<?php
require_once 'src/be_management/api/config.php';

echo "=== CẬP NHẬT KHOẢNG CÁCH ===\n";

// Lấy tham số từ command line hoặc form
$taskId = $argv[1] ?? 44; // Task ID (mặc định 44)
$newValue = $argv[2] ?? 3; // Giá trị mới (mặc định 3)

echo "Task ID: $taskId\n";
echo "Giá trị mới: $newValue\n";

try {
    // Cập nhật
    $stmt = $pdo->prepare("UPDATE cong_viec_quy_trinh SET khoang_cach = ? WHERE ma_cong_viec = ?");
    $result = $stmt->execute([$newValue, $taskId]);
    
    if ($result) {
        echo "✅ Cập nhật thành công!\n";
        
        // Kiểm tra
        $checkStmt = $pdo->query("SELECT ma_cong_viec, ten_cong_viec, khoang_cach FROM cong_viec_quy_trinh WHERE ma_cong_viec = $taskId");
        $checkResult = $checkStmt->fetch(PDO::FETCH_ASSOC);
        echo "Kiểm tra: ID={$checkResult['ma_cong_viec']}, Tên={$checkResult['ten_cong_viec']}, Khoảng cách={$checkResult['khoang_cach']}\n";
        
        echo "\n=== HƯỚNG DẪN ===\n";
        echo "1. F5 trang web để kiểm tra\n";
        echo "2. Nếu vẫn không thấy thay đổi, thử Ctrl+F5 (hard refresh)\n";
        echo "3. Hoặc mở tab ẩn danh để test\n";
    } else {
        echo "❌ Cập nhật thất bại!\n";
    }
} catch (Exception $e) {
    echo "❌ Lỗi: " . $e->getMessage() . "\n";
}

echo "\n=== CÁCH SỬ DỤNG ===\n";
echo "php update_khoang_cach.php [task_id] [new_value]\n";
echo "Ví dụ: php update_khoang_cach.php 44 5\n";
?>
