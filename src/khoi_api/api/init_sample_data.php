<?php
require_once __DIR__ . '/config.php';

try {
    $results = [];
    
    // 1. Tạo dữ liệu mẫu cho quy trình canh tác
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM quy_trinh_canh_tac");
    $count = $stmt->fetch()['count'];
    
    if ($count == 0) {
        $stmt = $pdo->prepare("
            INSERT INTO quy_trinh_canh_tac (ten_quy_trinh, ma_giong, mo_ta, thoi_gian_du_kien) 
            VALUES (?, ?, ?, ?)
        ");
        
        $stmt->execute(['Quy trình canh tác Ngô LVN10', 1, 'Quy trình chuẩn cho canh tác ngô LVN10', 120]);
        $stmt->execute(['Quy trình canh tác Đậu tương ĐT2000', 2, 'Quy trình chuẩn cho canh tác đậu tương ĐT2000', 90]);
        
        $results[] = "Đã tạo 2 quy trình canh tác";
    } else {
        $results[] = "Bảng quy_trinh_canh_tac đã có $count records";
    }
    
    // 2. Tạo dữ liệu mẫu cho công việc quy trình
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM cong_viec_quy_trinh");
    $count = $stmt->fetch()['count'];
    
    if ($count == 0) {
        $stmt = $pdo->query("SELECT ma_quy_trinh, ma_giong FROM quy_trinh_canh_tac ORDER BY ma_quy_trinh");
        $processes = $stmt->fetchAll();
        
        $taskStmt = $pdo->prepare("
            INSERT INTO cong_viec_quy_trinh 
            (quy_trinh_id, ten_cong_viec, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc, so_nguoi_can, thu_tu_thuc_hien, lap_lai, khoang_cach_lap_lai) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($processes as $process) {
            $quy_trinh_id = $process['ma_quy_trinh'];
            $is_ngo = $process['ma_giong'] == 1;
            
            $tasks = [
                ['Làm đất', 'Sáng: Cày bừa, làm tơi đất. Chiều: Làm luống, rạch hàng.', 0, 2, '2-3 người', 1, 0, null],
                ['Bón lót & Gieo hạt', 'Sáng: Bón lót (phân chuồng, NPK), rải hạt đều; Chiều: Tưới nhẹ, gieo phủ vỉ lấp đất.', 3, 3, '2-3 người', 2, 0, null],
                ['Nảy mầm – Chăm sóc ban đầu', 'Thăm đồng, kiểm tra độ ẩm, phát hiện sâu bệnh sớm. Nghỉ nếu không có vấn đề.', 4, 9, '1 người/điểm', 3, 0, null],
                ['Tỉa dặm & Làm cỏ lần 1', 'Bổ cây, dặm cây, làm cỏ nhẹ, vun gốc sơ bộ.', 10, 12, '3-4 người', 4, 0, null],
                ['Bón thúc lần 1', 'Bón phân thúc, vun gốc, kiểm tra sinh trưởng.', 23, 24, '2-3 người', 5, 0, null],
                ['Bón thúc lần 2', 'Bón phân (Urê + Kali), vun gốc cao, làm cỏ lại nếu cần.', 39, 41, '2-3 người', 6, 0, null],
                ['Tưới nước/Phòng trừ sâu bệnh (định kỳ)', 'Tưới nước khi cần; kiểm tra sâu bệnh; phun thuốc khi cần.', 11, 11, '1-2 người', 7, 1, 7],
                ['Thu hoạch', $is_ngo ? 'Bẻ bắp/cắt lúa, vận chuyển, tập kết.' : 'Thu hoạch, vận chuyển, tập kết.', 0, 0, null, 8, 0, null]
            ];
            
            foreach ($tasks as $task) {
                $taskStmt->execute([
                    $quy_trinh_id, $task[0], $task[1], $task[2], $task[3], $task[4], $task[5], $task[6], $task[7]
                ]);
            }
        }
        
        $results[] = "Đã tạo " . (count($processes) * 8) . " công việc quy trình";
    } else {
        $results[] = "Bảng cong_viec_quy_trinh đã có $count records";
    }
    
    echo json_encode([
        "success" => true,
        "message" => "Khởi tạo dữ liệu hoàn tất",
        "results" => $results
    ]);
    
} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
