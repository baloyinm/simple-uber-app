<?php
// Initialize database schema and seed mock data
header("Content-Type: application/json; charset=UTF-8");
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config.php';

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
    ['Sipho Mahlangu (Driver)', 'driver@demo', 'driver', 'active', 'Logistics', 'SM', 'demo', '+27 82 000 0004', 'Z000004', 'SA Region - PGM', 'Rustenburg']
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
    ['V002', 'Ford Ranger Bakkie', 'ND 56-78 CD', 'Bakkie', 4, 12, 'available', '2025-02-10', 'AST-002', 'SA Region - Gold', 22000, 'Silver', '2025-11-20', 15000]
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
    ['Sipho Mahlangu', 'Mahlangu', 'Z000004', 'driver@demo', 'SA Region - PGM', 'PrDP', 'V001', 24, 'available', '+27 82 000 0004', '2027-01-01', '2026-05-15']
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

echo json_encode(["status" => "Setup Complete", "details" => $results]);
?>
