<?php
session_start();

/* ===== CORS ===== */
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

header("Content-Type: application/json");
require "_db.php";

try {
  // (Optional but recommended) role check
  if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'District Officer') {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
  }

  $sql = "
    SELECT
      id,
      type,
      title,
      description,
      status,
      kampung,
      latitude,
      longitude,
      created_at
    FROM incidents
    ORDER BY created_at DESC
  ";

  $result = $conn->query($sql);

  $incidents = [];
  while ($row = $result->fetch_assoc()) {
    $incidents[] = $row;
  }

  echo json_encode($incidents);

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["error" => $e->getMessage()]);
}

$conn->close();
?>