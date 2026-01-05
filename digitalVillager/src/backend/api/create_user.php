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

if (!isset($data['username']) || !isset($data['password'])) {
  http_response_code(400);
  echo json_encode(["error" => "Username and password required"]);
  exit;
}

$username = $conn->real_escape_string($data['username']);
$password = password_hash($data['password'], PASSWORD_BCRYPT);
$role = isset($data['role']) ? $conn->real_escape_string($data['role']) : 'citizen';

// Get kampung_name if provided (no normalization - store as-is)
$kampung_name = null;
if (isset($data['kampung_name']) && !empty($data['kampung_name'])) {
  $kampung_name = $conn->real_escape_string($data['kampung_name']);
}

// Validate kampung_name for Ketua Kampung role
if ($role === 'ketua kampung' && empty($kampung_name)) {
  http_response_code(400);
  echo json_encode(["error" => "Kampung is required for Ketua Kampung role"]);
  exit;
}

// Check if username already exists
$checkStmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
$checkStmt->bind_param("s", $username);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
  http_response_code(409);
  echo json_encode(["error" => "Username already exists"]);
  exit;
}

// Create new user with kampung_name
$stmt = $conn->prepare("INSERT INTO users (username, password, role, kampung_name, created_at) VALUES (?, ?, ?, ?, NOW())");
$stmt->bind_param("ssss", $username, $password, $role, $kampung_name);

if ($stmt->execute()) {
  echo json_encode([
    "success" => true,
    "message" => "User created successfully",
    "user_id" => $conn->insert_id,
    "username" => $username,
    "role" => $role,
    "kampung_name" => $kampung_name
  ]);
} else {
  http_response_code(500);
  echo json_encode(["error" => "Failed to create user: " . $stmt->error]);
}

$stmt->close();
$checkStmt->close();
$conn->close();
?>