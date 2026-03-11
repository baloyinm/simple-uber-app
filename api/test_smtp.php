<?php
include_once 'config.php';
include_once 'smtp_helper.php';

$to = "admin@omholdings.co.za";
$subject = "SMTP Test from EM Group Scheduler";
$message = "This is a test email sent from the EM Group Scheduler application.";

// Use sendSmtpEmail directly
$res = sendSmtpEmail($to, $subject, $message, SMTP_USER, "EM Group Hub", SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS);

if ($res === true) {
    echo "Email sent successfully to $to\n";
} else {
    echo "Failed to send email:\n";
    print_r($res);
}

// Also test with ICS
$icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//EM Group//EN\r\nMETHOD:REQUEST\r\nBEGIN:VEVENT\r\nUID:" . uniqid() . "\r\nDTSTART:" . gmdate("Ymd\THis\Z") . "\r\nDTEND:" . gmdate("Ymd\THis\Z", time()+3600) . "\r\nSUMMARY:Test Invite\r\nEND:VEVENT\r\nEND:VCALENDAR";
$resIcs = sendSmtpEmailWithIcs($to, "Invite Test", "Test with ICS", $icsContent, SMTP_USER, "EM Group Hub", SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS);

if ($resIcs === true) {
    echo "ICS Email sent successfully to $to\n";
} else {
    echo "Failed to send ICS email:\n";
    print_r($resIcs);
}
?>
