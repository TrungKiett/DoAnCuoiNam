<?php
require_once __DIR__ . '/../config.php';

try {
    // Add ma_giong column to ke_hoach_san_xuat if missing
    $stmt = $pdo->query("SHOW COLUMNS FROM ke_hoach_san_xuat LIKE 'ma_giong'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE ke_hoach_san_xuat ADD COLUMN ma_giong INT NULL AFTER ghi_chu");
        echo json_encode(["success" => true, "message" => "Added column ma_giong to ke_hoach_san_xuat"]);
    } else {
        echo json_encode(["success" => true, "message" => "Schema up to date"]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

// Add ngay_bat_dau if missing
try {
    $stmt = $pdo->query("SHOW COLUMNS FROM ke_hoach_san_xuat LIKE 'ngay_bat_dau'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE ke_hoach_san_xuat ADD COLUMN ngay_bat_dau DATE NULL AFTER dien_tich_trong");
        // silently ok
    }
} catch (Throwable $e) {
    // ignore
}

