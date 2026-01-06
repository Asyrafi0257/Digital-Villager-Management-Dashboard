<?php
require "_db.php";

//nak baca body request dari frontend
$input = file_get_contents("php://input");

//ada data pengguna then convert json into array php
$data = json_decode($input, true); 

//buat validation if user tak letak value pada input 
if (!$data || empty($data['type']) || empty($data['title'])) {
  http_response_code(400); //bad request (stop code)
  echo json_encode(["error" => "type and title required"]);
  exit;
}

//guna real_escape_string() => nak elak daripada sql injection
$type = $conn->real_escape_string($data['type']);
$title = $conn->real_escape_string($data['title']);
$kampung = isset($data['kampung']) ? $conn->real_escape_string($data['kampung']) : '';
$description = isset($data['description']) ? $conn->real_escape_string($data['description']) : '';
$status = isset($data['status']) ? $conn->real_escape_string($data['status']) : 'pending';
$location = isset($data['location']) ? $conn->real_escape_string($data['location']) : '';

//flaotval ni nak paksa dia jadi number untuk elak input pelik or code
$lat = isset($data['latitude']) && $data['latitude'] !== '' ? floatval($data['latitude']) : 0.0;
$lng = isset($data['longitude']) && $data['longitude'] !== '' ? floatval($data['longitude']) : 0.0;
$reporter_name = isset($data['reporter_name']) ? $conn->real_escape_string($data['reporter_name']) : '';
$reporter_phone = isset($data['reporter_phone']) ? $conn->real_escape_string($data['reporter_phone']) : '';

$stmt = $conn->prepare("INSERT INTO incidents 
  (type, title, kampung, description, status, location, latitude, longitude, reporter_name, reporter_phone) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

// salah satu nk elak daripada sql injection
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

//handle error
if (!$ok) {
  http_response_code(500); //server error
  echo json_encode(["error" => $stmt->error]);
  exit;
}

echo json_encode(["created" => true, "id" => $conn->insert_id]);

$stmt->close();
$conn->close();
?>