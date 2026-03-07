<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "TEST DB START<br>";
$host = "localhost"; 
$db_name = "cjcutduh_transport"; 
$username = "cjcutduh_admin";
$password = "zuY8NEXzMdhHev2VwJ"; 

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "SUCCESS: Connected to DB!<br>";
} catch(PDOException $e) {
    echo "FAILED: " . $e->getMessage() . "<br>";
}
echo "TEST DB END<br>";
?>
