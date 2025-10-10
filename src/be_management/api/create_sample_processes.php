<?php
require_once __DIR__ . '/config.php';

try {
    // Kiểm tra xem có dữ liệu trong bảng không
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM quy_trinh_canh_tac");
    $count = $stmt->fetch()['count'];
    
    if ($count == 0) {
        // Tạo dữ liệu mẫu cho quy trình canh tác
        $stmt = $pdo->prepare("
            INSERT INTO quy_trinh_canh_tac (ten_quy_trinh, ma_giong, mo_ta, thoi_gian_du_kien) 
            VALUES (?, ?, ?, ?)
        ");
        
        // Quy trình cho Ngô LVN10 (giả sử ma_giong = 1)
        $stmt->execute([
            'Quy trình canh tác Ngô LVN10',
            1,
            'Quy trình chuẩn cho canh tác ngô LVN10',
            120
        ]);
        
        // Quy trình cho Đậu tương ĐT2000 (giả sử ma_giong = 2)  
        $stmt->execute([
            'Quy trình canh tác Đậu tương ĐT2000',
            2,
            'Quy trình chuẩn cho canh tác đậu tương ĐT2000',
            90
        ]);
        
        echo json_encode([
            "success" => true,
            "message" => "Đã tạo dữ liệu mẫu cho quy trình canh tác",
            "created_count" => 2
        ]);
    } else {
        echo json_encode([
            "success" => true,
            "message" => "Bảng đã có dữ liệu",
            "count" => $count
        ]);
    }
    
} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
