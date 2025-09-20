<?php
require_once __DIR__ . '/config.php';

try {
    $stmt = $pdo->query("SELECT NOW() AS server_time");
    $row = $stmt->fetch();
    echo json_encode([
        "ok" => true,
        "server_time" => $row["server_time"] ?? null
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}


