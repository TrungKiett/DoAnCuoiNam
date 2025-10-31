<?php
require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');

try {
    $params = $_GET;
    $startDate = $params['start_date'] ?? null;
    $endDate = $params['end_date'] ?? null;
    $selectedWeek = isset($params['week']) ? intval($params['week']) : null;
    $selectedYear = isset($params['year']) ? intval($params['year']) : null;
    $filterWorkerId = isset($params['worker_id']) ? trim($params['worker_id']) : null;
    $includeTasks = ($filterWorkerId !== null && $filterWorkerId !== '');
    $approvedOnly = isset($params['approved_only']) ? filter_var($params['approved_only'], FILTER_VALIDATE_BOOLEAN) : false;
    
    // Get all farmers (nong_dan) from nguoi_dung table
    $farmersQuery = "
        SELECT 
            ma_nguoi_dung AS worker_id,
            ho_ten AS full_name,
            CONCAT('ND', LPAD(ma_nguoi_dung, 3, '0')) AS ma_nguoi_dung_formatted
        FROM nguoi_dung
        WHERE vai_tro = 'nong_dan'";

    if ($filterWorkerId !== null && $filterWorkerId !== '') {
        $farmersQuery .= " AND ma_nguoi_dung = :wid";
        $farmersStmt = $pdo->prepare($farmersQuery);
        $farmersStmt->execute([':wid' => $filterWorkerId]);
    } else {
        $farmersStmt = $pdo->query($farmersQuery);
    }
    $allFarmers = $farmersStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Initialize results array
    $results = [];
    
    // Determine week/year from provided start date (used to fetch status)
    $weekNumber = null;
    $yearOfPeriod = null;
    if ($selectedWeek && $selectedYear) {
        // Use values from client directly if provided
        $weekNumber = $selectedWeek;
        $yearOfPeriod = $selectedYear;
    } elseif ($startDate) {
        $startDt = new DateTime($startDate);
        // Fallback: ISO week; may differ from UI but keeps compatibility
        $weekNumber = (int)$startDt->format('W');
        $yearOfPeriod = (int)$startDt->format('Y');
    }

    // For each farmer, get their payroll data
    foreach ($allFarmers as $farmer) {
        $workerId = $farmer['worker_id'];
        $fullName = $farmer['full_name'];
        $maNguoiDungFormat = $farmer['ma_nguoi_dung_formatted'];
        
        // Get hours from lich_lam_viec where trang_thai indicates completion AND worker is assigned
        // Support ma_nguoi_dung stored as numeric IDs ("5,7") or formatted codes ("ND005,ND007")
        $workerIdFormatted = 'ND' . str_pad((string)$workerId, 3, '0', STR_PAD_LEFT);

        // We'll use a more efficient query that filters by worker ID using FIND_IN_SET
        $hoursQuery = "
            SELECT 
                ngay_bat_dau,
                thoi_gian_bat_dau,
                thoi_gian_ket_thuc,
                thoi_gian_du_kien,
                ma_nguoi_dung,
                ten_cong_viec,
                trang_thai
            FROM lich_lam_viec 
            WHERE (trang_thai = 'hoan_thanh' OR trang_thai = 'da_hoan_thanh')
            AND (
                FIND_IN_SET(?, ma_nguoi_dung) > 0 OR ma_nguoi_dung = ? OR
                FIND_IN_SET(?, ma_nguoi_dung) > 0 OR ma_nguoi_dung = ?
            )
        ";
        
        $hoursParams = [$workerId, $workerId, $workerIdFormatted, $workerIdFormatted];
        
        // Apply date filter if provided
        if ($startDate && $endDate) {
            $hoursQuery .= " AND ngay_bat_dau BETWEEN ? AND ?";
            $hoursParams[] = $startDate;
            $hoursParams[] = $endDate;
        }
        
        $hoursQuery .= " ORDER BY ngay_bat_dau ASC";
        
        $hoursStmt = $pdo->prepare($hoursQuery);
        $hoursStmt->execute($hoursParams);
        $hoursResults = $hoursStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calculate total hours
        $totalHours = 0;
        foreach ($hoursResults as $task) {
            // Calculate hours: prefer actual start/end times; if missing, fall back to thoi_gian_du_kien
            $startTimeStr = $task['thoi_gian_bat_dau'] ?? null;
            $endTimeStr = $task['thoi_gian_ket_thuc'] ?? null;

            $hoursAdded = 0.0;

            if ($startTimeStr && $endTimeStr) {
                // Parse TIME format (HH:MM:SS or HH:MM)
                $startParts = explode(':', $startTimeStr);
                $endParts = explode(':', $endTimeStr);
                
                if (count($startParts) >= 2 && count($endParts) >= 2) {
                    $startHour = (int)$startParts[0];
                    $startMinute = isset($startParts[1]) ? (int)$startParts[1] : 0;
                    $endHour = (int)$endParts[0];
                    $endMinute = isset($endParts[1]) ? (int)$endParts[1] : 0;
                    
                    // Calculate total minutes
                    $startTotalMinutes = $startHour * 60 + $startMinute;
                    $endTotalMinutes = $endHour * 60 + $endMinute;
                    
                    // If end time is earlier than start time, assume it's next day or same day wrap
                    if ($endTotalMinutes < $startTotalMinutes) {
                        $endTotalMinutes += 24 * 60; // Add 24 hours
                    }
                    
                    $hoursAdded = ($endTotalMinutes - $startTotalMinutes) / 60.0;
                }
            }

            // Fallback to planned duration if actual times are not available or zero
            if ($hoursAdded <= 0 && isset($task['thoi_gian_du_kien'])) {
                $planned = floatval($task['thoi_gian_du_kien']);
                if ($planned > 0) {
                    $hoursAdded = $planned;
                }
            }

            $totalHours += max(0, $hoursAdded);
        }
        
        // Round total hours to 2 decimal places
        $totalHours = round($totalHours, 2);
        
        // Get payroll data for this worker and period from bang_luong table
        if ($weekNumber && $yearOfPeriod) {
            $payrollQuery = "SELECT * FROM bang_luong WHERE (ma_nguoi_dung = ? OR ma_nguoi_dung = ?) AND tuan = ? AND nam = ? ORDER BY id_luong DESC LIMIT 1";
            $payrollStmt = $pdo->prepare($payrollQuery);
            $payrollStmt->execute([$workerId, $maNguoiDungFormat, $weekNumber, $yearOfPeriod]);
        } else {
            $payrollQuery = "SELECT * FROM bang_luong WHERE (ma_nguoi_dung = ? OR ma_nguoi_dung = ?) ORDER BY id_luong DESC LIMIT 1";
            $payrollStmt = $pdo->prepare($payrollQuery);
            $payrollStmt->execute([$workerId, $maNguoiDungFormat]);
        }
        $payrollResult = $payrollStmt->fetch(PDO::FETCH_ASSOC);
        
        // Determine hourly rate and status; total income is always hours * rate
        if ($payrollResult) {
            $hourlyRate = floatval($payrollResult['muc_luong_gio'] ?? 30000.00);
            $status = $payrollResult['trang_thai'] ?? 'pending';
        } else {
            $hourlyRate = 30000.00;
            $status = 'pending';
        }

        // If only approved requested, skip non-approved
        if ($approvedOnly && strtolower($status) !== 'approved' && $status !== 'Đã duyệt' && $status !== 'da_duyet') {
            continue;
        }
        $totalIncome = round($totalHours * $hourlyRate, 2);
        
        $row = [
            'worker_id' => $workerId,
            'full_name' => $fullName,
            'total_hours' => $totalHours,
            'hourly_rate' => $hourlyRate,
            'total_income' => $totalIncome,
            'status' => $status
        ];
        if ($includeTasks) {
            // Return raw task list for this worker and period
            $taskList = array_map(function($t) {
                return [
                    'ngay_bat_dau' => $t['ngay_bat_dau'] ?? null,
                    'ten_cong_viec' => $t['ten_cong_viec'] ?? null,
                    'thoi_gian_bat_dau' => $t['thoi_gian_bat_dau'] ?? null,
                    'thoi_gian_ket_thuc' => $t['thoi_gian_ket_thuc'] ?? null,
                    'thoi_gian_du_kien' => $t['thoi_gian_du_kien'] ?? null,
                    'trang_thai' => $t['trang_thai'] ?? null,
                    'ma_nguoi_dung' => $t['ma_nguoi_dung'] ?? null,
                ];
            }, $hoursResults);
            $row['tasks'] = $taskList;
        }
        $results[] = $row;
    }
    
    // Return all farmers with their payroll data
    echo json_encode([
        'success' => true,
        'data' => $results
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Throwable $e) {
    http_response_code(500);
    error_log('payroll_list error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

