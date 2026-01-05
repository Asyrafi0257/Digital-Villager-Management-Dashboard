<?php
session_start();

// CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");
require "_db.php";

try {
  if (empty($_SESSION['kampung_name'])) {
    http_response_code(403);
    echo json_encode(["error" => "No kampung assigned to this session"]);
    exit();
  }

  $kampung = $_SESSION['kampung_name'];

  // Total incidents for this kampung
  $stmt = $conn->prepare("SELECT COUNT(*) as total_incidents FROM incidents WHERE kampung = ?");
  $stmt->bind_param("s", $kampung);
  $stmt->execute();
  $incidents = $stmt->get_result()->fetch_assoc()['total_incidents'];

  // Complaints for this kampung
  $stmt = $conn->prepare("SELECT COUNT(*) as total_complaints FROM incidents WHERE kampung = ? AND type = 'complaint'");
  $stmt->bind_param("s", $kampung);
  $stmt->execute();
  $complaints = $stmt->get_result()->fetch_assoc()['total_complaints'];

  // By status for this kampung
  $stmt = $conn->prepare("SELECT status, COUNT(*) as count FROM incidents WHERE kampung = ? GROUP BY status");
  $stmt->bind_param("s", $kampung);
  $stmt->execute();
  $byStatus = [];
  $res = $stmt->get_result();
  while($row = $res->fetch_assoc()) {
    $byStatus[$row['status']] = $row['count'];
  }

  // Get total disaster victims for this kampung
  $stmt = $conn->prepare("SELECT COUNT(*) as total_victims FROM disaster_victims WHERE kampung_name = ?");
  $stmt->bind_param("s", $kampung);
  $stmt->execute();
  $victims = $stmt->get_result()->fetch_assoc()['total_victims'];

  // Get total people affected (victims + household members) for this kampung
  $stmt = $conn->prepare("
    SELECT 
      (SELECT COUNT(*) FROM disaster_victims WHERE kampung_name = ?) + 
      (SELECT COUNT(*) FROM household_members hm 
       INNER JOIN disaster_victims dv ON hm.victim_id = dv.id 
       WHERE dv.kampung_name = ?) as total_affected
  ");
  $stmt->bind_param("ss", $kampung, $kampung);
  $stmt->execute();
  $totalAffected = $stmt->get_result()->fetch_assoc()['total_affected'];

  // Get disaster victims by disaster type for this kampung
  $stmt = $conn->prepare("SELECT disaster_type, COUNT(*) as count FROM disaster_victims WHERE kampung_name = ? GROUP BY disaster_type");
  $stmt->bind_param("s", $kampung);
  $stmt->execute();
  $victimsByType = [];
  $res = $stmt->get_result();
  while($row = $res->fetch_assoc()) {
    $victimsByType[$row['disaster_type']] = $row['count'];
  }

  // Get disaster victims by marital status for this kampung
  $stmt = $conn->prepare("SELECT marital_status, COUNT(*) as count FROM disaster_victims WHERE kampung_name = ? GROUP BY marital_status");
  $stmt->bind_param("s", $kampung);
  $stmt->execute();
  $victimsByMaritalStatus = [];
  $res = $stmt->get_result();
  while($row = $res->fetch_assoc()) {
    $victimsByMaritalStatus[$row['marital_status']] = $row['count'];
  }

  // Recent victims for this kampung
  $stmt = $conn->prepare("
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
    WHERE v.kampung_name = ?
    ORDER BY v.registered_at DESC 
    LIMIT 10
  ");
  $stmt->bind_param("s", $kampung);
  $stmt->execute();
  $recentVictims = [];
  $res = $stmt->get_result();
  while($row = $res->fetch_assoc()) {
    $recentVictims[] = $row;
  }

  // By type for this kampung
  $stmt = $conn->prepare("SELECT type, COUNT(*) as count FROM incidents WHERE kampung = ? GROUP BY type");
  $stmt->bind_param("s", $kampung);
  $stmt->execute();
  $byType = [];
  $res = $stmt->get_result();
  while($row = $res->fetch_assoc()) {
    $byType[$row['type']] = $row['count'];
  }

  // Recent incidents for this kampung
  $stmt = $conn->prepare("SELECT id, kampung, type, title, status, location, created_at  
                          FROM incidents  
                          WHERE kampung = ?  
                          ORDER BY created_at DESC  
                          LIMIT 10");
  $stmt->bind_param("s", $kampung);
  $stmt->execute();
  $recent = [];
  $res = $stmt->get_result();
  while($row = $res->fetch_assoc()) {
    $recent[] = $row;
  }

  echo json_encode([
    "kampung" => $kampung,
    "total_incidents" => $incidents,
    "total_complaints" => $complaints,
    "total_victims" => $victims,
    "total_affected" => $totalAffected,
    "victims_by_type" => $victimsByType,
    "victims_by_marital_status" => $victimsByMaritalStatus,
    "by_status" => $byStatus,
    "by_type" => $byType,
    "recent" => $recent,
    "recent_victims" => $recentVictims
  ]);

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["error" => $e->getMessage()]);
}

$conn->close();
?>