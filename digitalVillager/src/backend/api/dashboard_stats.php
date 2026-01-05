<?php
require "_db.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

try {
  // Get total incidents
  $result = $conn->query("SELECT COUNT(*) as total_incidents FROM incidents");
  $incidents = $result->fetch_assoc()['total_incidents'];

  // Get total complaints (incidents with type 'complaint')
  $result = $conn->query("SELECT COUNT(*) as total_complaints FROM incidents WHERE type = 'complaint'");
  $complaints = $result->fetch_assoc()['total_complaints'];

  // Get total disaster victims (from disaster_victims table, not incidents)
  $result = $conn->query("SELECT COUNT(*) as total_victims FROM disaster_victims");
  $victims = $result->fetch_assoc()['total_victims'];

  // Get total people affected (victims + household members)
  $result = $conn->query("
    SELECT 
      (SELECT COUNT(*) FROM disaster_victims) + 
      (SELECT COUNT(*) FROM household_members) as total_affected
  ");
  $totalAffected = $result->fetch_assoc()['total_affected'];

  // Get disaster victims by disaster type
  $result = $conn->query("SELECT disaster_type, COUNT(*) as count FROM disaster_victims GROUP BY disaster_type");
  $victimsByType = [];
  while($row = $result->fetch_assoc()) {
    $victimsByType[$row['disaster_type']] = $row['count'];
  }

  // Get disaster victims by marital status
  $result = $conn->query("SELECT marital_status, COUNT(*) as count FROM disaster_victims GROUP BY marital_status");
  $victimsByMaritalStatus = [];
  while($row = $result->fetch_assoc()) {
    $victimsByMaritalStatus[$row['marital_status']] = $row['count'];
  }

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

  // Get recent disaster victims
  $result = $conn->query("
    SELECT 
      v.id, 
      v.victim_name, 
      v.disaster_type, 
      v.marital_status, 
      v.kampung_name,
      v.registered_at,
      u.username as registered_by
    FROM disaster_victims v
    LEFT JOIN users u ON v.registered_by = u.id
    ORDER BY v.registered_at DESC 
    LIMIT 10
  ");
  $recentVictims = [];
  while($row = $result->fetch_assoc()) {
    $recentVictims[] = $row;
  }

  echo json_encode([
    "total_incidents" => $incidents,
    "total_complaints" => $complaints,
    "total_victims" => $victims,
    "total_affected" => $totalAffected,
    "victims_by_type" => $victimsByType,
    "victims_by_marital_status" => $victimsByMaritalStatus,
    "by_type" => $byType,
    "by_status" => $byStatus,
    "recent" => $recent,
    "recent_victims" => $recentVictims
  ]);

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["error" => $e->getMessage()]);
}

$conn->close();
?>