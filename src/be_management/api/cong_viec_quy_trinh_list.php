<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$quy_trinh_id = $input['quy_trinh_id'] ?? null;

if (!$quy_trinh_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing quy_trinh_id"]);
    exit;
}

try {
    // Check if table exists first
    $stmt = $pdo->query("SHOW TABLES LIKE 'cong_viec_quy_trinh'");
    if ($stmt->rowCount() == 0) {
        echo json_encode([
            "success" => true,
            "data" => [],
            "message" => "Table 'cong_viec_quy_trinh' does not exist yet"
        ]);
        exit;
    }
    
    // Determine FK column name: prefer 'quy_trinh_id', fallback to 'ma_quy_trinh'
    $fkCol = 'quy_trinh_id';
    try {
        $colStmt = $pdo->query("SHOW COLUMNS FROM cong_viec_quy_trinh LIKE 'quy_trinh_id'");
        if ($colStmt->rowCount() === 0) {
            $altStmt = $pdo->query("SHOW COLUMNS FROM cong_viec_quy_trinh LIKE 'ma_quy_trinh'");
            if ($altStmt->rowCount() > 0) { $fkCol = 'ma_quy_trinh'; }
        }
    } catch (Throwable $_) {}

    // Lấy danh sách công việc theo quy trình (chọn toàn bộ cột để tránh lỗi tên cột)
    // Sort safely by primary key to avoid unknown column errors on custom schemas
    $stmt = $pdo->prepare("SELECT * FROM cong_viec_quy_trinh WHERE $fkCol = ? ORDER BY ma_cong_viec ASC");
    $stmt->execute([$quy_trinh_id]);
    $tasks = $stmt->fetchAll();
    
    echo json_encode([
        "success" => true,
        "data" => $tasks
    ]);
    
} catch (Throwable $e) {
    http_response_code(500);
    error_log("List process tasks error: " . $e->getMessage());
    error_log("SQL Error Code: " . $e->getCode());
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
        "debug_info" => "Check server logs for SQL details"
    ]);
}
?>
