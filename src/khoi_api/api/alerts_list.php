<?php
require_once __DIR__ . '/config.php';
header("Content-Type: application/json; charset=UTF-8");

// Simplified demo alerts. In real usage, integrate weather API and plan dates.
try {
    $alerts = [];
    // Example: if today within 7 days of any plan's harvest date -> alert.
    $stmt = $pdo->query("SELECT ma_lo_trong, ngay_du_kien_thu_hoach FROM ke_hoach_san_xuat WHERE ngay_du_kien_thu_hoach IS NOT NULL");
    $plans = $stmt->fetchAll();
    $today = new DateTime();
    foreach ($plans as $p) {
        $harvest = new DateTime($p['ngay_du_kien_thu_hoach']);
        $diff = (int)$today->diff($harvest)->format('%r%a');
        if ($diff >= 0 && $diff <= 7) {
            $alerts[] = [
                'id' => 'harvest_' . $p['ma_lo_trong'],
                'type' => 'harvest_window',
                'message' => 'Lô ' . $p['ma_lo_trong'] . ' sắp thu hoạch trong ' . $diff . ' ngày.'
            ];
        }
    }

    echo json_encode(['success'=>true,'data'=>$alerts]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
}
?>


