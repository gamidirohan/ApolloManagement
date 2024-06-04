document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners and other initialization code here
    const modelSuggestions = document.getElementById('modelSuggestions');
    const nameSuggestions = document.getElementById('nameSuggestions');
    const tyreForm = document.getElementById('tyreForm');
    const alertCheckbox = document.getElementById('alert');
    const alertOptions = document.getElementById('alertOptions');
    const customAlertThreshold = document.getElementById('custom_alert_threshold');

    if (modelSuggestions) {
        modelSuggestions.addEventListener('click', function(e) {
            if (e.target.tagName === 'LI') {
                document.getElementById('model').value = e.target.textContent;
                this.innerHTML = '';
            }
        });
    }

    if (nameSuggestions) {
        nameSuggestions.addEventListener('click', function(e) {
            if (e.target.tagName === 'LI') {
                document.getElementById('name').value = e.target.textContent;
                this.innerHTML = '';
            }
        });
    }

    if (tyreForm) {
        tyreForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let formData = new FormData(this);
            
            fetch('/process', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                showAlert(data);
                this.reset();
                modelSuggestions.innerHTML = '';
                nameSuggestions.innerHTML = '';
                hideAlertOptions(); // Hide alert options after form submission
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }

    if (document.getElementById('notifications')) {
        fetch('/fetch_notifications')
        .then(response => response.json())
        .then(data => {
            let notificationsDiv = document.getElementById('notifications');
            notificationsDiv.innerHTML = '';
            
            data.forEach(notification => {
                let div = document.createElement('div');
                div.className = 'notification';
                div.innerHTML = `
                    <strong>Model:</strong> ${notification.model}<br>
                    <strong>Name:</strong> ${notification.name}<br>
                    <strong>Serial:</strong> ${notification.serial}<br>
                    <strong>Quantity:</strong> ${notification.quantity}<br>
                    <strong>Alert Threshold:</strong> ${notification.alert_threshold}<br>
                    <strong>Last Alerted:</strong> ${notification.last_alerted}<br>
                `;
                notificationsDiv.appendChild(div);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    if (document.getElementById('inventoryTable')) {
        fetch('/fetch_inventory')
        .then(response => response.json())
        .then(data => {
            let inventoryTableBody = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
            inventoryTableBody.innerHTML = '';
            
            data.forEach(item => {
                let row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.model}</td>
                    <td>${item.name}</td>
                    <td>${item.serial}</td>
                    <td>${item.quantity}</td>
                `;
                inventoryTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    if (alertCheckbox) {
        alertCheckbox.addEventListener('click', toggleAlertOptions);
    }

    if (alertOptions) {
        document.getElementById('alert_threshold').addEventListener('change', toggleCustomAlertInput);
    }
});

function copyBillTo() {
    const shipToSame = document.getElementById('shipToSame').checked;
    const billToName = document.getElementById('billToName').value;
    const billToAddress = document.getElementById('billToAddress').value;
    const billToMobile = document.getElementById('billToMobile').value;

    const shipToName = document.getElementById('shipToName');
    const shipToAddress = document.getElementById('shipToAddress');
    const shipToMobile = document.getElementById('shipToMobile');

    if (shipToSame) {
        shipToName.value = billToName;
        shipToAddress.value = billToAddress;
        shipToMobile.value = billToMobile;

        shipToName.readOnly = true;
        shipToAddress.readOnly = true;
        shipToMobile.readOnly = true;
    } else {
        shipToName.value = '';
        shipToAddress.value = '';
        shipToMobile.value = '';

        shipToName.readOnly = false;
        shipToAddress.readOnly = false;
        shipToMobile.readOnly = false;
    }
}

function showSuggestions(value, type) {
    if (value.length === 0) {
        if (type === 'model') {
            document.getElementById('modelSuggestions').innerHTML = '';
        } else if (type === 'name') {
            document.getElementById('nameSuggestions').innerHTML = '';
        }
        return;
    }

    fetch(`/process?query=${value}&type=${type}`)
        .then(response => response.json())
        .then(data => {
            let suggestions = type === 'model' ? document.getElementById('modelSuggestions') : document.getElementById('nameSuggestions');
            suggestions.innerHTML = '';
            data.forEach(item => {
                let li = document.createElement('li');
                li.textContent = item;
                li.onclick = () => {
                    if (type === 'model') {
                        document.getElementById('model').value = item;
                        document.getElementById('modelSuggestions').innerHTML = '';
                    } else {
                        document.getElementById('name').value = item;
                        document.getElementById('nameSuggestions').innerHTML = '';
                    }
                };
                suggestions.appendChild(li);
            });
        });
}

function toggleCustomQty(select) {
    const customQty = select.nextElementSibling;
    if (select.value === 'custom') {
        customQty.style.display = 'block';
    } else {
        customQty.style.display = 'none';
    }
}

function addItem() {
    const itemsContainer = document.getElementById('itemsContainer');
    const newItem = document.createElement('div');
    newItem.className = 'item';
    newItem.innerHTML = `
        <label for="model">Model:</label>
        <input type="text" id="model" name="model[]" onkeyup="showSuggestions(this.value, 'model')" required>
        <ul id="modelSuggestions"></ul>

        <label for="hsn">HSN:</label>
        <input type="text" id="hsn" name="hsn[]" readonly>

        <label for="name">Name:</label>
        <input type="text" id="name" name="name[]" onkeyup="showSuggestions(this.value, 'name')" required>
        <ul id="nameSuggestions"></ul>

        <label for="serial">Serial:</label>
        <select id="serial" name="serial[]"></select>

        <label for="qty">Qty:</label>
        <select id="qty" name="qty[]" onchange="toggleCustomQty(this)">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="custom">Custom</option>
        </select>
        <input type="number" id="customQty" name="customQty[]" style="display: none;">

        <label for="rate">Rate:</label>
        <input type="text" id="rate" name="rate[]" readonly>

        <label for="tax">Tax:</label>
        <input type="radio" id="tax12" name="tax[]" value="12"> 12%
        <input type="radio" id="tax14" name="tax[]" value="14"> 14%
        <input type="radio" id="tax18" name="tax[]" value="18"> 18%

        <label for="discount">Discount:</label>
        <input type="number" id="discount" name="discount[]">

        <label for="amount">Amount:</label>
        <input type="text" id="amount" name="amount[]" readonly>
    `;
    itemsContainer.appendChild(newItem);
}

function showAlert(message) {
    let alertDiv = document.getElementById('alertMessage');
    alertDiv.textContent = message;
    alertDiv.style.display = 'block';
    
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 5000);
}

function navigate(event, url) {
    event.preventDefault();
    setTimeout(() => {
        window.location.href = url;
    }, 250);
}

function toggleAlertOptions() {
    const alertOptions = document.getElementById('alertOptions');
    if (document.getElementById('alert').checked) {
        alertOptions.style.display = 'block';
    } else {
        alertOptions.style.display = 'none';
        document.getElementById('custom_alert_threshold').style.display = 'none';
    }
}

function toggleCustomAlertInput() {
    const customAlertThreshold = document.getElementById('custom_alert_threshold');
    if (document.getElementById('alert_threshold').value === 'custom') {
        customAlertThreshold.style.display = 'block';
    } else {
        customAlertThreshold.style.display = 'none';
    }
}

function hideAlertOptions() {
    const alertOptions = document.getElementById('alertOptions');
    const alertCheckbox = document.getElementById('alert');
    const customAlertThreshold = document.getElementById('custom_alert_threshold');

    alertOptions.style.display = 'none';
    alertCheckbox.checked = false;
    customAlertThreshold.style.display = 'none';
}

function searchInventory() {
    const searchModel = document.getElementById('searchModel').value.toLowerCase();
    const searchName = document.getElementById('searchName').value.toLowerCase();
    const searchSerial = document.getElementById('searchSerial').value.toLowerCase();
    const searchQuantity = document.getElementById('searchQuantity').value;

    fetch('/fetch_inventory')
        .then(response => response.json())
        .then(data => {
            let searchResults = document.getElementById('searchResults');
            searchResults.innerHTML = '';

            data.forEach(item => {
                if (
                    (searchModel && item.model.toLowerCase().includes(searchModel)) ||
                    (searchName && item.name.toLowerCase().includes(searchName)) ||
                    (searchSerial && item.serial.toLowerCase().includes(searchSerial)) ||
                    (searchQuantity && item.quantity == searchQuantity)
                ) {
                    let row = document.createElement('div');
                    row.innerHTML = `
                        <p>Model: ${item.model}, Name: ${item.name}, Serial: ${item.serial}, Quantity: ${item.quantity}</p>
                    `;
                    searchResults.appendChild(row);
                }
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
