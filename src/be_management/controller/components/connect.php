<?php
$db_name = 'mysql:host=127.0.0.1:4306;dbname=quanlinongtrai_kl;charset=utf8mb4'; 
// $db_name = 'mysql:host=127.0.0.1;dbname=quan_li_bv;charset=utf8mb4';
$user_name = 'root';
$user_password = '';

$conn = new PDO($db_name, $user_name, $user_password);

 
?>