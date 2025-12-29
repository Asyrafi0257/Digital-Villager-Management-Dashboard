<?php
$servername = "localhost";
$username_db = "root";
$password_db = "1234";
$dbname = "digital_villager";

$conn = new mysqli($servername, $username_db, $password_db, $dbname);
if ($conn->connect_error) {
  http_response_code(500);
  echo json_encode(["error" => "DB connection failed"]);
  exit();
}

// ✅ CORS headers (only if not already sent)
if (!headers_sent()) {
  header("Access-Control-Allow-Origin: http://localhost:5173"); // your React app origin
  header("Access-Control-Allow-Credentials: true");
  header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
  header("Access-Control-Allow-Headers: Content-Type, Authorization");
  header("Content-Type: application/json");

  // Handle preflight requests
  if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
  }
}
?>