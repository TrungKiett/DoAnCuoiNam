<?php
require_once __DIR__ . '/../config.php';

try {
    // Đọc file SQL
    $sql = file_get_contents(__DIR__ . '/../../update_database_schema.sql');
    
    // Tách các câu lệnh SQL
    $statements = explode(';', $sql);
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement)) {
            $pdo->exec($statement);
            echo "✅ Executed: " . substr($statement, 0, 50) . "...\n";
        }
    }
    
    echo "\n🎉 Database schema updated successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
