<?php
// Unified DB connection for auth components
/*

$host = 'localhost';
$port = 3306; // port MySQL trên XAMPP
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
    */
?>

<?php
// Unified DB connection for auth components
/*

$host = 'localhost';
$port = 3306; // port MySQL trên XAMPP
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
    */
?>

<?php
// Cấu hình môi trường Local (cho máy tính cá nhân)
// Vui lòng điền thông tin kết nối DB local của bạn vào đây
$local_host = 'localhost';
$local_port = 3306;
$local_db   = 'farm'; // Thay bằng tên database local của bạn
$local_user = 'root';
$local_pass = ''; // Mật khẩu mặc định của XAMPP/MAMP thường là rỗng

// 1. Cố gắng lấy Biến môi trường từ Vercel (Clever Cloud Addon)
$host = getenv('MYSQL_ADDON_HOST');
$port = getenv('MYSQL_ADDON_PORT');
$db   = getenv('MYSQL_ADDON_DB'); 
$user = getenv('MYSQL_ADDON_USER');
$pass = getenv('MYSQL_ADDON_PASSWORD');

$charset = 'utf8mb4';

// 2. Kiểm tra: Nếu không có biến môi trường (Chạy Local), dùng cấu hình Local
if (!$host) {
    $host = $local_host;
    $port = $local_port;
    $db   = $local_db;
    $user = $local_user;
    $pass = $local_pass;
}

// 3. Chuỗi kết nối (Data Source Name - DSN)
$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";

try {
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        // *** TÙY CHỌN BẢO MẬT/KẾT NỐI: 
        // Nếu kết nối bị lỗi chứng chỉ/SSL, hãy bỏ comment (dấu //) dòng sau:
        // PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false
    ];
    
    $conn = new PDO($dsn, $user, $pass, $options);
    
    // Expose PDO instance for APIs that include config.php
    $pdo = $conn;

} catch (PDOException $e) {
    // Xử lý lỗi kết nối
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    
    // Ghi chú: Chỉ hiển thị lỗi chi tiết cho mục đích học tập/debug, không nên dùng trong production
    echo json_encode([
        'status' => 'error',
        'message' => 'DB connect failed: ' . $e->getMessage() . 
                     (getenv('VERCEL_ENV') ? '' : ' (Kiểm tra lại cấu hình Local)')
    ]);
    exit;
}
?>