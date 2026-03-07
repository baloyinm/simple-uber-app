<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
echo "TEST INCLUDE START<br>";
$path = __DIR__ . '/config.php';
echo "Checking path: " . $path . "<br>";
if (file_exists($path)) {
    echo "FILE EXISTS!<br>";
    // Don't include it yet, just check reading
    $content = file_get_contents($path);
    echo "Filesize read: " . strlen($content) . " bytes<br>";
    echo "First 10 chars: " . htmlspecialchars(substr($content, 0, 10)) . "<br>";
} else {
    echo "FILE DOES NOT EXIST AT PATH<br>";
}
$path2 = __DIR__ . '/smtp_helper.php';
echo "Checking path 2: " . $path2 . "<br>";
if (file_exists($path2)) {
    echo "SMTP HELPER EXISTS!<br>";
} else {
    echo "SMTP HELPER DOES NOT EXIST<br>";
}
echo "TEST INCLUDE END";
?>
