<?php
// Initialize database schema and seed mock data
header("Content-Type: application/json; charset=UTF-8");
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (!file_exists(__DIR__ . '/config.php')) {
    echo json_encode([
        "error" => "config.php missing in __DIR__",
        "dir" => __DIR__,
        "files" => scandir(__DIR__)
    ]);
    exit();
}
require_once __DIR__ . '/config.php';

$tables = [
    "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        status VARCHAR(50) DEFAULT 'pending',
        dept VARCHAR(255),
        avatar VARCHAR(10),
        password VARCHAR(255),
        cellphone VARCHAR(50),
        zNumber VARCHAR(50),
        operation VARCHAR(255),
        subOperation VARCHAR(255),
        personalEmail VARCHAR(255),
        picture TEXT,
        licenseExpiry DATE,
        prdpExpiry DATE,
        licensePicture TEXT
    )",
    "CREATE TABLE IF NOT EXISTS drivers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        surname VARCHAR(255),
        zNumber VARCHAR(50),
        email VARCHAR(255),
        operation VARCHAR(255),
        license VARCHAR(100),
        vehicle VARCHAR(100),
        trips INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'available',
        phone VARCHAR(50),
        picture TEXT,
        licenseExpiry DATE,
        prdpExpiry DATE
    )",
    "CREATE TABLE IF NOT EXISTS vehicles (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        plate VARCHAR(100),
        type VARCHAR(100),
        capacity INT,
        trips INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'available',
        lastService DATE,
        assetNumber VARCHAR(100),
        homeOperation VARCHAR(255),
        odometer INT,
        color VARCHAR(50),
        licenseDiskExpiry DATE,
        maintenanceInterval INT,
        picture TEXT
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
    "CREATE TABLE IF NOT EXISTS vehicle_requests (
        id VARCHAR(50) PRIMARY KEY,
        driverName VARCHAR(255),
        requestedVehicleId VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        request_date VARCHAR(50)
    )"
];

$results = ["tables_created" => [], "table_errors" => [], "seed_messages" => []];

foreach ($tables as $sql) {
    try {
        $conn->exec($sql);
        $results["tables_created"][] = "Success executing: " . substr($sql, 0, 40) . "...";
    } catch (PDOException $e) {
        $results["table_errors"][] = "Error: " . $e->getMessage();
    }
}

// Seed Demo Users (Checking if they exist first)
$demoUsers = [
    ['Admin (Transport Admin)', 'admin@demo', 'admin', 'active', 'Operations', 'AD', 'demo', '+27 82 000 0001', 'Z000001', 'Corporate', 'Head Office'],
    ['Enock Sithole (Manager)', 'mgmt@demo', 'management', 'active', 'Management', 'ES', 'demo', '+27 82 000 0002', 'Z000002', 'Corporate', 'Executive'],
    ['Sarah Dlamini (User)', 'user@demo', 'user', 'active', 'Safety', 'SD', 'demo', '+27 82 000 0003', 'Z000003', 'SA Region - Gold', 'Driefontein'],
    ['Sipho Mahlangu (Driver)', 'driver@demo', 'driver', 'active', 'Logistics', 'SM', 'demo', '+27 82 000 0004', 'Z000004', 'SA Region - PGM', 'Rustenburg'],
    ['John Doe (User)', 'john.doe@demo', 'user', 'active', 'Engineering', 'JD', 'demo', '+27 82 000 0005', 'Z000005', 'SA Region - Gold', 'Kloof'],
    ['Thabo Mokoena (User)', 'thabo.mokoena@demo', 'user', 'active', 'HR', 'TM', 'demo', '+27 82 000 0006', 'Z000006', 'Corporate', 'Head Office'],
    ['Michael Naidoo (Driver)', 'michael.naidoo@demo', 'driver', 'active', 'Logistics', 'MN', 'demo', '+27 82 000 0007', 'Z000007', 'SA Region - Gold', 'Beatrix'],
    ['Tanya van der Merwe (User)', 'tanya.vdm@demo', 'user', 'active', 'Finance', 'TV', 'demo', '+27 82 000 0008', 'Z000008', 'SA Region - PGM', 'Marikana'],
    ['James Smith (Driver)', 'james.smith@demo', 'driver', 'active', 'Logistics', 'JS', 'demo', '+27 82 000 0009', 'Z000009', 'Corporate', 'Head Office'],
    ['Lerato Khumalo (Driver)', 'lerato.khumalo@demo', 'driver', 'pending', 'Logistics', 'LK', 'demo', '+27 82 000 0010', 'Z000010', 'SA Region - Gold', 'Driefontein']
];

try {
    $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
    $insertUser = $conn->prepare("INSERT INTO users (name, email, role, status, dept, avatar, password, cellphone, zNumber, operation, subOperation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($demoUsers as $user) {
        $stmt->execute([$user[1]]);
        if ($stmt->fetchColumn() == 0) {
            $insertUser->execute($user);
            $results["seed_messages"][] = "Inserted demo user: {$user[1]}";
        }
    }
} catch (PDOException $e) {
    $results["seed_messages"][] = "User seed error: " . $e->getMessage();
}

