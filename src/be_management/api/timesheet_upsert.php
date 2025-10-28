<?php
require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');

try {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $workerId = $input['worker_id'] ?? null; // int
    $date = $input['date'] ?? null; // YYYY-MM-DD
    $hours = isset($input['hours']) ? floatval($input['hours']) : null; // number
    $taskId = $input['task_id'] ?? null; // optional

    if ($workerId === null || !$date || $hours === null) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing worker_id/date/hours"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Create table if not exists (simple timesheet)
    $pdo->exec("CREATE TABLE IF NOT EXISTS bang_cong (
        id INT AUTO_INCREMENT PRIMARY KEY,
        worker_id INT NOT NULL,
        ngay DATE NOT NULL,
        so_gio DECIMAL(5,2) NOT NULL DEFAULT 0,
        task_id INT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_worker_date_task (worker_id, ngay, task_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Upsert by (worker_id, ngay, task_id)
    $stmt = $pdo->prepare("INSERT INTO bang_cong(worker_id, ngay, so_gio, task_id)
        VALUES(?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE so_gio = VALUES(so_gio), updated_at = CURRENT_TIMESTAMP");
    $stmt->execute([$workerId, $date, $hours, $taskId]);

    echo json_encode(["success" => true], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    error_log('timesheet_upsert error: ' . $e->getMessage());
    echo json_encode(["success" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}


