<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$ma_lo_trong = $input['ma_lo_trong'] ?? null;
$dien_tich = isset($input['dien_tich']) && $input['dien_tich'] !== '' ? floatval($input['dien_tich']) : null;

// Validate lot id must be a positive integer
if ($ma_lo_trong === null || !is_numeric($ma_lo_trong) || intval($ma_lo_trong) <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "ma_lo_trong must be a positive integer"]);
    exit;
}
$ma_lo_trong = intval($ma_lo_trong);

try {
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

    // Check if lo_trong exists
    $stmt = $pdo->prepare("SELECT ma_lo_trong FROM lo_trong WHERE ma_lo_trong = ?");
    $stmt->execute([$ma_lo_trong]);
    $exists = $stmt->fetch();
    
    if (!$exists) {
        // Insert minimal fields; avoid assuming ma_giong=1 exists
        $fields = ['ma_lo_trong'];
        $placeholders = ['?'];
        $values = [$ma_lo_trong];
        if ($hasDienTich && $dien_tich !== null) {
            $fields[] = 'dien_tich';
            $placeholders[] = '?';
            $values[] = $dien_tich;
        }
        if ($hasMaGiong && isset($input['ma_giong']) && $input['ma_giong'] !== '') {
            $fields[] = 'ma_giong';
            $placeholders[] = '?';
            $values[] = intval($input['ma_giong']);
        }
        // Ensure new lot is not created in a logically deleted state
        if ($hasTrangThaiLo) {
            $fields[] = 'trang_thai_lo';
            $placeholders[] = '?';
            $values[] = 'active';
        }
        $sql = "INSERT INTO lo_trong (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
        $ins = $pdo->prepare($sql);
        $ins->execute($values);
        echo json_encode(["success" => true, "created" => true, "message" => "Created new lo_trong", "updated_dien_tich" => ($hasDienTich && $dien_tich !== null)]);
    } else {
        // Update dien_tich if provided and column exists
        if ($hasDienTich && $dien_tich !== null) {
            $up = $pdo->prepare("UPDATE lo_trong SET dien_tich = ? WHERE ma_lo_trong = ?");
            $up->execute([$dien_tich, $ma_lo_trong]);
            echo json_encode(["success" => true, "created" => false, "message" => "lo_trong already exists", "updated_dien_tich" => true]);
        } else {
            echo json_encode(["success" => true, "created" => false, "message" => "lo_trong already exists", "updated_dien_tich" => false]);
        }
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
