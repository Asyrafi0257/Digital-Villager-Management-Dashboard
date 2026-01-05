<?php
require "_db.php";

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data || empty($data['type']) || empty($data['title'])) {
  http_response_code(400);
  echo json_encode(["error" => "type and title required"]);
  exit;
}

$type = $conn->real_escape_string($data['type']);
$title = $conn->real_escape_string($data['title']);
$kampung = isset($data['kampung']) ? $conn->real_escape_string($data['kampung']) : '';
$description = isset($data['description']) ? $conn->real_escape_string($data['description']) : '';
$status = isset($data['status']) ? $conn->real_escape_string($data['status']) : 'pending';
$location = isset($data['location']) ? $conn->real_escape_string($data['location']) : '';
$lat = isset($data['latitude']) && $data['latitude'] !== '' ? floatval($data['latitude']) : 0.0;
$lng = isset($data['longitude']) && $data['longitude'] !== '' ? floatval($data['longitude']) : 0.0;
$reporter_name = isset($data['reporter_name']) ? $conn->real_escape_string($data['reporter_name']) : '';
$reporter_phone = isset($data['reporter_phone']) ? $conn->real_escape_string($data['reporter_phone']) : '';

$stmt = $conn->prepare("INSERT INTO incidents 
  (type, title, kampung, description, status, location, latitude, longitude, reporter_name, reporter_phone) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

$stmt->bind_param(
  "ssssssddss", // ✅ 10 parameters: type, title, kampung, description, status, location, lat, lng, reporter_name, reporter_phone
  $type,
  $title,
  $kampung,
  $description,
  $status,
  $location,
  $lat,
  $lng,
  $reporter_name,
  $reporter_phone
);

$ok = $stmt->execute();

if (!$ok) {
  http_response_code(500);
  echo json_encode(["error" => $stmt->error]);
  exit;
}

echo json_encode(["created" => true, "id" => $conn->insert_id]);

$stmt->close();
$conn->close();
?>