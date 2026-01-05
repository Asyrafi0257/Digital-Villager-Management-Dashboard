<?php
require "_db.php";

session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Get unique kampung names from incidents table
    $query1 = "SELECT DISTINCT kampung FROM incidents WHERE kampung IS NOT NULL AND kampung != '' ORDER BY kampung";
    $result1 = mysqli_query($conn, $query1);
    
    $kampungs = [];
    
    if ($result1) {
        while ($row = mysqli_fetch_assoc($result1)) {
            if (!in_array($row['kampung'], $kampungs)) {
                $kampungs[] = $row['kampung'];
            }
        }
    }
    
    // Get unique kampung names from disaster_victims table
    $query2 = "SELECT DISTINCT kampung_name FROM disaster_victims WHERE kampung_name IS NOT NULL AND kampung_name != '' ORDER BY kampung_name";
    $result2 = mysqli_query($conn, $query2);
    
    if ($result2) {
        while ($row = mysqli_fetch_assoc($result2)) {
            if (!in_array($row['kampung_name'], $kampungs)) {
                $kampungs[] = $row['kampung_name'];
            }
        }
    }
    
    // Get unique kampung names from users table
    $query3 = "SELECT DISTINCT kampung_name FROM users WHERE kampung_name IS NOT NULL AND kampung_name != '' ORDER BY kampung_name";
    $result3 = mysqli_query($conn, $query3);
    
    if ($result3) {
        while ($row = mysqli_fetch_assoc($result3)) {
            if (!in_array($row['kampung_name'], $kampungs)) {
                $kampungs[] = $row['kampung_name'];
            }
        }
    }
    
    // Sort the final list
    sort($kampungs);
    
    echo json_encode([
        "success" => true,
        "kampungs" => $kampungs,
        "total" => count($kampungs)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => $e->getMessage()
    ]);
}

mysqli_close($conn);
?>