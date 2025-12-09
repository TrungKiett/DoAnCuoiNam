<?php
// Unified DB connection for auth components

$host = 'localhost';
$port = 4306; // port MySQL trên XAMPP
$db   = 'farm';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";

try {
    $conn = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    // Expose PDO instance for APIs that include config.php
    $pdo = $conn;
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'status' => 'error',
        'message' => 'DB connect failed: ' . $e->getMessage()
    ]);
    exit;
}
    
?>

<?php
// // Sử dụng getenv() để đọc biến môi trường từ Vercel
// $host = getenv('btzly5zz4fcz7jjejuzg-mysql.services.clever-cloud.com');
// $port = getenv('3306');
// $db   = getenv('btzly5zz4fcz7jjejuzg'); 
// $user = getenv('upxmqubzbr3xqasl');
// $pass = getenv('jnpEt3FJ63hExxpz6Gow');
// $charset = 'utf8mb4';

// // Kiểm tra: Nếu không có biến môi trường (chạy local/XAMPP), dùng giá trị mặc định
// if (!$host) {
//     $host = 'btzly5zz4fcz7jjejuzg-mysql.services.clever-cloud.com';
//     $port = 3306;
//     $db   = 'btzly5zz4fcz7jjejuzg'; // Giữ lại tên DB local nếu cần
//     $user = 'upxmqubzbr3xqasl';
//     $pass = 'npEt3FJ63hExxpz6Gow';
// }

// // Chuỗi kết nối (Data Source Name - DSN)
// $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";

// try {
//     $conn = new PDO($dsn, $user, $pass, [
//         PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
//         PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
//     ]);
//     // Expose PDO instance for APIs that include config.php
//     $pdo = $conn;
// } catch (PDOException $e) {
//     http_response_code(500);
//     header('Content-Type: application/json; charset=UTF-8');
//     echo json_encode([
//         'status' => 'error',
//         'message' => 'DB connect failed: ' . $e->getMessage()
//     ]);
//     exit;
// }
?>