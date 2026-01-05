<?php
require "_db.php";

session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit();
}

// Check if user is logged in and is Ketua Kampung or admin
if (!isset($_SESSION['user_id'])) {
  http_response_code(403);
  echo json_encode(["error" => "Not logged in"]);
  exit;
}

if ($_SESSION['role'] !== 'ketua kampung' && $_SESSION['role'] !== 'kplbHQ') {
  http_response_code(403);
  echo json_encode(["error" => "Unauthorized - Only Ketua Kampung can register victims"]);
  exit;
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Validate required fields
if (!isset($data['victim_name']) || !isset($data['marital_status']) || !isset($data['disaster_type'])) {
  http_response_code(400);
  echo json_encode(["error" => "Victim name, marital status, and disaster type are required"]);
  exit;
}

// Start transaction
$conn->begin_transaction();

try {
  // Insert victim
  $victim_name = $conn->real_escape_string($data['victim_name']);
  $ic_number = isset($data['ic_number']) ? $conn->real_escape_string($data['ic_number']) : null;
  $phone_number = isset($data['phone_number']) ? $conn->real_escape_string($data['phone_number']) : null;
  $address = isset($data['address']) ? $conn->real_escape_string($data['address']) : null;
  $marital_status = $conn->real_escape_string($data['marital_status']);
  $disaster_type = $conn->real_escape_string($data['disaster_type']);
  $kampung_name = isset($data['kampung_name']) ? $conn->real_escape_string($data['kampung_name']) : $_SESSION['kampung_name'];
  $registered_by = $_SESSION['user_id'];
  $notes = isset($data['notes']) ? $conn->real_escape_string($data['notes']) : null;

  $stmt = $conn->prepare("INSERT INTO disaster_victims (victim_name, ic_number, phone_number, address, marital_status, disaster_type, kampung_name, registered_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  $stmt->bind_param("sssssssis", $victim_name, $ic_number, $phone_number, $address, $marital_status, $disaster_type, $kampung_name, $registered_by, $notes);
  
  if (!$stmt->execute()) {
    throw new Exception("Failed to insert victim: " . $stmt->error);
  }

  $victim_id = $conn->insert_id;

  // Insert household members if married
  if ($marital_status === 'married' && isset($data['household_members']) && is_array($data['household_members'])) {
    foreach ($data['household_members'] as $member) {
      if (!empty($member['member_name'])) {
        $member_name = $conn->real_escape_string($member['member_name']);
        $relationship = isset($member['relationship']) ? $conn->real_escape_string($member['relationship']) : '';
        $member_ic = isset($member['ic_number']) ? $conn->real_escape_string($member['ic_number']) : null;
        $age = isset($member['age']) ? intval($member['age']) : null;

        $memberStmt = $conn->prepare("INSERT INTO household_members (victim_id, member_name, relationship, ic_number, age) VALUES (?, ?, ?, ?, ?)");
        $memberStmt->bind_param("isssi", $victim_id, $member_name, $relationship, $member_ic, $age);
        
        if (!$memberStmt->execute()) {
          throw new Exception("Failed to insert household member: " . $memberStmt->error);
        }
        $memberStmt->close();
      }
    }
  }

  // Commit transaction
  $conn->commit();

  echo json_encode([
    "success" => true,
    "message" => "Disaster victim registered successfully",
    "victim_id" => $victim_id
  ]);

} catch (Exception $e) {
  $conn->rollback();
  http_response_code(500);
  echo json_encode(["error" => $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>