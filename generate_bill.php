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
    $invoiceNo = $_POST['invoiceNo'];
    $invoiceDate = $_POST['invoiceDate'];
    $dueDate = $_POST['dueDate'];
    $billToName = $_POST['billToName'];
    $billToAddress = $_POST['billToAddress'];
    $billToMobile = $_POST['billToMobile'];
    $shipToName = $_POST['shipToName'];
    $shipToAddress = $_POST['shipToAddress'];
    $shipToMobile = $_POST['shipToMobile'];
    $amountPaid = $_POST['amountPaid'];

    $items = [];
    foreach ($_POST['model'] as $index => $model) {
        $items[] = [
            'model' => $model,
            'hsn' => $_POST['hsn'][$index],
            'name' => $_POST['name'][$index],
            'serial' => $_POST['serial'][$index],
            'qty' => $_POST['qty'][$index] === 'custom' ? $_POST['customQty'][$index] : $_POST['qty'][$index],
            'rate' => $_POST['rate'][$index],
            'tax' => $_POST['tax'][$index],
            'discount' => $_POST['discount'][$index],
            'amount' => $_POST['amount'][$index]
        ];
    }

    // Save the invoice data to the database (optional)
    // ...

    // Generate the bill using the provided bill.html template
    ob_start();
    include 'bill_template.php';
    $billContent = ob_get_clean();

    // Save the bill content to a file (optional)
    // file_put_contents("bills/invoice_$invoiceNo.html", $billContent);

    // Display the bill
    echo $billContent;
}

$conn->close();
?>
