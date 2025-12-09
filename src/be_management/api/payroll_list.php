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
    
    // Chỉ lấy những nông dân có record trong bảng cham_cong với trang_thai = 'hoan_thanh' (đã chấm công)
    // QUAN TRỌNG: Chỉ lấy những người đã cập nhật trạng thái thành "Hoàn thành"
    $dateFilterClause = "";
    $dateFilterParams = [];
    if ($startDate && $endDate) {
        $dateFilterClause = " AND cc.ngay BETWEEN ? AND ?";
        $dateFilterParams = [$startDate, $endDate];
    }
    
    $farmersQuery = "
        SELECT DISTINCT
            CASE 
                WHEN cc.ma_nguoi_dung LIKE 'ND%' THEN CAST(SUBSTRING(cc.ma_nguoi_dung, 3) AS UNSIGNED)
                ELSE CAST(cc.ma_nguoi_dung AS UNSIGNED)
            END AS worker_id,
            COALESCE(nd.ho_ten, CONCAT('Nông dân ', 
                CASE 
                    WHEN cc.ma_nguoi_dung LIKE 'ND%' THEN SUBSTRING(cc.ma_nguoi_dung, 3)
                    ELSE cc.ma_nguoi_dung
                END
            )) AS full_name,
            CASE 
                WHEN cc.ma_nguoi_dung LIKE 'ND%' THEN cc.ma_nguoi_dung
                ELSE CONCAT('ND', LPAD(cc.ma_nguoi_dung, 3, '0'))
            END AS ma_nguoi_dung_formatted
        FROM cham_cong cc
        LEFT JOIN nguoi_dung nd ON nd.ma_nguoi_dung = CASE 
            WHEN cc.ma_nguoi_dung LIKE 'ND%' THEN CAST(SUBSTRING(cc.ma_nguoi_dung, 3) AS UNSIGNED)
            ELSE CAST(cc.ma_nguoi_dung AS UNSIGNED)
        END
        WHERE cc.trang_thai = 'hoan_thanh' " . $dateFilterClause;

    if ($filterWorkerId !== null && $filterWorkerId !== '') {
        $workerIdFormatted = 'ND' . str_pad((string)$filterWorkerId, 3, '0', STR_PAD_LEFT);
        $farmersQuery .= " AND (cc.ma_nguoi_dung = ? OR cc.ma_nguoi_dung = ?)";
        $dateFilterParams[] = $filterWorkerId;
        $dateFilterParams[] = $workerIdFormatted;
    }
    
    $farmersStmt = $pdo->prepare($farmersQuery);
    $farmersStmt->execute($dateFilterParams);
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

        // Chỉ lấy giờ làm việc từ những công việc đã được chấm công trong bảng cham_cong
        // QUAN TRỌNG: Chỉ lấy những record có trang_thai = 'hoan_thanh' trong cham_cong
        // Điều này đảm bảo chỉ hiển thị những người đã thực sự chấm công (cập nhật trạng thái thành hoàn thành)
        $hoursQuery = "
            SELECT 
                llv.id AS lich_lam_viec_id,
                llv.ngay_bat_dau,
                llv.thoi_gian_bat_dau,
                llv.thoi_gian_ket_thuc,
                llv.thoi_gian_du_kien,
                llv.ma_nguoi_dung,
                llv.ten_cong_viec,
                llv.trang_thai,
                cc.id AS cham_cong_id,
                cc.ngay AS cham_cong_ngay,
                cc.trang_thai AS cham_cong_trang_thai,
                cc.ghi_chu AS cham_cong_ghi_chu,
                cc.created_at AS cham_cong_created_at,
                cc.updated_at AS cham_cong_updated_at
            FROM cham_cong cc
            INNER JOIN lich_lam_viec llv ON cc.lich_lam_viec_id = llv.id
            WHERE cc.trang_thai = 'hoan_thanh'
            AND (cc.ma_nguoi_dung = ? OR cc.ma_nguoi_dung = ?)
        ";
        
        $hoursParams = [$workerId, $workerIdFormatted];
        
        // Apply date filter if provided
        if ($startDate && $endDate) {
            $hoursQuery .= " AND cc.ngay BETWEEN ? AND ?";
            $hoursParams[] = $startDate;
            $hoursParams[] = $endDate;
        }
        
        $hoursQuery .= " ORDER BY cc.ngay ASC, llv.ngay_bat_dau ASC";
        
        $hoursStmt = $pdo->prepare($hoursQuery);
        $hoursStmt->execute($hoursParams);
        $hoursResults = $hoursStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calculate total hours - chỉ tính cho những record có trong cham_cong
        $totalHours = 0;
        foreach ($hoursResults as $task) {
            // Chỉ tính giờ nếu có cham_cong_id (đã được chấm công)
            if (!isset($task['cham_cong_id']) || $task['cham_cong_id'] === null) {
                continue; // Bỏ qua nếu không có record chấm công
            }
            
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

        // Chỉ thêm vào kết quả nếu có giờ làm việc từ cham_cong (có ít nhất 1 record chấm công)
        if ($totalHours > 0 || count($hoursResults) > 0) {
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
                // Return raw task list for this worker and period, including cham_cong info
                // Chỉ lấy những task có cham_cong_id (đã được chấm công)
                $taskList = array_map(function($t) {
                    return [
                        'lich_lam_viec_id' => $t['lich_lam_viec_id'] ?? null,
                        'ngay_bat_dau' => $t['ngay_bat_dau'] ?? null,
                        'ten_cong_viec' => $t['ten_cong_viec'] ?? null,
                        'thoi_gian_bat_dau' => $t['thoi_gian_bat_dau'] ?? null,
                        'thoi_gian_ket_thuc' => $t['thoi_gian_ket_thuc'] ?? null,
                        'thoi_gian_du_kien' => $t['thoi_gian_du_kien'] ?? null,
                        'trang_thai' => $t['trang_thai'] ?? null,
                        'ma_nguoi_dung' => $t['ma_nguoi_dung'] ?? null,
                        // Thông tin từ bảng cham_cong
                        'cham_cong' => [
                            'id' => $t['cham_cong_id'] ?? null,
                            'ngay' => $t['cham_cong_ngay'] ?? null,
                            'trang_thai' => $t['cham_cong_trang_thai'] ?? null,
                            'ghi_chu' => $t['cham_cong_ghi_chu'] ?? null,
                            'created_at' => $t['cham_cong_created_at'] ?? null,
                            'updated_at' => $t['cham_cong_updated_at'] ?? null,
                        ]
                    ];
                }, array_filter($hoursResults, function($t) {
                    // Chỉ lấy những task có cham_cong_id
                    return isset($t['cham_cong_id']) && $t['cham_cong_id'] !== null;
                }));
                $row['tasks'] = $taskList;
            }
            $results[] = $row;
        }
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

