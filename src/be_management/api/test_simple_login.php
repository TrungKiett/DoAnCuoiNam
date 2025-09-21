<?php
// Test API simple_login.php
$testData = [
    'so_dien_thoai' => '0912345678',
    'mat_khau' => '123456'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/doancuoinam/src/be_management/api/simple_login.php');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "=== TEST SIMPLE LOGIN API ===\n";
echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";
?>
