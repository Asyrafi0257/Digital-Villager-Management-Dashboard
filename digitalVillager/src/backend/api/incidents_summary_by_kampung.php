<?php
require "_db.php";
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}



$sql = "
  SELECT 
    kampung,
    COUNT(*) AS total_incidents,
    SUM(status = 'critical') AS critical,
    SUM(status = 'in_progress') AS in_progress,
    SUM(status = 'resolved') AS resolved
  FROM incidents
  GROUP BY kampung
";

$result = $conn->query($sql);

$data = [];

while ($row = $result->fetch_assoc()) {
  $data[] = $row;
}

echo json_encode($data);
?>