<?php
require "_db.php";

session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit();
}

// Check if user is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'kplbHQ') {
  http_response_code(403);
  echo json_encode(["error" => "Unauthorized - kplbHQ only"]);
  exit;
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!isset($data['user_id'])) {
  http_response_code(400);
  echo json_encode(["error" => "User ID required"]);
  exit;
}

$userId = intval($data['user_id']);

// Prevent admin from deleting their own account
if ($userId === $_SESSION['user_id']) {
  http_response_code(400);
  echo json_encode(["error" => "Cannot delete your own account"]);
  exit;
}

// Delete user
$stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);

if ($stmt->execute()) {
  if ($stmt->affected_rows > 0) {
    echo json_encode([
      "success" => true,
      "message" => "User deleted successfully",
      "user_id" => $userId
    ]);
  } else {
    http_response_code(404);
    echo json_encode(["error" => "User not found"]);
  }
} else {
  http_response_code(500);
  echo json_encode(["error" => "Failed to delete user: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
