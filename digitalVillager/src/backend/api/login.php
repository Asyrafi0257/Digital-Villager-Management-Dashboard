<?php
session_start();

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header("Access-Control-Allow-Origin: http://localhost:5173");
  header("Access-Control-Allow-Credentials: true");
  header("Access-Control-Allow-Methods: POST, OPTIONS");
  header("Access-Control-Allow-Headers: Content-Type");
  http_response_code(200);
  exit();
}

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

require "_db.php";

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (empty($data['username']) || empty($data['password'])) {
  http_response_code(400);
  echo json_encode(["success" => false, "error" => "Username and password required"]);
  exit;
}

$user = $data['username'];
$pass = $data['password'];

$stmt = $conn->prepare("SELECT id, password, role FROM users WHERE username = ? LIMIT 1");
$stmt->bind_param("s", $user);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows === 1) {
  $row = $result->fetch_assoc();

  if (password_verify($pass, $row['password'])) {
    // ✅ Already hashed
    $_SESSION['user_id'] = $row['id'];
    $_SESSION['username'] = $user;
    $_SESSION['role'] = $row['role'] ?? 'citizen';
    echo json_encode(["success" => true, "message" => "Login successful", "role" => $_SESSION['role']]);
  } elseif ($row['password'] === $pass) {
    // ⚠️ Legacy plain text match → rehash now
    $newHash = password_hash($pass, PASSWORD_DEFAULT);
    $update = $conn->prepare("UPDATE users SET password=? WHERE id=?");
    $update->bind_param("si", $newHash, $row['id']);
    $update->execute();

    $_SESSION['user_id'] = $row['id'];
    $_SESSION['username'] = $user;
    $_SESSION['role'] = $row['role'] ?? 'citizen';
    echo json_encode(["success" => true, "message" => "Login successful (migrated)", "role" => $_SESSION['role']]);
  } else {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Invalid credentials"]);
  }
} else {
  http_response_code(401);
  echo json_encode(["success" => false, "error" => "Invalid credentials"]);
}

$stmt->close();
$conn->close();
?>