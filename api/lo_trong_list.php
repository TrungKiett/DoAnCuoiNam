<?php
require_once __DIR__ . '/config.php';

try {
	// Check if table exists
	$stmt = $pdo->query("SHOW TABLES LIKE 'lo_trong'");
	if ($stmt->rowCount() == 0) {
		// Table doesn't exist, return empty array
		echo json_encode(["success" => true, "data" => []]);
		exit;
	}

	// Collect available columns from lo_trong
	$ltColsStmt = $pdo->query("SHOW COLUMNS FROM lo_trong");
	$ltCols = $ltColsStmt->fetchAll(PDO::FETCH_COLUMN);

	$select = [ 'lt.ma_lo_trong' ];
	if (in_array('ten_lo', $ltCols)) $select[] = 'lt.ten_lo';
	if (in_array('vi_tri', $ltCols)) $select[] = 'lt.vi_tri';
	if (in_array('dien_tich', $ltCols)) $select[] = 'lt.dien_tich';
	if (in_array('toa_do_lat', $ltCols)) $select[] = 'lt.toa_do_lat';
	if (in_array('toa_do_lng', $ltCols)) $select[] = 'lt.toa_do_lng';
	if (in_array('trang_thai', $ltCols)) $select[] = 'lt.trang_thai';

	$join = '';
	$khsExists = $pdo->query("SHOW TABLES LIKE 'ke_hoach_san_xuat'")->rowCount() > 0;
	if ($khsExists) {
		$khsColsStmt = $pdo->query("SHOW COLUMNS FROM ke_hoach_san_xuat");
		$khsCols = $khsColsStmt->fetchAll(PDO::FETCH_COLUMN);
		if (in_array('ghi_chu', $khsCols)) $select[] = 'khs.ghi_chu';
		if (in_array('ngay_du_kien_thu_hoach', $khsCols)) $select[] = 'khs.ngay_du_kien_thu_hoach';
		$join = ' LEFT JOIN ke_hoach_san_xuat khs ON lt.ma_lo_trong = khs.ma_lo_trong ';
	}

	$sql = 'SELECT ' . implode(', ', $select) . ' FROM lo_trong lt' . $join . ' ORDER BY lt.ma_lo_trong';
	$stmt = $pdo->query($sql);
	$rows = $stmt->fetchAll();

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
