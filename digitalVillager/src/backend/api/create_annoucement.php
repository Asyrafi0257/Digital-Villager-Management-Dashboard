<?php
session_start();

header('Access-Control-Allow-Origin: http://localhost:5173');
header("Access-Control-Allow-Credentials: true");
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');

// Handle preflight request 
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit; 
}

require_once '_db.php';

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    error_log("Received data: " . print_r($input, true)); // Check PHP error log
    
    // Validate required fields
    if (empty($input['title']) || empty($input['message']) || empty($input['type']) || empty($input['date'])) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Missing required fields',
            'required' => ['title', 'message', 'type', 'date']
        ]);
        exit;
    }
    
    // Validate type
    $validTypes = ['info', 'warning', 'urgent', 'success'];
    if (!in_array($input['type'], $validTypes)) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Invalid type',
            'valid_types' => $validTypes
        ]);
        exit;
    }
    
    // Insert announcement
    $sql = "INSERT INTO tbl_annoucement (title, message, type, date) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $input['title'], $input['message'], $input['type'], $input['date']);
    
    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Announcement created successfully',
            'id' => $conn->insert_id
        ]);
    } else {
        throw new Exception('Failed to create announcement');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to create announcement',
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>