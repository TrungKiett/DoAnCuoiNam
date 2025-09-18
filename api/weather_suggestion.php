<?php
// Simple stub to provide weather-based suggestions for a lot
// In future, integrate with real weather API and farm coordinates
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $input = file_get_contents('php://input');
    $payload = json_decode($input, true) ?: [];
    $ma_lo_trong = $payload['ma_lo_trong'] ?? ($_GET['ma_lo_trong'] ?? null);

    $suggestions = [];
    $alerts = [];

    // Attempt to read lot coordinates if available
    $lat = null; $lng = null;
    if ($ma_lo_trong) {
        $stmtCheck = $pdo->query("SHOW TABLES LIKE 'lo_trong'");
        if ($stmtCheck->rowCount() > 0) {
            $cols = $pdo->query("SHOW COLUMNS FROM lo_trong")->fetchAll(PDO::FETCH_COLUMN);
            $select = ['ma_lo_trong'];
            if (in_array('toa_do_lat', $cols)) $select[] = 'toa_do_lat';
            if (in_array('toa_do_lng', $cols)) $select[] = 'toa_do_lng';
            $sql = 'SELECT ' . implode(',', $select) . ' FROM lo_trong WHERE ma_lo_trong = :mlt LIMIT 1';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':mlt' => $ma_lo_trong]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $lat = isset($row['toa_do_lat']) ? floatval($row['toa_do_lat']) : null;
                $lng = isset($row['toa_do_lng']) ? floatval($row['toa_do_lng']) : null;
            }
        }
    }

    // Stubbed logic
    $forecast = 'nang_nong'; // pretend we detected a heatwave
    if ($forecast === 'nang_nong') {
        $suggestions[] = 'Dự báo nắng nóng kéo dài 3 ngày tới. Cần tăng cường tưới nước, che phủ gốc và kiểm tra độ ẩm đất mỗi ngày.';
        $alerts[] = 'Nhiệt độ cao có thể gây stress cây. Lưu ý tưới vào sáng sớm hoặc chiều mát.';
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'ma_lo_trong' => $ma_lo_trong,
            'lat' => $lat,
            'lng' => $lng,
            'suggestions' => $suggestions,
            'alerts' => $alerts
        ]
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}


