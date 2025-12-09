<?php
require_once __DIR__ . '/config.php';

try {
    // Kiểm tra xem có dữ liệu trong bảng không
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM cong_viec_quy_trinh");
    $count = $stmt->fetch()['count'];
    
    if ($count == 0) {
        // Lấy ma_quy_trinh từ bảng quy_trinh_canh_tac
        $stmt = $pdo->query("SELECT ma_quy_trinh, ma_giong FROM quy_trinh_canh_tac ORDER BY ma_quy_trinh");
        $processes = $stmt->fetchAll();
        
        if (empty($processes)) {
            echo json_encode([
                "success" => false,
                "error" => "Chưa có quy trình canh tác nào. Hãy tạo quy trình trước."
            ]);
            exit;
        }
        
        $stmt = $pdo->prepare("
            INSERT INTO cong_viec_quy_trinh 
            (quy_trinh_id, ten_cong_viec, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc, so_nguoi_can, thu_tu_thuc_hien, lap_lai, khoang_cach_lap_lai) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($processes as $process) {
            $quy_trinh_id = $process['ma_quy_trinh'];
            $is_ngo = $process['ma_giong'] == 1; // Giả sử ma_giong = 1 là ngô
            
            if ($is_ngo) {
                // Công việc cho Ngô LVN10
                $tasks = [
                    ['Làm đất', 'Sáng: Cày bừa, làm tơi đất. Chiều: Làm luống, rạch hàng.', 0, 2, '2-3 người', 1, 0, null],
                    ['Bón lót & Gieo hạt', 'Sáng: Bón lót (phân chuồng, NPK), rải hạt đều; Chiều: Tưới nhẹ, gieo phủ vỉ lấp đất.', 3, 3, '2-3 người', 2, 0, null],
                    ['Nảy mầm – Chăm sóc ban đầu', 'Thăm đồng, kiểm tra độ ẩm, phát hiện sâu bệnh sớm. Nghỉ nếu không có vấn đề.', 4, 9, '1 người/điểm', 3, 0, null],
                    ['Tỉa dặm & Làm cỏ lần 1', 'Bổ cây, dặm cây, làm cỏ nhẹ, vun gốc sơ bộ.', 10, 12, '3-4 người', 4, 0, null],
                    ['Bón thúc lần 1', 'Bón phân thúc, vun gốc, kiểm tra sinh trưởng.', 23, 24, '2-3 người', 5, 0, null],
                    ['Bón thúc lần 2', 'Bón phân (Urê + Kali), vun gốc cao, làm cỏ lại nếu cần.', 39, 41, '2-3 người', 6, 0, null],
                    ['Tưới nước/Phòng trừ sâu bệnh (định kỳ)', 'Tưới nước khi cần; kiểm tra sâu bệnh; phun thuốc khi cần.', 11, 11, '1-2 người', 7, 1, 7],
                    ['Thu hoạch', 'Bẻ bắp/cắt lúa, vận chuyển, tập kết.', 0, 0, null, 8, 0, null]
                ];
            } else {
                // Công việc cho Đậu tương ĐT2000
                $tasks = [
                    ['Làm đất', 'Sáng: Cày bừa, làm tơi đất. Chiều: Làm luống, rạch hàng.', 0, 2, '2-3 người', 1, 0, null],
                    ['Bón lót & Gieo hạt', 'Sáng: Bón lót (phân chuồng, NPK), rải hạt đều; Chiều: Tưới nhẹ, gieo phủ và lấp đất.', 3, 3, '2-5 người', 2, 0, null],
                    ['Nảy mầm – Chăm sóc ban đầu', 'Thăm đồng, kiểm tra độ ẩm, phát hiện sâu bệnh sớm. Nghỉ nếu không có vấn đề.', 4, 9, '1 người/điểm', 3, 0, null],
                    ['Tỉa dặm & Làm cỏ lần 1', 'Bổ cây, dặm cây, làm cỏ nhẹ, vun gốc sơ bộ.', 10, 12, '3-4 người', 4, 0, null],
                    ['Bón thúc lần 1', 'Bón phân thúc, vun gốc, kiểm tra sinh trưởng.', 23, 24, '2-3 người', 5, 0, null],
                    ['Bón thúc lần 2', 'Bón phân (Urê + Kali), vun gốc cao, làm cỏ lại nếu cần.', 39, 41, '2-3 người', 6, 0, null],
                    ['Tưới nước/Phòng trừ sâu bệnh (định kỳ)', 'Tưới nước khi cần; kiểm tra sâu bệnh; phun thuốc khi cần.', 11, 11, '1-2 người', 7, 1, 7],
                    ['Thu hoạch', 'Thu hoạch, vận chuyển, tập kết.', 0, 0, null, 8, 0, null]
                ];
            }
            
            foreach ($tasks as $task) {
                $stmt->execute([
                    $quy_trinh_id,
                    $task[0], // ten_cong_viec
                    $task[1], // mo_ta
                    $task[2], // thoi_gian_bat_dau
                    $task[3], // thoi_gian_ket_thuc
                    $task[4], // so_nguoi_can
                    $task[5], // thu_tu_thuc_hien
                    $task[6], // lap_lai
                    $task[7]  // khoang_cach_lap_lai
                ]);
            }
        }
        
        echo json_encode([
            "success" => true,
            "message" => "Đã tạo dữ liệu mẫu cho công việc quy trình",
            "created_tasks" => count($processes) * 8
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