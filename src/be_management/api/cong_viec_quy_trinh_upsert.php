<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$ma_cong_viec = $input['ma_cong_viec'] ?? null; // null => create
$quy_trinh_id = $input['quy_trinh_id'] ?? ($input['ma_quy_trinh'] ?? null); // accept ma_quy_trinh too
$ten_cong_viec = $input['ten_cong_viec'] ?? null;
$mo_ta = $input['mo_ta'] ?? null;
// accept both schema styles (offset or concrete date)
$thoi_gian_bat_dau = $input['thoi_gian_bat_dau'] ?? null;
$thoi_gian_ket_thuc = $input['thoi_gian_ket_thuc'] ?? null;
$ngay_bat_dau = $input['ngay_bat_dau'] ?? null;
$ngay_ket_thuc = $input['ngay_ket_thuc'] ?? null;
$so_nguoi_can = $input['so_nguoi_can'] ?? $input['so_nguoi'] ?? null; // Accept both so_nguoi_can and so_nguoi
$so_nguoi = $input['so_nguoi'] ?? $input['so_nguoi_can'] ?? null; // Accept both
// Convert empty string to null
if ($so_nguoi_can === "" || $so_nguoi_can === "0") $so_nguoi_can = null;
if ($so_nguoi === "" || $so_nguoi === "0") $so_nguoi = null;
// Convert to integer if not null
if ($so_nguoi_can !== null) $so_nguoi_can = intval($so_nguoi_can);
if ($so_nguoi !== null) $so_nguoi = intval($so_nguoi);
// Ensure both fields have the same value if one is set
if ($so_nguoi_can !== null && $so_nguoi === null) $so_nguoi = $so_nguoi_can;
if ($so_nguoi !== null && $so_nguoi_can === null) $so_nguoi_can = $so_nguoi;
error_log("DEBUG: so_nguoi_can = " . var_export($so_nguoi_can, true) . ", so_nguoi = " . var_export($so_nguoi, true));
$nhan_cong = $input['nhan_cong'] ?? null;
$thu_tu_thuc_hien = $input['thu_tu_thuc_hien'] ?? null;
$lap_lai = $input['lap_lai'] ?? 0;
$khoang_cach_lap_lai = $input['khoang_cach_lap_lai'] ?? null;
$khoang_cach = $input['khoang_cach'] ?? null; // gap in days to next step
error_log("DEBUG: khoang_cach received = " . var_export($khoang_cach, true));

if ($ten_cong_viec === null || $quy_trinh_id === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing required fields (ten_cong_viec, quy_trinh_id)"]);
    exit;
}

