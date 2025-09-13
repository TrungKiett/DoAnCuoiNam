<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

// Tạo thư mục uploads nếu chưa có
$uploadDir = __DIR__ . '/../uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No file uploaded']);
    exit;
}

if ($_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
        UPLOAD_ERR_INI_SIZE => 'File too large (server limit)',
        UPLOAD_ERR_FORM_SIZE => 'File too large (form limit)',
        UPLOAD_ERR_PARTIAL => 'File upload was interrupted',
        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
        UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
    ];
    $errorMsg = $errorMessages[$_FILES['image']['error']] ?? 'Unknown upload error';
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $errorMsg]);
    exit;
}

$file = $_FILES['image'];

// Kiểm tra loại file
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($file['type'], $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.']);
    exit;
}

// Kiểm tra kích thước file (max 5MB)
$maxSize = 5 * 1024 * 1024; // 5MB
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File too large. Maximum size is 5MB.']);
    exit;
}

// Tạo tên file unique
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$fileName = uniqid('task_', true) . '.' . $extension;
$filePath = $uploadDir . $fileName;

// Di chuyển file
if (move_uploaded_file($file['tmp_name'], $filePath)) {
    // Trả về đường dẫn relative
    $relativePath = 'uploads/' . $fileName;
    echo json_encode([
        'success' => true, 
        'filePath' => $relativePath,
        'fileName' => $fileName,
        'debug' => [
            'uploadDir' => $uploadDir,
            'filePath' => $filePath,
            'fileSize' => $file['size'],
            'fileType' => $file['type']
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Failed to save file',
        'debug' => [
            'uploadDir' => $uploadDir,
            'filePath' => $filePath,
            'tmpName' => $file['tmp_name'],
            'isWritable' => is_writable($uploadDir)
        ]
    ]);
}
?>
