<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$ma_lo_trong = $input['ma_lo_trong'] ?? null;
$dien_tich_trong = $input['dien_tich_trong'] ?? null; // decimal(10,2)
$ngay_du_kien_thu_hoach = $input['ngay_du_kien_thu_hoach'] ?? null; // date
$ngay_bat_dau = $input['ngay_bat_dau'] ?? null; // date
$trang_thai = $input['trang_thai'] ?? null; // enum('chuan_bi','dang_trong','da_thu_hoach') or localized value mapping
$so_luong_nhan_cong = $input['so_luong_nhan_cong'] ?? null;
$ghi_chu = $input['ghi_chu'] ?? null;
$ma_giong = $input['ma_giong'] ?? null;

// Cho phép dien_tich_trong để trống vì diện tích do hệ thống quản lý
if ($ma_lo_trong === null || $trang_thai === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

try {
    // Debug: Log the input data
    error_log("Input data: " . json_encode($input));
    
    // Check if table exists and has the right structure
    $stmt = $pdo->query("SHOW COLUMNS FROM ke_hoach_san_xuat LIKE 'so_luong_nhan_cong'");
    if ($stmt->rowCount() == 0) {
        throw new Exception("Column 'so_luong_nhan_cong' does not exist in ke_hoach_san_xuat table. Please run update_database.php first.");
    }
    
    // Auto-fill dien_tich_trong if null (get from lo_trong or default 0)
    if ($dien_tich_trong === null) {
        try {
            $stmtArea = $pdo->prepare("SELECT dien_tich FROM lo_trong WHERE ma_lo_trong = ? LIMIT 1");
            $stmtArea->execute([$ma_lo_trong]);
            $rowArea = $stmtArea->fetch(PDO::FETCH_ASSOC);
            if ($rowArea && isset($rowArea['dien_tich']) && $rowArea['dien_tich'] !== null) {
                $dien_tich_trong = (float)$rowArea['dien_tich'];
            } else {
                $dien_tich_trong = 0; // fallback an toàn cho cột NOT NULL
            }
        } catch (Throwable $e) {
            // nếu bảng không có hoặc lỗi khác, fallback 0
            $dien_tich_trong = 0;
        }
    }

    // Ràng buộc: Nếu lô đã có kế hoạch trước đó, ngày bắt đầu mới phải >= ngày thu hoạch trước + 10 ngày
    if ($ma_lo_trong !== null && $ngay_bat_dau !== null) {
        try {
            $stmtPrev = $pdo->prepare("SELECT ngay_du_kien_thu_hoach FROM ke_hoach_san_xuat WHERE ma_lo_trong = ? ORDER BY ma_ke_hoach DESC LIMIT 1");
            $stmtPrev->execute([$ma_lo_trong]);
            $prev = $stmtPrev->fetch(PDO::FETCH_ASSOC);
            if ($prev && !empty($prev['ngay_du_kien_thu_hoach'])) {
                $prevHarvest = new DateTime($prev['ngay_du_kien_thu_hoach']);
                $minStart = clone $prevHarvest;
                $minStart->modify('+10 day');
                $newStart = new DateTime($ngay_bat_dau);
                if ($newStart < $minStart) {
                    http_response_code(400);
                    echo json_encode(["success" => false, "error" => "Ngày bắt đầu không hợp lệ. Phải sau ngày thu hoạch trước ít nhất 10 ngày (>= " . $minStart->format('Y-m-d') . ")"]);
                    exit;
                }
            }
        } catch (Throwable $e) {
            // Nếu có lỗi khi kiểm tra, vẫn tiếp tục nhưng ghi log để không phá vỡ chức năng chính
            error_log('Validate min start date failed: ' . $e->getMessage());
        }
    }

    // Insert with optional fields (diện tích có thể null)
    $stmt = $pdo->prepare("INSERT INTO ke_hoach_san_xuat (ma_lo_trong, dien_tich_trong, ngay_bat_dau, ngay_du_kien_thu_hoach, trang_thai, so_luong_nhan_cong, ghi_chu, ma_giong) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$ma_lo_trong, $dien_tich_trong, $ngay_bat_dau, $ngay_du_kien_thu_hoach, $trang_thai, $so_luong_nhan_cong, $ghi_chu, $ma_giong]);
    
    $insertedId = $pdo->lastInsertId();
    error_log("Successfully created plan with ID: " . $insertedId);
    
    echo json_encode([
        "success" => true, 
        "id" => $insertedId,
        "message" => "Kế hoạch đã được tạo thành công"
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("Database error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage(),
        "details" => "Database operation failed. Check server logs for more info.",
        "input_data" => $input
    ]);
}


