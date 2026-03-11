<?php
header('Content-Type: application/json');
include 'config.php';

$res = [
    "status" => "connecting",
    "details" => [
        "host" => $host,
        "db" => $db_name,
        "user" => $username
    ]
];

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $res["status"] = "success";
    $res["message"] = "Connected successfully";
} catch (PDOException $e) {
    $res["status"] = "error";
    $res["message"] = $e->getMessage();
}

echo json_encode($res);
?>
