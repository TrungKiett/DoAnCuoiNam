<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$ma_lo_trong = $input['ma_lo_trong'] ?? null;
$trang_thai = $input['trang_thai'] ?? null;

if ($ma_lo_trong === null || $trang_thai === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

try {
    // Map plan status to lot status
    $statusMap = [
        'chuan_bi' => 'dang_chuan_bi',
        'dang_trong' => 'dang_canh_tac', 
        'da_thu_hoach' => 'hoan_thanh'
    ];
    
    $lotStatus = $statusMap[$trang_thai] ?? 'dang_chuan_bi';
    
    $stmt = $pdo->prepare("UPDATE lo_trong SET trang_thai = ? WHERE ma_lo_trong = ?");
    $stmt->execute([$lotStatus, $ma_lo_trong]);
    
    echo json_encode(["success" => true, "message" => "Lot status updated"]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("Update lot error: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
