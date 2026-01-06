<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header("Access-Control-Allow-Credentials: true");
header('Access-Control-Allow-Methods: PUT, PATCH');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request 
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit; 
}

require_once '_db.php';

try {
    // Get announcement ID from URL parameter
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Announcement ID is required']);
        exit;
    }
    
    $id = (int)$_GET['id'];
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
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
    
    // Check if announcement exists
    $checkSql = "SELECT id FROM tbl_annoucement WHERE id = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Announcement not found']);
        exit;
    }
    
    // Update announcement
    $sql = "UPDATE tbl_annoucement SET title = ?, message = ?, type = ?, date = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssi", $input['title'], $input['message'], $input['type'], $input['date'], $id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Announcement updated successfully',
            'id' => $id
        ]);
    } else {
        throw new Exception('Failed to update announcement');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to update announcement',
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>