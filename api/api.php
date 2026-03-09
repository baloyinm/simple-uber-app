<?php
// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    include_once 'config.php';
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Database connection failed", "details" => $e->getMessage()]);
    exit();
}
include_once 'smtp_helper.php';

// Initialization logic to create tables and insert mock data if empty
$createTables = [
    "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        status VARCHAR(50) DEFAULT 'pending',
        dept VARCHAR(255),
        avatar VARCHAR(10),
        password VARCHAR(255)
    )",
    "CREATE TABLE IF NOT EXISTS drivers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        license VARCHAR(100),
        vehicle VARCHAR(100),
        trips INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'available',
        phone VARCHAR(50)
    )",
    "CREATE TABLE IF NOT EXISTS vehicles (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        plate VARCHAR(100),
        type VARCHAR(100),
        capacity INT,
        trips INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'available',
        lastService DATE
    )",
    "CREATE TABLE IF NOT EXISTS trips (
        id VARCHAR(50) PRIMARY KEY,
        userId INT,
        userName VARCHAR(255),
        pickup VARCHAR(255),
        destination VARCHAR(255),
        trip_date VARCHAR(50),
        trip_time VARCHAR(50),
        purpose VARCHAR(255),
        passengers INT,
        status VARCHAR(50) DEFAULT 'pending',
        driver VARCHAR(255),
        vehicle VARCHAR(255),
        plate VARCHAR(100),
        createdAt VARCHAR(50),
        teamsUpdated BOOLEAN DEFAULT FALSE,
        notes TEXT
    )",
    "CREATE TABLE IF NOT EXISTS vehicle_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_id VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        reason VARCHAR(255),
        changed_by VARCHAR(255),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS analytics_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        instructions TEXT,
        file_path VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS driver_pictures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        surname VARCHAR(255),
        zNumber VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(100),
        operation VARCHAR(255),
        picture LONGTEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )"
];

foreach ($createTables as $sql) {
    try {
        $conn->exec($sql);
    } catch (PDOException $e) {
        // Handle error silently for initial setup
    }
}

