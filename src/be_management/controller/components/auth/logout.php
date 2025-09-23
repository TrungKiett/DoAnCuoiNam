<?php
// Cho phép trả về JSON
header('Content-Type: application/json; charset=utf-8');

// Nếu dùng cookie từ frontend (React fetch có credentials: "include")
header("Access-Control-Allow-Origin: http://localhost:3000"); // domain React
header("Access-Control-Allow-Credentials: true");

session_start();
session_unset();
session_destroy();

echo json_encode([
    "success" => true,
    "message" => "Đăng xuất thành công!"
]);
exit;