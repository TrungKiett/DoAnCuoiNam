<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Kết nối database dùng file cấu hình chung
require_once __DIR__ . '/config.php';

try {
    // $pdo đã sẵn có từ config.php
    
    // Lấy ID của nông dân
    $stmt = $pdo->prepare("SELECT ma_nguoi_dung FROM nguoi_dung WHERE vai_tro = 'nong_dan' LIMIT 1");
    $stmt->execute();
    $farmer = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$farmer) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy nông dân']);
        exit;
    }
    
    $farmerId = $farmer['ma_nguoi_dung'];
    
    // Tạo công việc mẫu
    $sampleTasks = [
        [
            'ten_cong_viec' => 'Tưới nước cho cây cà chua',
            'mo_ta' => 'Tưới nước đều đặn cho 100 cây cà chua ở khu vực A',
            'loai_cong_viec' => 'Chăm sóc cây trồng',
            'ngay_bat_dau' => date('Y-m-d'),
            'ngay_ket_thuc' => date('Y-m-d', strtotime('+2 days')),
            'thoi_gian_bat_dau' => '08:00:00',
            'thoi_gian_ket_thuc' => '10:00:00',
            'thoi_gian_du_kien' => '2 ngày',
            'trang_thai' => 'chua_lam',
            'uu_tien' => 'cao',
            'ma_nguoi_dung' => $farmerId,
            'ghi_chu' => 'Cần tưới đều, tránh tưới vào lá',
            'ket_qua' => '',
            'hinh_anh' => '',
            'created_at' => date('Y-m-d H:i:s')
        ],
        [
            'ten_cong_viec' => 'Bón phân cho cây dưa leo',
            'mo_ta' => 'Bón phân NPK cho 50 cây dưa leo ở khu vực B',
            'loai_cong_viec' => 'Bón phân',
            'ngay_bat_dau' => date('Y-m-d', strtotime('+1 day')),
            'ngay_ket_thuc' => date('Y-m-d', strtotime('+3 days')),
            'thoi_gian_bat_dau' => '09:00:00',
            'thoi_gian_ket_thuc' => '11:00:00',
            'thoi_gian_du_kien' => '3 ngày',
            'trang_thai' => 'chua_lam',
            'uu_tien' => 'trung_binh',
            'ma_nguoi_dung' => $farmerId,
            'ghi_chu' => 'Bón cách gốc 20cm',
            'ket_qua' => '',
            'hinh_anh' => '',
            'created_at' => date('Y-m-d H:i:s')
        ],
        [
            'ten_cong_viec' => 'Thu hoạch rau xà lách',
            'mo_ta' => 'Thu hoạch 200 cây xà lách đã đủ tuổi',
            'loai_cong_viec' => 'Thu hoạch',
            'ngay_bat_dau' => date('Y-m-d', strtotime('+2 days')),
            'ngay_ket_thuc' => date('Y-m-d', strtotime('+2 days')),
            'thoi_gian_bat_dau' => '07:00:00',
            'thoi_gian_ket_thuc' => '12:00:00',
            'thoi_gian_du_kien' => '1 ngày',
            'trang_thai' => 'chua_lam',
            'uu_tien' => 'cao',
            'ma_nguoi_dung' => $farmerId,
            'ghi_chu' => 'Cắt sát gốc, bảo quản trong thùng mát',
            'ket_qua' => '',
            'hinh_anh' => '',
            'created_at' => date('Y-m-d H:i:s')
        ]
    ];
    
    $inserted = 0;
    foreach ($sampleTasks as $task) {
        $stmt = $pdo->prepare("
            INSERT INTO lich_lam_viec 
            (ten_cong_viec, mo_ta, loai_cong_viec, ngay_bat_dau, ngay_ket_thuc, 
             thoi_gian_bat_dau, thoi_gian_ket_thuc, thoi_gian_du_kien, trang_thai, 
             uu_tien, ma_nguoi_dung, ghi_chu, ket_qua, hinh_anh, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        if ($stmt->execute([
            $task['ten_cong_viec'], $task['mo_ta'], $task['loai_cong_viec'],
            $task['ngay_bat_dau'], $task['ngay_ket_thuc'], $task['thoi_gian_bat_dau'],
            $task['thoi_gian_ket_thuc'], $task['thoi_gian_du_kien'], $task['trang_thai'],
            $task['uu_tien'], $task['ma_nguoi_dung'], $task['ghi_chu'],
            $task['ket_qua'], $task['hinh_anh'], $task['created_at']
        ])) {
            $inserted++;
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => "Đã tạo $inserted công việc mẫu cho nông dân ID: $farmerId"
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi: ' . $e->getMessage()
    ]);
}
?>