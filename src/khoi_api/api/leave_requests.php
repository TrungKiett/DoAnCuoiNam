<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            handleGetLeaveRequests($pdo);
            break;
        case 'POST':
            handleCreateLeaveRequest($pdo);
            break;
        case 'PUT':
            handleUpdateLeaveRequest($pdo);
            break;
        case 'DELETE':
            handleDeleteLeaveRequest($pdo);
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

function handleGetLeaveRequests($pdo) {
    $query = "
        SELECT 
            lr.*,
            u.ho_ten as worker_name,
            u.username as worker_username
        FROM leave_requests lr 
        LEFT JOIN users u ON lr.worker_id = u.ma_nguoi_dung 
        ORDER BY lr.created_at DESC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $requests
    ]);
}

function handleCreateLeaveRequest($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $workerId = $input['worker_id'] ?? null;
    $startDate = $input['start_date'] ?? null;
    $endDate = $input['end_date'] ?? null;
    $reason = $input['reason'] ?? '';
    $type = $input['type'] ?? 'personal';
    $status = $input['status'] ?? 'pending';
    
    if (!$workerId || !$startDate || !$endDate) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }
    
    // Create table if not exists
    $createTableQuery = "
        CREATE TABLE IF NOT EXISTS leave_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            worker_id INT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            reason TEXT,
            type ENUM('sick', 'personal', 'other') DEFAULT 'personal',
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ";
    $pdo->exec($createTableQuery);
    
    $query = "
        INSERT INTO leave_requests (worker_id, start_date, end_date, reason, type, status) 
        VALUES (?, ?, ?, ?, ?, ?)
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$workerId, $startDate, $endDate, $reason, $type, $status]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Leave request created successfully',
        'id' => $pdo->lastInsertId()
    ]);
}

function handleUpdateLeaveRequest($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = $input['id'] ?? null;
    $status = $input['status'] ?? null;
    
    if (!$id || !$status) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }
    
    $query = "UPDATE leave_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$status, $id]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Leave request updated successfully'
    ]);
}

function handleDeleteLeaveRequest($pdo) {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing ID']);
        return;
    }
    
    $query = "DELETE FROM leave_requests WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$id]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Leave request deleted successfully'
    ]);
}
?>