// Seed initial admin if empty
try {
    $stmt = $conn->query("SELECT COUNT(*) FROM users");
    if ($stmt->fetchColumn() == 0) {
        $conn->exec("INSERT INTO users (name, email, role, status, dept, avatar, password) VALUES 
        ('Tumisho Motsepe', 'tumisho@emgcompanies.co.za', 'admin', 'active', 'Operations', 'TM', 'demo'),
        ('Enock Sithole', 'enock@emgcompanies.co.za', 'management', 'active', 'Management', 'ES', 'demo'),
        ('Sarah Dlamini', 'sarah@sibanye.com', 'user', 'active', 'Safety', 'SD', 'demo')");

        $conn->exec("INSERT INTO drivers (name, license, vehicle, trips, status, phone) VALUES 
        ('Sipho Mahlangu', 'PrDP', 'V001', 24, 'available', '+27 82 111 2233')");

        $conn->exec("INSERT INTO vehicles (id, name, plate, type, capacity, trips, status, lastService) VALUES 
        ('V001', 'Toyota Quantum', 'GP 12-34 AB', 'Minibus', 14, 24, 'available', '2025-01-15')");
    }
} catch (PDOException $e) { }

$action = isset($_GET['action']) ? $_GET['action'] : '';
$method = $_SERVER['REQUEST_METHOD'];

function sendResponse($data) {
    echo json_encode($data);
    exit();
}

function sendEmail($to, $subject, $message, $icsContent = null) {
    if (defined('SMTP_HOST') && defined('SMTP_USER') && defined('SMTP_PASS')) {
        // Use robust SMTP helper if configured
        $from_email = SMTP_USER; 
        $from_name = "EM Group Transport Scheduler";
        
        if ($icsContent) {
            $result = sendSmtpEmailWithIcs($to, $subject, $message, $icsContent, $from_email, $from_name, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS);
        } else {
            $result = sendSmtpEmail($to, $subject, $message, $from_email, $from_name, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS);
        }
        
        if ($result !== true) {
            // Log or handle SMTP error if necessary
            error_log("SMTP Error: " . $result);
        }
        return $result === true;
    } else {
        // Fallback to basic mail()
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= 'From: <' . (defined('SMTP_USER') ? SMTP_USER : 'admin@emgcompanies.co.za') . '>' . "\r\n";
        return mail($to, $subject, $message, $headers);
    }
}

try {
    if ($action === 'users') {
        if ($method === 'GET') {
            $stmt = $conn->query("SELECT * FROM users");
            sendResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($method === 'POST') {
            $data = json_decode(file_get_contents("php://input"));
            $stmt = $conn->prepare("INSERT INTO users (name, email, role, status, dept, avatar, password) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$data->name, $data->email, $data->role, 'pending', $data->dept, substr($data->name, 0, 2), $data->password]);
            
            // Notify Admin of new registration
            $adminEmail = "admin@omholdings.co.za"; 
            $subject = "New Transport Scheduler Registration: " . $data->name;
            $msg = "A new user has registered and is awaiting approval.<br><br>";
            $msg .= "<b>Name:</b> " . $data->name . "<br>";
            $msg .= "<b>Email:</b> " . $data->email . "<br>";
            $msg .= "<b>Department:</b> " . $data->dept . "<br>";
            sendEmail($adminEmail, $subject, $msg);

            sendResponse(['id' => $conn->lastInsertId()]);
        } elseif ($method === 'PUT') {
            $data = json_decode(file_get_contents("php://input"));
            $stmt = $conn->prepare("UPDATE users SET status = ? WHERE id = ?");
            $stmt->execute([$data->status, $data->id]);

            // Notify User of status change
            $uStmt = $conn->prepare("SELECT email, name FROM users WHERE id = ?");
            $uStmt->execute([$data->id]);
            $user = $uStmt->fetch(PDO::FETCH_ASSOC);
            if ($user) {
                $subject = "Account Status Update - Transport Scheduler";
                $msg = "Hello " . $user['name'] . ",<br><br>Your account status has been updated to: <b>" . $data->status . "</b>";
                sendEmail($user['email'], $subject, $msg);
            }

            sendResponse(['success' => true]);
        }
    } elseif ($action === 'login') {
        if ($method === 'POST') {
            $data = json_decode(file_get_contents("php://input"));
            $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? AND password = ?");
            $stmt->execute([$data->email, $data->password]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user) {
                sendResponse(['success' => true, 'user' => $user]);
            } else {
                sendResponse(['success' => false]);
            }
        }
    } elseif ($action === 'drivers') {
        if ($method === 'GET') {
            $stmt = $conn->query("SELECT * FROM drivers");
            sendResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
    } elseif ($action === 'vehicles') {
        if ($method === 'GET') {
            $stmt = $conn->query("SELECT * FROM vehicles");
            sendResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($method === 'PUT') {
            $data = json_decode(file_get_contents("php://input"));
            if (isset($data->action) && $data->action === 'update_status') {
                $stmt = $conn->prepare("UPDATE vehicles SET status = ? WHERE id = ?");
                $stmt->execute([$data->status, $data->id]);
                
                // Log the status change
                $logStmt = $conn->prepare("INSERT INTO vehicle_logs (vehicle_id, status, reason, changed_by) VALUES (?, ?, ?, ?)");
                $logStmt->execute([$data->id, $data->status, $data->reason, $data->changedBy]);

                sendResponse(['success' => true]);
            }
        }
    } elseif ($action === 'vehicle_logs') {
        if ($method === 'GET') {
            $stmt = $conn->query("SELECT * FROM vehicle_logs ORDER BY timestamp DESC");
            sendResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
    } elseif ($action === 'trips') {
        if ($method === 'GET') {
            $stmt = $conn->query("SELECT * FROM trips");
            sendResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($method === 'POST') {
            $data = json_decode(file_get_contents("php://input"));
            $tripId = "T" . time() . rand(10, 99);
            $stmt = $conn->prepare("INSERT INTO trips (id, userId, userName, pickup, destination, trip_date, trip_time, purpose, passengers, status, createdAt, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)");
            $stmt->execute([$tripId, $data->userId, $data->userName, $data->pickup, $data->destination, $data->date, $data->time, $data->purpose, $data->passengers, date('Y-m-d'), $data->notes]);
            
            // Notify Admin of new trip request
            $adminEmail = "admin@omholdings.co.za";
            $subject = "New Trip Request: " . $tripId;
            $msg = "A new transport request hasn't been submitted by <b>" . $data->userName . "</b>.<br><br>";
            $msg .= "<b>Destination:</b> " . $data->destination . "<br>";
            $msg .= "<b>Date:</b> " . $data->date . " at " . $data->time . "<br>";
            sendEmail($adminEmail, $subject, $msg);

            sendResponse(['id' => $tripId]);
        } elseif ($method === 'PUT') {
            $data = json_decode(file_get_contents("php://input"));
            if (isset($data->action) && $data->action === 'approve') {
                $stmt = $conn->prepare("UPDATE trips SET status = 'approved', driver = ?, vehicle = ?, plate = ?, teamsUpdated = 1 WHERE id = ?");
                $stmt->execute([$data->driver, $data->vehicle, $data->plate, $data->id]);
                
                // Fetch trip details for invite
                $tStmt = $conn->prepare("SELECT * FROM trips WHERE id = ?");
                $tStmt->execute([$data->id]);
                $trip = $tStmt->fetch(PDO::FETCH_ASSOC);

                if ($trip) {
                    // Fetch requester details
                    $uStmt = $conn->prepare("SELECT email, name FROM users WHERE id = ?");
                    $uStmt->execute([$trip['userId']]);
                    $user = $uStmt->fetch(PDO::FETCH_ASSOC);

                    if ($user && $user['email']) {
                        // Generate ICS Content
                        $startTime = strtotime($trip['trip_date'] . ' ' . $trip['trip_time']);
                        $endTime = $startTime + (2 * 3600); // Assume 2 hour block
                        $dtStart = gmdate("Ymd\THis\Z", $startTime);
                        $dtEnd = gmdate("Ymd\THis\Z", $endTime);
                        $uid = md5(uniqid(mt_rand(), true)) . "@omholdings.co.za";

                        $icsContent = "BEGIN:VCALENDAR\r\n";
                        $icsContent .= "VERSION:2.0\r\n";
                        $icsContent .= "PRODID:-//EM Group//Transport Scheduler//EN\r\n";
                        $icsContent .= "METHOD:REQUEST\r\n";
                        $icsContent .= "BEGIN:VEVENT\r\n";
                        $icsContent .= "UID:" . $uid . "\r\n";
                        $icsContent .= "DTSTART:" . $dtStart . "\r\n";
                        $icsContent .= "DTEND:" . $dtEnd . "\r\n";
                        $icsContent .= "DTSTAMP:" . gmdate("Ymd\THis\Z") . "\r\n";
                        $icsContent .= "SUMMARY:Transport Allocated: " . $trip['pickup'] . " to " . $trip['destination'] . "\r\n";
                        $icsContent .= "DESCRIPTION:Your transport request has been approved.\\n\\nDriver: " . $data->driver . "\\nVehicle: " . $data->vehicle . " (" . $data->plate . ")\\nPurpose: " . $trip['purpose'] . "\r\n";
                        $icsContent .= "LOCATION:" . $trip['pickup'] . "\r\n";
                        $icsContent .= "ORGANIZER;CN=EM Group Transport:mailto:admin@omholdings.co.za\r\n";
                        $icsContent .= "ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:" . $user['email'] . "\r\n";
                        $icsContent .= "STATUS:CONFIRMED\r\n";
                        $icsContent .= "END:VEVENT\r\n";
                        $icsContent .= "END:VCALENDAR\r\n";

                        // Send Email to User
                        $subject = "Transport Request Approved - Calendar Invite";
                        $msg = "Hello " . $user['name'] . ",<br><br>Your transport request from <b>" . $trip['pickup'] . "</b> to <b>" . $trip['destination'] . "</b> has been approved.<br><br>";
                        $msg .= "<b>Driver:</b> " . $data->driver . "<br>";
                        $msg .= "<b>Vehicle:</b> " . $data->plate . "<br><br>";
                        $msg .= "Please find the attached calendar invite for Microsoft Teams / Outlook.";
                        
                        sendEmail($user['email'], $subject, $msg, $icsContent);
                        
                        // Send Email to Admin as well
                        sendEmail("admin@omholdings.co.za", "Transport Approved & Scheduled", "A trip has been approved and scheduled for " . $user['name'] . ".", $icsContent);
                    }
                }
            } elseif (isset($data->action) && $data->action === 'reject') {
                $stmt = $conn->prepare("UPDATE trips SET status = 'rejected' WHERE id = ?");
                $stmt->execute([$data->id]);
            }
            sendResponse(['success' => true]);
        }
    } elseif ($action === 'analytics') {
        if ($method === 'GET') {
            $stmt = $conn->query("SELECT * FROM analytics_requests ORDER BY created_at DESC");
            sendResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($method === 'POST') {
            $name = $_POST['name'] ?? '';
            $email = $_POST['email'] ?? '';
            $instructions = $_POST['instructions'] ?? '';
            $file_path = '';

            if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = 'uploads/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                $fileName = time() . '_' . basename($_FILES['file']['name']);
                $targetFile = $uploadDir . $fileName;
                if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFile)) {
                    $file_path = $targetFile;
                }
            }

            $stmt = $conn->prepare("INSERT INTO analytics_requests (name, email, instructions, file_path) VALUES (?, ?, ?, ?)");
            $stmt->execute([$name, $email, $instructions, $file_path]);

            // Notify Admin of new analytics request
            $adminEmail = "admin@omholdings.co.za";
            $subject = "New Data Analytics Request: " . $name;
            $msg = "A new data analytics request has been submitted.<br><br>";
            $msg .= "<b>Name:</b> " . $name . "<br>";
            $msg .= "<b>Email:</b> " . $email . "<br>";
            $msg .= "<b>Instructions:</b> " . $instructions . "<br>";
            if ($file_path) {
                $msg .= "<b>File:</b> " . $file_path . "<br>";
            }
            sendEmail($adminEmail, $subject, $msg);

            sendResponse(['success' => true, 'id' => $conn->lastInsertId()]);
        }
    } elseif ($action === 'driver_pictures') {
        if ($method === 'GET') {
            $stmt = $conn->query("SELECT id, name, surname, zNumber, email, phone, operation, picture, created_at FROM driver_pictures ORDER BY created_at DESC");
            sendResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($method === 'POST') {
            $data = json_decode(file_get_contents("php://input"));
            $stmt = $conn->prepare("INSERT INTO driver_pictures (name, surname, zNumber, email, phone, operation, picture) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data->name ?? '',
                $data->surname ?? '',
                $data->zNumber ?? '',
                $data->email ?? '',
                $data->phone ?? '',
                $data->operation ?? '',
                $data->picture ?? ''
            ]);
            sendResponse(['success' => true, 'id' => $conn->lastInsertId()]);
        }
    } else {
        sendResponse(['error' => 'Invalid action']);
    }
} catch (PDOException $e) {
    sendResponse(['error' => $e->getMessage()]);
}
?>
