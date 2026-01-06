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
    // Query to get all announcements ordered by date (newest first)
    $sql = "SELECT id, title, message, type, date, created_at 
            FROM tbl_annoucement 
            ORDER BY date DESC, created_at DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    $result = $stmt->get_result();
    $announcements = [];
    
    while ($row = $result->fetch_assoc()) {
        $announcements[] = [
            'id' => (int)$row['id'],
            'title' => $row['title'],
            'message' => $row['message'],
            'type' => $row['type'],
            'date' => $row['date'],
            'created_at' => $row['created_at']
        ];
    }
    
    echo json_encode($announcements);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch announcements',
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>