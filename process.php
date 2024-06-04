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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $model = $conn->real_escape_string($_POST['model']);
    $name = $conn->real_escape_string($_POST['name']);
    $quantity = (int)$_POST['quantity'];
    $serial = $conn->real_escape_string($_POST['serial']);
    $alert_threshold = isset($_POST['alert_threshold']) ? (int)$_POST['alert_threshold'] : null;

    // Check if the tyre model and name already exist
    $checkSql = "SELECT * FROM tyres WHERE model='$model' AND name='$name'";
    $result = $conn->query($checkSql);

    if ($result->num_rows > 0) {
        // Update the quantity of existing record
        $row = $result->fetch_assoc();
        $newQuantity = $row['quantity'] + $quantity;
        $updateSql = "UPDATE tyres SET quantity='$newQuantity', last_alerted=NOW() WHERE model='$model' AND name='$name'";
        if ($conn->query($updateSql) === TRUE) {
            echo "Inventory updated successfully";
        } else {
            echo "Error: " . $updateSql . "<br>" . $conn->error;
        }
    } else {
        // Insert new record
        $insertSql = "INSERT INTO tyres (model, name, quantity, serial, alert_threshold, last_alerted) VALUES ('$model', '$name', '$quantity', '$serial', '$alert_threshold', NOW())";
        if ($conn->query($insertSql) === TRUE) {
            echo "Inventory updated successfully";
        } else {
            echo "Error: " . $insertSql . "<br>" . $conn->error;
        }
    }

    $conn->close();
} elseif (isset($_GET['query']) && isset($_GET['type'])) {
    $query = $conn->real_escape_string($_GET['query']);
    $type = $conn->real_escape_string($_GET['type']);
    $column = $type === 'model' ? 'model' : 'name';
    $sql = "SELECT DISTINCT $column FROM tyres WHERE $column LIKE '%$query%'";
    $result = $conn->query($sql);

    $suggestions = [];
    while ($row = $result->fetch_assoc()) {
        $suggestions[] = $row[$column];
    }

    echo json_encode($suggestions);
    $conn->close();
}
?>
