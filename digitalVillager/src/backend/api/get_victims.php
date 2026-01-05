<?php
require "_db.php";

session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
  http_response_code(403);
  echo json_encode(["error" => "Not logged in"]);
  exit;
}

// Build query based on role
if ($_SESSION['role'] === 'kplbHQ' || $_SESSION['role'] === 'penghulu') {
  // Admin and Penghulu see all victims
  $query = "SELECT v.*, u.username as registered_by_name 
            FROM disaster_victims v 
            LEFT JOIN users u ON v.registered_by = u.id 
            ORDER BY v.registered_at DESC";
} else if ($_SESSION['role'] === 'ketua kampung') {
  // Ketua Kampung sees only their kampung's victims
  $kampung = isset($_SESSION['kampung']) ? $_SESSION['kampung'] : $_SESSION['kampung_name'];
  
  if (!$kampung) {
    http_response_code(403);
    echo json_encode(["error" => "No kampung assigned to your account"]);
    exit;
  }
  
  $kampung = $conn->real_escape_string($kampung);
  $query = "SELECT v.*, u.username as registered_by_name 
            FROM disaster_victims v 
            LEFT JOIN users u ON v.registered_by = u.id 
            WHERE v.kampung_name = '$kampung' 
            ORDER BY v.registered_at DESC";
} else {
  http_response_code(403);
  echo json_encode(["error" => "Unauthorized"]);
  exit;
}

$result = $conn->query($query);

if ($result) {
  $victims = [];
  while ($row = $result->fetch_assoc()) {
    $victim_id = $row['id'];
    
    // Get household members if married
    if ($row['marital_status'] === 'married') {
      $memberQuery = "SELECT * FROM household_members WHERE victim_id = $victim_id ORDER BY id ASC";
      $memberResult = $conn->query($memberQuery);
      $members = [];
      while ($member = $memberResult->fetch_assoc()) {
        $members[] = $member;
      }
      $row['household_members'] = $members;
    } else {
      $row['household_members'] = [];
    }
    
    $victims[] = $row;
  }
  
  echo json_encode([
    "success" => true,
    "total" => count($victims),
    "victims" => $victims
  ]);
} else {
  http_response_code(500);
  echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>