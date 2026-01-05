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

$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Check if user is admin or updating themselves
if (isset($data['user_id'])) {
  if ($_SESSION['role'] === 'ketua kampung' && $_SESSION['user_id'] == $data['user_id']) {
    // allow self-update (e.g., change password)
  } else if ($_SESSION['role'] !== 'kplbHQ') {
    http_response_code(403);
    echo json_encode(["error" => "Forbidden"]);
    exit;
  }
} else {
  http_response_code(400);
  echo json_encode(["error" => "User ID required"]);
  exit;
}

if (!isset($data['user_id'])) {
  http_response_code(400);
  echo json_encode(["error" => "User ID required"]);
  exit;
}

$userId = intval($data['user_id']);
$updatedFields = [];
$updatedValues = [];
$typeString = "";

// Update role if provided
if (isset($data['role'])) {
  $role = $conn->real_escape_string($data['role']);
  $updatedFields[] = "role = ?";
  $updatedValues[] = $role;
  $typeString .= "s";
}

// Update kampung_name if provided (no normalization - store as-is)
if (isset($data['kampung_name'])) {
  $kampung_name = $conn->real_escape_string($data['kampung_name']);
  $updatedFields[] = "kampung_name = ?";
  $updatedValues[] = $kampung_name;
  $typeString .= "s";
}

// Update password if provided
if (isset($data['password']) && !empty($data['password'])) {
  $password = password_hash($data['password'], PASSWORD_BCRYPT);
  $updatedFields[] = "password = ?";
  $updatedValues[] = $password;
  $typeString .= "s";
}

if (empty($updatedFields)) {
  http_response_code(400);
  echo json_encode(["error" => "No fields to update"]);
  exit;
}

// Add user_id to the values array
$updatedValues[] = $userId;
$typeString .= "i";

// Build and execute update query
$query = "UPDATE users SET " . implode(", ", $updatedFields) . " WHERE id = ?";
$stmt = $conn->prepare($query);

// Bind parameters dynamically
$stmt->bind_param($typeString, ...$updatedValues);

if ($stmt->execute()) {
  echo json_encode([
    "success" => true,
    "message" => "User updated successfully",
    "user_id" => $userId
  ]);
} else {
  http_response_code(500);
  echo json_encode(["error" => "Failed to update user: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>