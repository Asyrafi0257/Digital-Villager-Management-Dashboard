<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require "_db.php";

$input = json_decode(file_get_contents("php://input"), true);
$id = $input['id'] ?? null;
$status = $input['status'] ?? null;

if (!$id || !$status) {
  http_response_code(400);
  echo json_encode(["updated" => false, "error" => "Missing id or status"]);
  exit();
}

$role = $_SESSION['role'] ?? null;
$kampung = $_SESSION['kampung_name'] ?? null;

try {
  if ($role === "admin" || $role === "kplbHQ") {
    // HQ/Admin can update any incident
    $stmt = $conn->prepare("UPDATE incidents SET status=? WHERE id=?");
    $stmt->bind_param("si", $status, $id);
  } elseif ($role === "ketua kampung" && $kampung) {
    // Ketua Kampung can only update incidents in their kampung
    $stmt = $conn->prepare("UPDATE incidents SET status=? WHERE id=? AND kampung=?");
    $stmt->bind_param("sis", $status, $id, $kampung);
  } else {
    http_response_code(403);
    echo json_encode(["updated" => false, "error" => "Unauthorized"]);
    exit();
  }

  $stmt->execute();
  echo json_encode(["updated" => $stmt->affected_rows > 0]);

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["updated" => false, "error" => $e->getMessage()]);
}
?>