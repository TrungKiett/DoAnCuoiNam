<?php
require_once __DIR__ . '/config.php';

echo json_encode([
    "success" => true,
    "message" => "API connection working",
    "timestamp" => date('Y-m-d H:i:s'),
    "database" => "Connected"
]);
?>
