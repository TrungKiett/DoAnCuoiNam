<?php
echo "<h2>Testing API endpoints</h2>";

echo "<h3>1. Testing lich_lam_viec_list.php</h3>";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://yensonfarm.io.vn/khoi_api/api/lich_lam_viec_list.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "<p><strong>HTTP Code:</strong> $httpCode</p>";
echo "<p><strong>Response:</strong></p>";
echo "<pre>" . htmlspecialchars($response) . "</pre>";

echo "<h3>2. Testing database connection</h3>";
try {
    require_once __DIR__ . '/../config.php';
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM lich_lam_viec");
    $result = $stmt->fetch();
    echo "<p><strong>Total tasks in database:</strong> " . $result['count'] . "</p>";
} catch (Exception $e) {
    echo "<p style='color: red;'><strong>Database error:</strong> " . $e->getMessage() . "</p>";
}
?>
