<?php
require "_db.php";


try {
  // Get total incidents
  $result = $conn->query("SELECT COUNT(*) as total_incidents FROM incidents");
  $incidents = $result->fetch_assoc()['total_incidents'];

  // Get total complaints
  $result = $conn->query("SELECT COUNT(*) as total_complaints FROM incidents WHERE type = 'complaint'");
  $complaints = $result->fetch_assoc()['total_complaints'];

  // Get incidents by type
  $result = $conn->query("SELECT type, COUNT(*) as count FROM incidents GROUP BY type");
  $byType = [];
  while($row = $result->fetch_assoc()) {
    $byType[$row['type']] = $row['count'];
  }

  // Get incidents by status
  $result = $conn->query("SELECT status, COUNT(*) as count FROM incidents GROUP BY status");
  $byStatus = [];
  while($row = $result->fetch_assoc()) {
    $byStatus[$row['status']] = $row['count'];
  }

  // Get recent incidents
  $result = $conn->query("SELECT id, type, title, status, location, created_at FROM incidents ORDER BY created_at DESC LIMIT 10");
  $recent = [];
  while($row = $result->fetch_assoc()) {
    $recent[] = $row;
  }

  echo json_encode([
    "total_incidents" => $incidents,
    "total_complaints" => $complaints,
    "by_type" => $byType,
    "by_status" => $byStatus,
    "recent" => $recent
  ]);

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["error" => $e->getMessage()]);
}
?>