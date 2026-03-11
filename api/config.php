<?php
$host = "localhost"; 
$db_name = "cjcutduh_FInaldatabse"; 
$username = "cjcutduh_FInaldatabse";
$password = "RvrJ6t8EPQwAhErZCCwu"; 

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("set names utf8");
} catch (PDOException $e) {
    if (strpos($_SERVER['HTTP_HOST'], 'localhost') === false) {
        header('Content-Type: application/json');
        echo json_encode(["success" => false, "error" => "Database connection failed", "details" => $e->getMessage()]);
        exit();
    }
    // Locally, we might allow it to fail or use mock data
}

// Email Settings
define('SMTP_HOST', 'mail.omholdings.co.za');
define('SMTP_USER', 'admin@omholdings.co.za'); 
define('SMTP_PASS', 'zuY8NEXzMdhHev2VwJ'); 
define('SMTP_PORT', 465);
?>
