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

if (!isset($_SESSION['user_id'])) {
  echo json_encode(["hasPermission" => false, "error" => "Not logged in"]);
  exit;
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!isset($data['permission'])) {
  http_response_code(400);
  echo json_encode(["error" => "Permission name required"]);
  exit;
}

$userId = $_SESSION['user_id'];
$permissionName = $data['permission'];

// Get user's role
$stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$userResult = $stmt->get_result();
$user = $userResult->fetch_assoc();

if (!$user) {
  echo json_encode(["hasPermission" => false]);
  exit;
}

$userRole = $user['role'];

// Check if role has the permission
$stmt = $conn->prepare("
  SELECT rp.permission_id 
  FROM role_permissions rp
  JOIN roles r ON rp.role_id = r.id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE r.name = ? AND p.name = ?
");
$stmt->bind_param("ss", $userRole, $permissionName);
$stmt->execute();
$permResult = $stmt->execute();

$hasPermission = $permResult->num_rows > 0;

echo json_encode(["hasPermission" => $hasPermission, "role" => $userRole]);

$stmt->close();
$conn->close();
?>