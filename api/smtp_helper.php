<?php
/**
 * Simple SMTP Helper for PHP using sockets
 * Supports SSL/TLS and AUTH LOGIN
 */

function sendSmtpEmail($to, $subject, $message, $from_email, $from_name, $smtp_host, $smtp_port, $smtp_user, $smtp_pass) {
    $crlf = "\r\n";
    
    // Connect to the SMTP server
    $connection = fsockopen("ssl://" . $smtp_host, $smtp_port, $errno, $errstr, 10);
    if (!$connection) {
        return "Failed to connect to SMTP server: $errstr ($errno)";
    }
    
    stream_set_timeout($connection, 10);
    $res = fgets($connection, 515);

    // HELO/EHLO
    fputs($connection, "EHLO $smtp_host$crlf");
    $res = get_lines($connection);
    
    // AUTH LOGIN
    fputs($connection, "AUTH LOGIN$crlf");
    $res = get_lines($connection);
    
    // Send username (base64 encoded)
    fputs($connection, base64_encode($smtp_user) . $crlf);
    $res = get_lines($connection);
    
    // Send password (base64 encoded)
    fputs($connection, base64_encode($smtp_pass) . $crlf);
    $res = get_lines($connection);
    if (strpos($res, '235') === false) {
        return "SMTP Authentication Failed: $res";
    }
    
    // MAIL FROM
    fputs($connection, "MAIL FROM:<$from_email>$crlf");
    $res = get_lines($connection);
    
    // RCPT TO
    fputs($connection, "RCPT TO:<$to>$crlf");
    $res = get_lines($connection);
    
    // DATA
    fputs($connection, "DATA$crlf");
    $res = get_lines($connection);
    
    // Headers and Body
    $headers = "From: $from_name <$from_email>$crlf";
    $headers .= "To: <$to>$crlf";
    $headers .= "Subject: $subject$crlf";
    $headers .= "MIME-Version: 1.0$crlf";
    $headers .= "Content-Type: text/html; charset=UTF-8$crlf";
    $headers .= $crlf; // Empty line separates headers from body
    
    fputs($connection, $headers . $message . $crlf . ".$crlf");
    $res = get_lines($connection);
    
    // QUIT
    fputs($connection, "QUIT$crlf");
    $res = get_lines($connection);
    
    fclose($connection);
    return true;
}

function get_lines($connection) {
    $data = "";
    while($str = fgets($connection, 515)) {
        $data .= $str;
        if(substr($str,3,1) == " ") { break; }
    }
    return $data;
}
?>
