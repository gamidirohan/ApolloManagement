document.addEventListener('DOMContentLoaded', () => {
    const modelSuggestions = document.getElementById('modelSuggestions');
    const nameSuggestions = document.getElementById('nameSuggestions');
    const tyreForm = document.getElementById('tyreForm');
    const alertCheckbox = document.getElementById('alert');
    const alertOptions = document.getElementById('alertOptions');
    const customAlertThreshold = document.getElementById('custom_alert_threshold');
    const shipToSameCheckbox = document.getElementById('ship_to_same');
    const billToFields = ['bill_to_name', 'bill_to_address', 'bill_to_mobile'];
    const shipToFields = ['ship_to_name', 'ship_to_address', 'ship_to_mobile'];

    if (shipToSameCheckbox) {
        shipToSameCheckbox.addEventListener('change', () => {
            if (shipToSameCheckbox.checked) {
                shipToFields.forEach((field, index) => {
                    const billToFieldElement = document.getElementById(billToFields[index]);
                    const shipToFieldElement = document.getElementById(field);
                    if (billToFieldElement && shipToFieldElement) {
                        shipToFieldElement.value = billToFieldElement.value;
                        shipToFieldElement.readOnly = true;
                    }
                });
            } else {
                shipToFields.forEach((field) => {
                    const shipToFieldElement = document.getElementById(field);
                    if (shipToFieldElement) {
                        shipToFieldElement.value = '';
                        shipToFieldElement.readOnly = false;
                    }
                });
            }
        });
    }

    const quantityElement = document.getElementById('quantity');
    if (quantityElement) {
        quantityElement.addEventListener('change', (event) => {
            const customQuantity = document.getElementById('custom_quantity');
            if (customQuantity) {
                if (event.target.value === 'custom') {
                    customQuantity.style.display = 'block';
                } else {
                    customQuantity.style.display = 'none';
                }
            }
        });
    }

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
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                showAlert(data);
                this.reset();
                if (modelSuggestions) modelSuggestions.innerHTML = '';
                if (nameSuggestions) nameSuggestions.innerHTML = '';
                hideAlertOptions(); // Hide alert options after form submission
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }    

    const notificationsDiv = document.getElementById('notifications');
    if (notificationsDiv) {
        fetch('/fetch_notifications')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            notificationsDiv.innerHTML = '';

            data.forEach(notification => {
                let div = document.createElement('div');
                div.className = 'notification';
                div.innerHTML = `
                    <strong>Model:</strong> ${notification.model}<br>
                    <strong>Name:</strong> ${notification.name}<br>
                    <strong>HSN:</strong> ${notification.HSN}<br>
                    <strong>Quantity:</strong> ${notification.quantity}<br>
                    <strong>Serial:</strong> ${notification.serial}<br>
                    <strong>Alert Threshold:</strong> ${notification.alert_threshold}<br>
                    <strong>Last Alerted:</strong> ${notification.last_alerted}<br>
                `;
                notificationsDiv.appendChild(div);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            notificationsDiv.innerHTML = '<p>Error loading notifications. Please try again later.</p>';
        });
    }

    const inventoryTable = document.getElementById('inventoryTable');
    if (inventoryTable) {
        fetch('/fetch_inventory')
        .then(response => response.json())
        .then(data => {
            let inventoryTableBody = inventoryTable.getElementsByTagName('tbody')[0];
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
        alertThresholdElement.addEventListener('change', toggleCustomAlertInput);
    }

    if (alertOptions) {
        const alertThresholdElement = document.getElementById('alert_threshold');
        if (alertThresholdElement) {
            alertCheckbox.addEventListener('click', toggleAlertOptions);
        }
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
        if (shipToName) shipToName.value = billToName;
        if (shipToAddress) shipToAddress.value = billToAddress;
        if (shipToMobile) shipToMobile.value = billToMobile;

        if (shipToName) shipToName.readOnly = true;
        if (shipToAddress) shipToAddress.readOnly = true;
        if (shipToMobile) shipToMobile.readOnly = true;
    } else {
        if (shipToName) shipToName.value = '';
        if (shipToAddress) shipToAddress.value = '';
        if (shipToMobile) shipToMobile.value = '';

        if (shipToName) shipToName.readOnly = false;
        if (shipToAddress) shipToAddress.readOnly = false;
        if (shipToMobile) shipToMobile.readOnly = false;
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

        <label for="quantity">Quantity:</label>
        <select id="quantity" name="quantity[]" onchange="toggleCustomQty(this)" required>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="custom">Custom</option>
        </select>
        <input type="number" id="custom_quantity" name="custom_quantity[]" style="display:none;" min="1">

        <label for="serial">Serial:</label>
        <input type="text" id="serial" name="serial[]" required>
    `;
    itemsContainer.appendChild(newItem);
}

function toggleAlertOptions() {
    const alertOptions = document.getElementById('alertOptions');
    if (alertOptions) {
        alertOptions.style.display = alertOptions.style.display === 'none' ? 'block' : 'none';
    }
}

function toggleCustomAlertInput() {
    const customAlertThreshold = document.getElementById('custom_alert_threshold');
    const alertThreshold = document.getElementById('alert_threshold');
    if (customAlertThreshold && alertThreshold) {
        customAlertThreshold.style.display = alertThreshold.value === 'custom' ? 'block' : 'none';
    }
}

function hideAlertOptions() {
    const alertOptions = document.getElementById('alertOptions');
    if (alertOptions) {
        alertOptions.style.display = 'none';
    }
}

function showAlert(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert';
    alertDiv.innerHTML = message;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}