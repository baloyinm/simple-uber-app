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

include_once 'config.php';

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

try {
    if ($action === 'users') {
        if ($method === 'GET') {
            $stmt = $conn->query("SELECT * FROM users");
            sendResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($method === 'POST') {
            $data = json_decode(file_get_contents("php://input"));
            $stmt = $conn->prepare("INSERT INTO users (name, email, role, status, dept, avatar, password) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$data->name, $data->email, $data->role, 'pending', $data->dept, substr($data->name, 0, 2), $data->password]);
            sendResponse(['id' => $conn->lastInsertId()]);
        } elseif ($method === 'PUT') {
            $data = json_decode(file_get_contents("php://input"));
            $stmt = $conn->prepare("UPDATE users SET status = ? WHERE id = ?");
            $stmt->execute([$data->status, $data->id]);
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
            sendResponse(['id' => $tripId]);
        } elseif ($method === 'PUT') {
            $data = json_decode(file_get_contents("php://input"));
            if (isset($data->action) && $data->action === 'approve') {
                $stmt = $conn->prepare("UPDATE trips SET status = 'approved', driver = ?, vehicle = ?, plate = ?, teamsUpdated = 1 WHERE id = ?");
                $stmt->execute([$data->driver, $data->vehicle, $data->plate, $data->id]);
                // Update vehicle and driver status logic could go here
            } elseif (isset($data->action) && $data->action === 'reject') {
                $stmt = $conn->prepare("UPDATE trips SET status = 'rejected' WHERE id = ?");
                $stmt->execute([$data->id]);
            }
            sendResponse(['success' => true]);
        }
    } else {
        sendResponse(['error' => 'Invalid action']);
    }
} catch (PDOException $e) {
    sendResponse(['error' => $e->getMessage()]);
}
?>
