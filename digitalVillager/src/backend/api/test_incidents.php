<?php
require "_db.php";

// Debug: Get all incidents and their data
$query = "SELECT id, type, title, location, latitude, longitude, source FROM incidents LIMIT 10";
$result = $conn->query($query);

if ($result && $result->num_rows > 0) {
  $incidents = [];
  while ($row = $result->fetch_assoc()) {
    $incidents[] = $row;
  }
  echo json_encode([
    "success" => true,
    "total_rows" => $result->num_rows,
    "incidents" => $incidents
  ]);
} else {
  echo json_encode([
    "success" => false,
    "message" => "No incidents found",
    "error" => $conn->error
  ]);
}

$conn->close();
?>
