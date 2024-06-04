<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice #<?php echo $invoiceNo; ?></title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }
        .invoice-header {
            text-align: center;
            margin-bottom: 20px;
        }
        .invoice-details, .bill-to, .ship-to, .items, .amounts {
            margin-bottom: 20px;
        }
        .items table {
            width: 100%;
            border-collapse: collapse;
        }
        .items th, .items td {
            border: 1px solid #dddddd;
            padding: 8px;
            text-align: left;
        }
        .items th {
            background-color: #4CAF50;
            color: white;
        }
    </style>
</head>
<body>
    <div class="invoice-header">
        <h1>Invoice #<?php echo $invoiceNo; ?></h1>
        <p>Invoice Date: <?php echo $invoiceDate; ?></p>
        <p>Due Date: <?php echo $dueDate; ?></p>
    </div>
    <div class="bill-to">
        <h3>Bill To:</h3>
        <p>Name: <?php echo $billToName; ?></p>
        <p>Address: <?php echo $billToAddress; ?></p>
        <p>Mobile Number: <?php echo $billToMobile; ?></p>
    </div>
    <div class="ship-to">
        <h3>Ship To:</h3>
        <p>Name: <?php echo $shipToName; ?></p>
        <p>Address: <?php echo $shipToAddress; ?></p>
        <p>Mobile Number: <?php echo $shipToMobile; ?></p>
    </div>
    <div class="items">
        <h3>Items:</h3>
        <table>
            <thead>
                <tr>
                    <th>Model</th>
                    <th>HSN</th>
                    <th>Name</th>
                    <th>Serial</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Tax</th>
                    <th>Discount</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($items as $item): ?>
                <tr>
                    <td><?php echo $item['model']; ?></td>
                    <td><?php echo $item['hsn']; ?></td>
                    <td><?php echo $item['name']; ?></td>
                    <td><?php echo $item['serial']; ?></td>
                    <td><?php echo $item['qty']; ?></td>
                    <td><?php echo $item['rate']; ?></td>
                    <td><?php echo $item['tax']; ?>%</td>
                    <td><?php echo $item['discount']; ?></td>
                    <td><?php echo $item['amount']; ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <div class="amounts">
        <h3>Amounts:</h3>
        <p>Amount Paid: <?php echo $amountPaid; ?></p>
        <p>Remaining Amount: <?php echo array_sum(array_column($items, 'amount')) - $amountPaid; ?></p>
    </div>
</body>
</html>
