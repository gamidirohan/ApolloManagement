<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "apollo_tyres";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT model, name, HSN, quantity, serial, alert_threshold, last_alerted FROM tyres WHERE alert_threshold IS NOT NULL AND quantity <= alert_threshold ORDER BY last_alerted DESC";
$result = $conn->query($sql);

$notifications = [];
while ($row = $result->fetch_assoc()) {
    $notifications[] = [
        'message' => "Low stock alert: Model {$row['model']} - Name {$row['name']} is below threshold with quantity {$row['quantity']}",
        'last_alerted' => $row['last_alerted']
    ];
}

echo json_encode($notifications);
$conn->close();
?>