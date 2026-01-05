<?php
require "_db.php";

session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Debug: Log session info
error_log("Session user_id: " . ($_SESSION['user_id'] ?? 'NOT SET'));
error_log("Session role: " . ($_SESSION['role'] ?? 'NOT SET'));

// Check if user is admin
if (!isset($_SESSION['user_id'])) {
  http_response_code(403);
  echo json_encode(["error" => "Not logged in"]);
  exit;
}

if ($_SESSION['role'] !== 'kplbHQ') {
  http_response_code(403);
  echo json_encode(["error" => "Unauthorized - kplbHQ only", "your_role" => $_SESSION['role']]);
  exit;
}

// Get all users including kampung_name
$query = "SELECT id, username, role, kampung_name FROM users ORDER BY id ASC";
$result = $conn->query($query);

if ($result) {
  $users = [];
  while ($row = $result->fetch_assoc()) {
    $users[] = [
      "id" => $row['id'],
      "username" => $row['username'],
      "role" => $row['role'],
      "kampung_name" => $row['kampung_name'] // Using kampung_name
    ];
  }
  error_log("Found " . count($users) . " users");
  echo json_encode([
    "success" => true,
    "total" => count($users),
    "users" => $users
  ]);
} else {
  http_response_code(500);
  echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>