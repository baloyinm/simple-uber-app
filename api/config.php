<?php
$host = "localhost"; // Usually localhost on VPS
$db_name = "cjcutduh_transport"; 
$username = "cjcutduh_admin";
$password = "zuY8NEXzMdhHev2VwJ"; // Using provider password for now

// Email Settings
define('SMTP_HOST', 'mail.omholdings.co.za');
define('SMTP_USER', 'admin@omholdings.co.za'); // Example user, should be updated
define('SMTP_PASS', 'zuY8NEXzMdhHev2VwJ'); // Assuming same password for now
define('SMTP_PORT', 465);

$conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$conn->exec("set names utf8");
?>
