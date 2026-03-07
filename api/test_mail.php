<?php
include_once 'config.php';
include_once 'smtp_helper.php';

echo "Testing SMTP Connection...\n";
echo "Host: " . SMTP_HOST . "\n";
echo "Port: " . SMTP_PORT . "\n";
echo "User: " . SMTP_USER . "\n";

$to = SMTP_USER; // send to self
$subject = "Test Email from Transport Scheduler";
$message = "<h2>It works!</h2><p>This is a test email sent using the authenticated SMTP helper.</p>";

$result = sendSmtpEmail($to, $subject, $message, SMTP_USER, "EM Group Transport Scheduler", SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS);

if ($result === true) {
    echo "Success! Email sent to $to\n";
} else {
    echo "Error: " . $result . "\n";
}
?>