// Seed Demo Vehicles
$demoVehicles = [
    ['V001', 'Toyota Quantum', 'GP 12-34 AB', 'Minibus', 14, 24, 'available', '2025-01-15', 'AST-001', 'Corporate', 45000, 'White', '2026-01-01', 15000],
    ['V002', 'Ford Ranger Bakkie', 'ND 56-78 CD', 'Bakkie', 4, 12, 'available', '2025-02-10', 'AST-002', 'SA Region - Gold', 22000, 'Silver', '2025-11-20', 15000],
    ['V003', 'Hyundai H1', 'CA 99-88 EF', 'Minibus', 9, 8, 'available', '2025-01-20', 'AST-003', 'SA Region - PGM', 15000, 'Grey', '2025-10-15', 10000],
    ['V004', 'Toyota Hilux Bakkie', 'FS 11-22 GH', 'Bakkie', 2, 5, 'maintenance', '2025-03-01', 'AST-004', 'SA Region - Gold', 30000, 'White', '2026-02-28', 15000]
];

try {
    $stmt = $conn->prepare("SELECT COUNT(*) FROM vehicles WHERE id = ?");
    $insertVehicle = $conn->prepare("INSERT INTO vehicles (id, name, plate, type, capacity, trips, status, lastService, assetNumber, homeOperation, odometer, color, licenseDiskExpiry, maintenanceInterval) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($demoVehicles as $v) {
        $stmt->execute([$v[0]]);
        if ($stmt->fetchColumn() == 0) {
            $insertVehicle->execute($v);
            $results["seed_messages"][] = "Inserted demo vehicle: {$v[1]}";
        }
    }
} catch (PDOException $e) {
    $results["seed_messages"][] = "Vehicle seed error: " . $e->getMessage();
}

// Seed Demo Driver
$demoDrivers = [
    ['Sipho Mahlangu', 'Mahlangu', 'Z000004', 'driver@demo', 'SA Region - PGM', 'PrDP', 'V001', 24, 'available', '+27 82 000 0004', '2027-01-01', '2026-05-15'],
    ['Michael Naidoo', 'Naidoo', 'Z000007', 'michael.naidoo@demo', 'SA Region - Gold', 'PrDP', 'V002', 8, 'available', '+27 82 000 0007', '2026-08-10', '2025-09-20'],
    ['James Smith', 'Smith', 'Z000009', 'james.smith@demo', 'Corporate', 'Code 10', 'V003', 15, 'off_duty', '+27 82 000 0009', '2028-02-01', '2026-11-01'],
    ['Lerato Khumalo', 'Khumalo', 'Z000010', 'lerato.khumalo@demo', 'SA Region - Gold', 'PrDP', '', 0, 'available', '+27 82 000 0010', '2027-05-18', '2026-03-10']
];

try {
    $stmt = $conn->prepare("SELECT COUNT(*) FROM drivers WHERE email = ?");
    $insertDriver = $conn->prepare("INSERT INTO drivers (name, surname, zNumber, email, operation, license, vehicle, trips, status, phone, licenseExpiry, prdpExpiry) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($demoDrivers as $d) {
        $stmt->execute([$d[3]]);
        if ($stmt->fetchColumn() == 0) {
            $insertDriver->execute($d);
            $results["seed_messages"][] = "Inserted demo driver: {$d[0]}";
        }
    }
} catch (PDOException $e) {
    $results["seed_messages"][] = "Driver seed error: " . $e->getMessage();
}

// Seed Demo Trips
$demoTrips = [
    ['T1001', 3, 'Sarah Dlamini (User)', 'Head Office', 'Driefontein', date('Y-m-d', strtotime('+1 day')), '08:00', 'Site Inspection', 2, 'approved', 'Sipho Mahlangu', 'V001', 'GP 12-34 AB', date('Y-m-d').' 09:00:00', 1, 'Ensure PPE in vehicle'],
    ['T1002', 5, 'John Doe (User)', 'Kloof', 'Driefontein', date('Y-m-d', strtotime('+2 days')), '10:30', 'Meeting', 1, 'pending', '', '', '', date('Y-m-d').' 10:15:00', 0, ''],
    ['T1003', 6, 'Thabo Mokoena (User)', 'Head Office', 'Rustenburg', date('Y-m-d', strtotime('-1 day')), '06:00', 'Executive Visit', 4, 'completed', 'Michael Naidoo', 'V002', 'ND 56-78 CD', date('Y-m-d', strtotime('-3 days')).' 14:00:00', 1, 'Executive transport'],
    ['T1004', 8, 'Tanya van der Merwe (User)', 'Marikana', 'Head Office', date('Y-m-d', strtotime('+3 days')), '13:00', 'Training', 5, 'rejected', '', '', '', date('Y-m-d').' 08:30:00', 0, 'Declined due to unavailability']
];

try {
    $stmt = $conn->prepare("SELECT COUNT(*) FROM trips WHERE id = ?");
    $insertTrip = $conn->prepare("INSERT INTO trips (id, userId, userName, pickup, destination, trip_date, trip_time, purpose, passengers, status, driver, vehicle, plate, createdAt, teamsUpdated, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($demoTrips as $t) {
        $stmt->execute([$t[0]]);
        if ($stmt->fetchColumn() == 0) {
            $insertTrip->execute($t);
            $results["seed_messages"][] = "Inserted demo trip: {$t[0]}";
        }
    }
} catch (PDOException $e) {
    $results["seed_messages"][] = "Trip seed error: " . $e->getMessage();
}

echo json_encode(["status" => "Setup Complete", "details" => $results]);
?>
