<?php
/**
 * ============================================================================
 * Smart Greenhouse IoT - Database Connection (PDO)
 * File: api/db_connect.php
 * Save Path: C:\xampp\htdocs\react-dashboard-micro\api\db_connect.php
 * ============================================================================
 */

// Enable CORS for React frontend running on any port (e.g. 5173, 3000)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'greenhouse_db';
$db_port = 3306;

try {
    // 1. Initial connection to guarantee database existence
    $pdo_bootstrap = new PDO("mysql:host=$db_host;port=$db_port;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo_bootstrap->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");

    // 2. Main PDO connection
    $pdo = new PDO("mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    // 3. Schema initialization
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS sensor_readings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            temperature FLOAT NULL,
            humidity FLOAT NULL,
            soil_moisture FLOAT NULL,
            air_quality FLOAT NULL,
            pump_status VARCHAR(10) DEFAULT 'OFF',
            fan_status VARCHAR(10) DEFAULT 'OFF',
            light_status VARCHAR(10) DEFAULT 'OFF',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS actuator_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            device VARCHAR(50) NOT NULL,
            action VARCHAR(20) NOT NULL,
            mode VARCHAR(20) DEFAULT 'MANUAL',
            source VARCHAR(50) DEFAULT 'dashboard',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit();
}