try {
    // discover existing column names to map correctly
    $columns = [];
    try {
        $colsStmt = $pdo->query("SHOW COLUMNS FROM cong_viec_quy_trinh");
        foreach ($colsStmt->fetchAll() as $c) { $columns[$c['Field']] = true; }
    } catch (Throwable $_) {}

    // FK column detection
    $fkCol = isset($columns['quy_trinh_id']) ? 'quy_trinh_id' : (isset($columns['ma_quy_trinh']) ? 'ma_quy_trinh' : 'quy_trinh_id');

    if ($ma_cong_viec) {
        $fields = [];
        $values = [];
        $fields[] = 'ten_cong_viec = ?'; $values[] = $ten_cong_viec;
        $fields[] = 'mo_ta = ?'; $values[] = $mo_ta;
        if ($thoi_gian_bat_dau !== null && isset($columns['thoi_gian_bat_dau'])) { $fields[] = 'thoi_gian_bat_dau = ?'; $values[] = $thoi_gian_bat_dau; }
        if ($thoi_gian_ket_thuc !== null && isset($columns['thoi_gian_ket_thuc'])) { $fields[] = 'thoi_gian_ket_thuc = ?'; $values[] = $thoi_gian_ket_thuc; }
        if ($ngay_bat_dau !== null && isset($columns['ngay_bat_dau'])) { $fields[] = 'ngay_bat_dau = ?'; $values[] = $ngay_bat_dau; }
        if ($ngay_ket_thuc !== null && isset($columns['ngay_ket_thuc'])) { $fields[] = 'ngay_ket_thuc = ?'; $values[] = $ngay_ket_thuc; }
        // Update so_nguoi_can and so_nguoi if columns exist and value is provided
        // Ensure both columns get the same value if one is set
        $finalSoNguoiCan = $so_nguoi_can !== null ? $so_nguoi_can : ($so_nguoi !== null ? $so_nguoi : null);
        $finalSoNguoi = $so_nguoi !== null ? $so_nguoi : ($so_nguoi_can !== null ? $so_nguoi_can : null);
        
        // Only update if value is not null and column exists
        if ($finalSoNguoiCan !== null && isset($columns['so_nguoi_can'])) { 
            $fields[] = 'so_nguoi_can = ?'; 
            $values[] = $finalSoNguoiCan; 
            error_log("DEBUG: UPDATE so_nguoi_can = " . var_export($finalSoNguoiCan, true));
        }
        if ($finalSoNguoi !== null && isset($columns['so_nguoi'])) { 
            $fields[] = 'so_nguoi = ?'; 
            $values[] = $finalSoNguoi; 
            error_log("DEBUG: UPDATE so_nguoi = " . var_export($finalSoNguoi, true));
        }
        // If both are null but columns exist, we can optionally set them to NULL
        // But for now, we skip updating them if null to avoid issues
        if ($nhan_cong !== null && isset($columns['nhan_cong'])) { $fields[] = 'nhan_cong = ?'; $values[] = $nhan_cong; }
        if ($thu_tu_thuc_hien !== null && isset($columns['thu_tu_thuc_hien'])) { $fields[] = 'thu_tu_thuc_hien = ?'; $values[] = $thu_tu_thuc_hien; }
        if (isset($columns['lap_lai'])) { $fields[] = 'lap_lai = ?'; $values[] = $lap_lai; }
        if ($khoang_cach_lap_lai !== null && isset($columns['khoang_cach_lap_lai'])) { $fields[] = 'khoang_cach_lap_lai = ?'; $values[] = $khoang_cach_lap_lai; }
        if (isset($columns['khoang_cach'])) { 
            // Always set khoang_cach, use default 5 if null
            $khoangCachValue = $khoang_cach !== null ? $khoang_cach : 5;
            $fields[] = 'khoang_cach = ?'; 
            $values[] = $khoangCachValue; 
            error_log("DEBUG: Setting khoang_cach = " . $khoangCachValue . " for UPDATE");
        }
        $values[] = $ma_cong_viec;
        $sql = 'UPDATE cong_viec_quy_trinh SET ' . implode(', ', $fields) . ' WHERE ma_cong_viec = ?';
        error_log("DEBUG: UPDATE SQL = " . $sql);
        error_log("DEBUG: UPDATE values = " . var_export($values, true));
        $stmt = $pdo->prepare($sql);
        if (!$stmt) {
            throw new Exception("Failed to prepare UPDATE statement: " . implode(", ", $pdo->errorInfo()));
        }
        $stmt->execute($values);
        echo json_encode(["success" => true, "mode" => "update", "affected_rows" => $stmt->rowCount()]);
    } else {
        // Build INSERT dynamically according to existing columns
        $cols = [$fkCol, 'ten_cong_viec', 'mo_ta'];
        $vals = [$quy_trinh_id, $ten_cong_viec, $mo_ta];
        if (isset($columns['thoi_gian_bat_dau'])) { $cols[]='thoi_gian_bat_dau'; $vals[]=$thoi_gian_bat_dau; }
        if (isset($columns['thoi_gian_ket_thuc'])) { $cols[]='thoi_gian_ket_thuc'; $vals[]=$thoi_gian_ket_thuc; }
        if (isset($columns['ngay_bat_dau'])) { $cols[]='ngay_bat_dau'; $vals[]=$ngay_bat_dau; }
        if (isset($columns['ngay_ket_thuc'])) { $cols[]='ngay_ket_thuc'; $vals[]=$ngay_ket_thuc; }
        // Ensure both columns get the same value if one is set
        $finalSoNguoiCan = $so_nguoi_can !== null ? $so_nguoi_can : ($so_nguoi !== null ? $so_nguoi : null);
        $finalSoNguoi = $so_nguoi !== null ? $so_nguoi : ($so_nguoi_can !== null ? $so_nguoi_can : null);
        
        if (isset($columns['so_nguoi_can']) && $finalSoNguoiCan !== null) { 
            $cols[]='so_nguoi_can'; 
            $vals[]=$finalSoNguoiCan; 
            error_log("DEBUG: INSERT so_nguoi_can = " . var_export($finalSoNguoiCan, true));
        }
        if (isset($columns['so_nguoi']) && $finalSoNguoi !== null) { 
            $cols[]='so_nguoi'; 
            $vals[]=$finalSoNguoi; 
            error_log("DEBUG: INSERT so_nguoi = " . var_export($finalSoNguoi, true));
        }
        if (isset($columns['nhan_cong'])) { $cols[]='nhan_cong'; $vals[]=$nhan_cong; }
        if (isset($columns['thu_tu_thuc_hien'])) { $cols[]='thu_tu_thuc_hien'; $vals[]=$thu_tu_thuc_hien; }
        if (isset($columns['lap_lai'])) { $cols[]='lap_lai'; $vals[]=$lap_lai; }
        if (isset($columns['khoang_cach_lap_lai'])) { $cols[]='khoang_cach_lap_lai'; $vals[]=$khoang_cach_lap_lai; }
        if (isset($columns['khoang_cach'])) { 
            $khoangCachValue = $khoang_cach !== null ? $khoang_cach : 5;
            $cols[]='khoang_cach'; 
            $vals[]=$khoangCachValue; 
        }

        $placeholders = implode(', ', array_fill(0, count($cols), '?'));
        $sql = 'INSERT INTO cong_viec_quy_trinh (' . implode(', ', $cols) . ') VALUES (' . $placeholders . ')';
        error_log("DEBUG: INSERT SQL = " . $sql);
        error_log("DEBUG: INSERT values = " . var_export($vals, true));
        $stmt = $pdo->prepare($sql);
        if (!$stmt) {
            throw new Exception("Failed to prepare INSERT statement: " . implode(", ", $pdo->errorInfo()));
        }
        $stmt->execute($vals);
        echo json_encode(["success" => true, "mode" => "create", "ma_cong_viec" => $pdo->lastInsertId()]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    $errorMsg = $e->getMessage();
    $errorInfo = $e->getTraceAsString();
    error_log("ERROR in cong_viec_quy_trinh_upsert: " . $errorMsg);
    error_log("ERROR trace: " . $errorInfo);
    if (isset($pdo) && $pdo->errorInfo()[0] !== '00000') {
        error_log("PDO error: " . var_export($pdo->errorInfo(), true));
        $errorMsg .= " | PDO: " . implode(", ", $pdo->errorInfo());
    }
    echo json_encode([
        "success" => false, 
        "error" => $errorMsg,
        "debug" => [
            "message" => $e->getMessage(),
            "file" => $e->getFile(),
            "line" => $e->getLine()
        ]
    ]);
}
?>


