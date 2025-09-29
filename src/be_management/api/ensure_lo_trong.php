<?php
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$ma_lo_trong = $input['ma_lo_trong'] ?? null;

// Validate lot id must be a positive integer
if ($ma_lo_trong === null || !is_numeric($ma_lo_trong) || intval($ma_lo_trong) <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "ma_lo_trong must be a positive integer"]);
    exit;
}
$ma_lo_trong = intval($ma_lo_trong);

try {
    // Check if lo_trong exists
    $stmt = $pdo->prepare("SELECT ma_lo_trong FROM lo_trong WHERE ma_lo_trong = ?");
    $stmt->execute([$ma_lo_trong]);
    $exists = $stmt->fetch();
    
    if (!$exists) {
        // Create lo_trong if it doesn't exist (safe against duplicates)
        $stmt = $pdo->prepare("INSERT IGNORE INTO lo_trong (ma_lo_trong, ma_giong) VALUES (?, 1)");
        $stmt->execute([$ma_lo_trong]);
        echo json_encode(["success" => true, "created" => true, "message" => "Created new lo_trong"]);
    } else {
        echo json_encode(["success" => true, "created" => false, "message" => "lo_trong already exists"]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
