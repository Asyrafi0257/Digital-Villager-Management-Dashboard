<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require "_db.php";

$input = json_decode(file_get_contents("php://input"), true);
$username = $input['username'] ?? null;
$password = $input['password'] ?? null;

if (!$username || !$password) {
  http_response_code(400);
  echo json_encode(["success" => false, "error" => "Username and password required"]);
  exit();
}

$stmt = $conn->prepare("SELECT id, password, role, kampung_name FROM users WHERE username=? LIMIT 1");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows === 1) {
  $row = $result->fetch_assoc();

  if (password_verify($password, $row['password']) || $row['password'] === $password) {
    $_SESSION['user_id'] = $row['id'];
    $_SESSION['username'] = $username;
    $_SESSION['role'] = $row['role'];
    $_SESSION['kampung_name'] = $row['kampung_name'];

    echo json_encode([
      "success" => true,
      "role" => $_SESSION['role'],
      "kampung" => $_SESSION['kampung_name']
    ]);
  } else {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Invalid credentials"]);
  }
} else {
  http_response_code(401);
  echo json_encode(["success" => false, "error" => "Invalid credentials"]);
}
?>