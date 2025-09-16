<?php
require_once __DIR__ . '/../config.php';

try {
    echo "Checking lich_lam_viec table...\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM lich_lam_viec");
    $result = $stmt->fetch();
    echo "Total rows: " . $result['count'] . "\n";
    
    if ($result['count'] > 0) {
        $stmt = $pdo->query("SELECT * FROM lich_lam_viec LIMIT 3");
        $rows = $stmt->fetchAll();
        
        foreach($rows as $row) {
            echo "Row: " . json_encode($row) . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
