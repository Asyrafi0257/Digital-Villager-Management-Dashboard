<?php
require "_db.php";

try {
  // Get all incidents - don't filter by coordinates (map will handle filtering)
  $query = "SELECT id, type, title, description, status, location, latitude, longitude, reporter_name, reporter_phone, created_at
            FROM incidents 
            ORDER BY created_at DESC";

  $result = $conn->query($query);

  if ($result) {
    $incidents = [];
    while ($row = $result->fetch_assoc()) {
      $incidents[] = $row;
    }
    echo json_encode($incidents);
  } else {
    http_response_code(500);
    echo json_encode(["error" => "Query failed: " . $conn->error]);
  }

  $conn->close();

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["error" => "Exception: " . $e->getMessage()]);
}
?>