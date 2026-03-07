<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "TEST DB HOSTS START<br>";
$hosts = ["localhost", "127.0.0.1"]; 
$db_name = "cjcutduh_transport"; 
$username = "cjcutduh_admin";
$password = "zuY8NEXzMdhHev2VwJ"; 

foreach ($hosts as $host) {
    echo "Trying host: $host ... ";
    try {
        $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
        echo "SUCCESS!<br>";
        break;
    } catch(PDOException $e) {
        echo "FAILED: " . $e->getMessage() . "<br>";
    }
}
echo "TEST DB HOSTS END<br>";
?>
