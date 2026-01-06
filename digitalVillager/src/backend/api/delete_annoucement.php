<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header("Access-Control-Allow-Credentials: true");
header('Access-Control-Allow-Methods: DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '_db.php';

try {
    // Get announcement ID from URL parameter
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Announcement ID is required']);
        exit;
    }
    
    $id = (int)$_GET['id'];
    
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
    
    // Delete announcement
    $sql = "DELETE FROM tbl_annoucement WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Announcement deleted successfully',
            'id' => $id
        ]);
    } else {
        throw new Exception('Failed to delete announcement');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to delete announcement',
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>