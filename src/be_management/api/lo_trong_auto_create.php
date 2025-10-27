<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$dien_tich = isset($input['dien_tich']) && $input['dien_tich'] !== '' ? floatval($input['dien_tich']) : 10.0;

try {
    $pdo->beginTransaction();

    // Detect available columns
    $hasDienTich = false;
    $hasMaGiong = false;
    $hasTrangThaiLo = false;
    try {
        $colsStmt = $pdo->query("SHOW COLUMNS FROM lo_trong");
        $cols = $colsStmt->fetchAll(PDO::FETCH_COLUMN);
        $hasDienTich = in_array('dien_tich', $cols);
        $hasMaGiong = in_array('ma_giong', $cols);
        $hasTrangThaiLo = in_array('trang_thai_lo', $cols);
    } catch (Throwable $e) {
        $hasDienTich = false;
        $hasMaGiong = false;
        $hasTrangThaiLo = false;
    }

    // Find the next available lot ID
    $stmt = $pdo->query("SELECT COALESCE(MAX(ma_lo_trong), 0) + 1 as next_id FROM lo_trong");
    $result = $stmt->fetch();
    $nextId = intval($result['next_id']);

    // Insert new lot with auto-generated ID
    $fields = ['ma_lo_trong'];
    $placeholders = ['?'];
    $values = [$nextId];
    
    if ($hasDienTich) {
        $fields[] = 'dien_tich';
        $placeholders[] = '?';
        $values[] = $dien_tich;
    }
    
    if ($hasMaGiong && isset($input['ma_giong']) && $input['ma_giong'] !== '') {
        $fields[] = 'ma_giong';
        $placeholders[] = '?';
        $values[] = intval($input['ma_giong']);
    }
    
    if ($hasTrangThaiLo) {
        $fields[] = 'trang_thai_lo';
        $placeholders[] = '?';
        $values[] = 'active';
    }

    $sql = "INSERT INTO lo_trong (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
    $ins = $pdo->prepare($sql);
    $ins->execute($values);

    $pdo->commit();
    echo json_encode([
        "success" => true, 
        "ma_lo_trong" => $nextId,
        "message" => "Đã tạo lô mới với mã lô: " . $nextId
    ]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) { 
        try { 
            $pdo->rollBack(); 
        } catch (Throwable $ignore) {} 
    }
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
