<?php
require_once __DIR__ . '/../config.php';

try {
    echo "<h2>Checking lich_lam_viec table structure</h2>";
    
    $stmt = $pdo->query("DESCRIBE lich_lam_viec");
    echo "<table border='1'>";
    echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    
    while($row = $stmt->fetch()) {
        echo "<tr>";
        echo "<td>" . $row['Field'] . "</td>";
        echo "<td>" . $row['Type'] . "</td>";
        echo "<td>" . $row['Null'] . "</td>";
        echo "<td>" . $row['Key'] . "</td>";
        echo "<td>" . $row['Default'] . "</td>";
        echo "<td>" . $row['Extra'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<h3>Sample data</h3>";
    $stmt = $pdo->query("SELECT * FROM lich_lam_viec LIMIT 5");
    $rows = $stmt->fetchAll();
    
    if (count($rows) > 0) {
        echo "<table border='1'>";
        echo "<tr>";
        foreach(array_keys($rows[0]) as $key) {
            echo "<th>" . $key . "</th>";
        }
        echo "</tr>";
        
        foreach($rows as $row) {
            echo "<tr>";
            foreach($row as $value) {
                echo "<td>" . htmlspecialchars($value ?? 'NULL') . "</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>No data found in lich_lam_viec table</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
}
?>
