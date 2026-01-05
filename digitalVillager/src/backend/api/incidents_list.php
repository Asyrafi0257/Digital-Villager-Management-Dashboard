<?php
session_start();
/**
 * incidents_list.php - CORS Fixed Version
 * Returns all incidents from database as JSON
 */

// IMPORTANT: Set headers BEFORE any output
// This fixes the CORS error with credentials

// Get the origin of the request
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// List of allowed origins (add your React dev server)
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
];

// Check if origin is allowed
if (in_array($origin, $allowedOrigins)) {
    // Set specific origin instead of wildcard when using credentials
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
} else {
    // Fallback to wildcard if no credentials needed
    header('Access-Control-Allow-Origin: *');
}

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 3600');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Disable error display (errors will be in JSON)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Custom error handler
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

try {
    // ===== DATABASE CONFIGURATION =====
    $host = 'localhost';
    $username = 'root';
    $password = '1234';
    $database = 'digital_villager';
    
    // Create connection
    $conn = new mysqli($host, $username, $password, $database);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
    
    // Set charset
    $conn->set_charset("utf8mb4");
    
    // Check if table exists
    $tableCheck = $conn->query("SHOW TABLES LIKE 'incidents'");
    if ($tableCheck->num_rows === 0) {
        throw new Exception("Table 'incidents' does not exist. Please create it first.");
    }
    
    // Check if kampung column exists
    $columnCheck = $conn->query("SHOW COLUMNS FROM incidents LIKE 'kampung'");
    $hasKampungColumn = ($columnCheck->num_rows > 0);
    
    // Build query based on available columns
    if ($hasKampungColumn) {
        $sql = "SELECT 
                    id, 
                    type, 
                    title, 
                    description, 
                    status, 
                    location,
                    kampung,
                    latitude, 
                    longitude, 
                    reporter_name, 
                    reporter_phone, 
                    created_at,
                    verified_by
                FROM incidents 
                ORDER BY created_at DESC";
    } else {
        $sql = "SELECT 
                    id, 
                    type, 
                    title, 
                    description, 
                    status, 
                    location,
                    latitude, 
                    longitude, 
                    reporter_name, 
                    reporter_phone, 
                    created_at,
                    verified_by
                FROM incidents 
                ORDER BY created_at DESC";
    }
    
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Query execution failed: " . $conn->error);
    }
    
    // Fetch all incidents
    $incidents = [];
    while ($row = $result->fetch_assoc()) {
        // Ensure proper data types
        $row['latitude'] = isset($row['latitude']) ? (string)$row['latitude'] : '0';
        $row['longitude'] = isset($row['longitude']) ? (string)$row['longitude'] : '0';
        
        // Add empty kampung if column doesn't exist
        if (!$hasKampungColumn) {
            $row['kampung'] = '';
        }
        
        $incidents[] = $row;
    }
    
    // Return success with proper HTTP status
    http_response_code(200);
    echo json_encode($incidents, JSON_UNESCAPED_UNICODE);
    
    $conn->close();
    
} catch (Exception $e) {
    // Error handling with proper HTTP status
    http_response_code(500);
    
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Error $e) {
    http_response_code(500);
    
    echo json_encode([
        'error' => 'PHP Error: ' . $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ], JSON_UNESCAPED_UNICODE);
}

restore_error_handler();
?>