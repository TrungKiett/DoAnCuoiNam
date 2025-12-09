<?php
echo "<h2>PHP Upload Configuration</h2>";
echo "<p><strong>file_uploads:</strong> " . (ini_get('file_uploads') ? 'Enabled' : 'Disabled') . "</p>";
echo "<p><strong>upload_max_filesize:</strong> " . ini_get('upload_max_filesize') . "</p>";
echo "<p><strong>post_max_size:</strong> " . ini_get('post_max_size') . "</p>";
echo "<p><strong>max_execution_time:</strong> " . ini_get('max_execution_time') . " seconds</p>";
echo "<p><strong>memory_limit:</strong> " . ini_get('memory_limit') . "</p>";
echo "<p><strong>upload_tmp_dir:</strong> " . (ini_get('upload_tmp_dir') ?: 'Default system temp') . "</p>";

echo "<h3>Upload Directory Check</h3>";
$uploadDir = __DIR__ . '/uploads/';
echo "<p><strong>Upload directory:</strong> " . $uploadDir . "</p>";
echo "<p><strong>Directory exists:</strong> " . (file_exists($uploadDir) ? 'Yes' : 'No') . "</p>";
echo "<p><strong>Directory writable:</strong> " . (is_writable($uploadDir) ? 'Yes' : 'No') . "</p>";

if (file_exists($uploadDir)) {
    echo "<p><strong>Directory permissions:</strong> " . substr(sprintf('%o', fileperms($uploadDir)), -4) . "</p>";
}
?>
