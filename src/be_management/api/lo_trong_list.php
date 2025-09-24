<?php
require_once __DIR__ . '/config.php';

try {
	// Check if lo_trong table exists first
	$stmt = $pdo->query("SHOW TABLES LIKE 'lo_trong'");
	if ($stmt->rowCount() == 0) {
		// Table doesn't exist, return fallback data
		$fallbackLots = [
			[
				'id' => 'Lô 1',
				'ma_lo_trong' => '1',
				'status' => 'Sẵn sàng',
				'location' => 'Khu A',
				'area' => 0.5,
				'crop' => '',
				'season' => '',
				'lat' => 10.8242,
				'lng' => 106.6312
			],
			[
				'id' => 'Lô 2', 
				'ma_lo_trong' => '2',
				'status' => 'Chưa bắt đầu',
				'location' => 'Khu B',
				'area' => 0.3,
				'crop' => '',
				'season' => '',
				'lat' => 10.8250,
				'lng' => 106.6320
			]
		];
		echo json_encode(["success" => true, "data" => $fallbackLots]);
		exit;
	}

    // Try to get table structure first
    $columnsStmt = $pdo->query("SHOW COLUMNS FROM lo_trong");
    $columns = $columnsStmt->fetchAll(PDO::FETCH_COLUMN);

    // Build select fields based on available columns
    $selectFields = ['lt.ma_lo_trong'];
    if (in_array('ten_lo', $columns)) $selectFields[] = 'lt.ten_lo';
    if (in_array('vi_tri', $columns)) $selectFields[] = 'lt.vi_tri';
    if (in_array('dien_tich', $columns)) $selectFields[] = 'lt.dien_tich';
    if (in_array('toa_do_lat', $columns)) $selectFields[] = 'lt.toa_do_lat';
    if (in_array('toa_do_lng', $columns)) $selectFields[] = 'lt.toa_do_lng';
    if (in_array('trang_thai', $columns)) $selectFields[] = 'lt.trang_thai';

    // Check if ke_hoach_san_xuat table exists
    $join = '';
    $khsExists = $pdo->query("SHOW TABLES LIKE 'ke_hoach_san_xuat'")->rowCount() > 0;
    if ($khsExists) {
        $khsColumnsStmt = $pdo->query("SHOW COLUMNS FROM ke_hoach_san_xuat");
        $khsColumns = $khsColumnsStmt->fetchAll(PDO::FETCH_COLUMN);
        if (in_array('ghi_chu', $khsColumns)) $selectFields[] = 'khs.ghi_chu';
        if (in_array('ngay_du_kien_thu_hoach', $khsColumns)) $selectFields[] = 'khs.ngay_du_kien_thu_hoach';
        $join = ' LEFT JOIN ke_hoach_san_xuat khs ON lt.ma_lo_trong = khs.ma_lo_trong ';
    }

    $sql = 'SELECT ' . implode(', ', $selectFields) . ' FROM lo_trong lt' . $join . ' ORDER BY lt.ma_lo_trong';
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll();

    // If lo_trong exists but has no rows, derive lots from ke_hoach_san_xuat
    if (empty($rows) && $khsExists) {
        $fallbackFromKhs = $pdo->query("SELECT DISTINCT ma_lo_trong, MAX(ngay_du_kien_thu_hoach) AS ngay_du_kien_thu_hoach, MAX(ghi_chu) AS ghi_chu FROM ke_hoach_san_xuat GROUP BY ma_lo_trong")->fetchAll(PDO::FETCH_ASSOC);
        $rows = array_map(function($r){
            return [
                'ma_lo_trong' => $r['ma_lo_trong'],
                'vi_tri' => null,
                'dien_tich' => null,
                'toa_do_lat' => null,
                'toa_do_lng' => null,
                'trang_thai' => null,
                'ngay_du_kien_thu_hoach' => $r['ngay_du_kien_thu_hoach'] ?? null,
                'ghi_chu' => $r['ghi_chu'] ?? null,
            ];
        }, $fallbackFromKhs);
    }

	// Transform data to match frontend format
	$lots = array_map(function($row) {
		$statusMap = [
			'san_sang' => 'Sẵn sàng',
			'dang_chuan_bi' => 'Đang chuẩn bị', 
			'chua_bat_dau' => 'Chưa bắt đầu',
			'dang_canh_tac' => 'Đang canh tác',
			'hoan_thanh' => 'Hoàn thành',
			'can_bao_tri' => 'Cần bảo trì'
		];

		return [
			'id' => 'Lô ' . ($row['ma_lo_trong'] ?? ''),
			'ma_lo_trong' => $row['ma_lo_trong'] ?? null,
			'status' => isset($row['trang_thai']) ? ($statusMap[$row['trang_thai']] ?? $row['trang_thai']) : '',
			'location' => $row['vi_tri'] ?? '',
			'area' => isset($row['dien_tich']) ? floatval($row['dien_tich']) : 0,
			'crop' => $row['ghi_chu'] ?? '',
			'season' => !empty($row['ngay_du_kien_thu_hoach']) ? date('d/m/Y', strtotime($row['ngay_du_kien_thu_hoach'])) : '',
			'lat' => isset($row['toa_do_lat']) ? floatval($row['toa_do_lat']) : 0,
			'lng' => isset($row['toa_do_lng']) ? floatval($row['toa_do_lng']) : 0
		];
	}, $rows);

	error_log("List lots query returned " . count($lots) . " lots");
	echo json_encode(["success" => true, "data" => $lots]);
} catch (Throwable $e) {
	http_response_code(500);
	error_log("List lots error: " . $e->getMessage());
	echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
