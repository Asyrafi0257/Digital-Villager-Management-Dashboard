<?php
require "_db.php";

session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get kampung filter from query parameters
$kampung = isset($_GET['kampung']) ? mysqli_real_escape_string($conn, $_GET['kampung']) : 'all';

// Build WHERE clause for kampung filtering
$kampungWhereIncidents = "";
$kampungWhereVictims = "";
$kampungAndIncidents = "";
$kampungAndVictims = "";

if ($kampung !== 'all') {
    $kampungWhereIncidents = " WHERE kampung = '$kampung'";
    $kampungWhereVictims = " WHERE kampung_name = '$kampung'";
    $kampungAndIncidents = " AND kampung = '$kampung'";
    $kampungAndVictims = " AND kampung_name = '$kampung'";
}

// Initialize response array
$response = [
    'total_incidents' => 0,
    'total_complaints' => 0,
    'total_victims' => 0,
    'total_affected' => 0,
    'by_type' => [],
    'by_status' => [],
    'victims_by_type' => [],
    'victims_by_marital_status' => [],
    'recent' => [],
    'recent_victims' => []
];

// 1. Get total incidents
$query = "SELECT COUNT(*) as total FROM incidents" . $kampungWhereIncidents;
$result = mysqli_query($conn, $query);
if ($result) {
    $row = mysqli_fetch_assoc($result);
    $response['total_incidents'] = (int)$row['total'];
}

// 2. Get total complaints
$query = "SELECT COUNT(*) as total FROM incidents WHERE type = 'complaint'" . $kampungAndIncidents;
$result = mysqli_query($conn, $query);
if ($result) {
    $row = mysqli_fetch_assoc($result);
    $response['total_complaints'] = (int)$row['total'];
}

// 3. Get total victims
$query = "SELECT COUNT(*) as total FROM disaster_victims" . $kampungWhereVictims;
$result = mysqli_query($conn, $query);
if ($result) {
    $row = mysqli_fetch_assoc($result);
    $response['total_victims'] = (int)$row['total'];
}

// 4. Get total affected people (victims + household members)
if ($kampung !== 'all') {
    $query = "SELECT 
                (SELECT COUNT(*) FROM disaster_victims WHERE kampung_name = '$kampung') + 
                (SELECT COUNT(*) FROM household_members hm 
                 INNER JOIN disaster_victims dv ON hm.victim_id = dv.id 
                 WHERE dv.kampung_name = '$kampung') as total_affected";
} else {
    $query = "SELECT 
                (SELECT COUNT(*) FROM disaster_victims) + 
                (SELECT COUNT(*) FROM household_members) as total_affected";
}
$result = mysqli_query($conn, $query);
if ($result) {
    $row = mysqli_fetch_assoc($result);
    $response['total_affected'] = (int)$row['total_affected'];
}

// 5. Get incidents by type
$query = "SELECT type, COUNT(*) as count FROM incidents" . $kampungWhereIncidents . " GROUP BY type ORDER BY count DESC";
$result = mysqli_query($conn, $query);
if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $response['by_type'][$row['type']] = (int)$row['count'];
    }
}

// 6. Get incidents by status
$query = "SELECT status, COUNT(*) as count FROM incidents" . $kampungWhereIncidents . " GROUP BY status ORDER BY count DESC";
$result = mysqli_query($conn, $query);
if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $response['by_status'][$row['status']] = (int)$row['count'];
    }
}

// 7. Get victims by disaster type
$query = "SELECT disaster_type, COUNT(*) as count FROM disaster_victims" . $kampungWhereVictims . " GROUP BY disaster_type ORDER BY count DESC";
$result = mysqli_query($conn, $query);
if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $response['victims_by_type'][$row['disaster_type']] = (int)$row['count'];
    }
}

// 8. Get victims by marital status
$query = "SELECT marital_status, COUNT(*) as count FROM disaster_victims" . $kampungWhereVictims . " GROUP BY marital_status ORDER BY count DESC";
$result = mysqli_query($conn, $query);
if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $response['victims_by_marital_status'][$row['marital_status']] = (int)$row['count'];
    }
}

// 9. Get recent incidents (last 10)
$query = "SELECT id, kampung, type, title, location, status, created_at 
          FROM incidents" . $kampungWhereIncidents . " 
          ORDER BY created_at DESC 
          LIMIT 10";
$result = mysqli_query($conn, $query);
if ($result) {
    $response['recent'] = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $response['recent'][] = $row;
    }
}

// 10. Get recent victims (last 10)
$query = "SELECT id, victim_name, disaster_type, marital_status, kampung_name, registered_at 
          FROM disaster_victims" . $kampungWhereVictims . " 
          ORDER BY registered_at DESC 
          LIMIT 10";
$result = mysqli_query($conn, $query);
if ($result) {
    $response['recent_victims'] = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $response['recent_victims'][] = $row;
    }
}

// Add kampung info to response
if ($kampung !== 'all') {
    $response['kampung'] = $kampung;
}

echo json_encode($response, JSON_PRETTY_PRINT);

mysqli_close($conn);
?>