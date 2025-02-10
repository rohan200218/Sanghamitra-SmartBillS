// Helper function to create table cell with input
function createTableCell(type, value = '', readonly = false) {
    const td = document.createElement('td');
    const input = document.createElement('input');
    input.type = type;
    input.value = value;
    if (readonly) input.readOnly = true;
    if (type === 'number' && !readonly) input.placeholder = '0';
    td.appendChild(input);
    return td;
}

// Helper function to create product selection cell
function createProductSelectionCell() {
    const td = document.createElement('td');
    const select = document.createElement('select');
    const options = ['--Select--', 'Frames', 'Glass', 'Paintings', 'Custom Design'];
    options.forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText;
        option.textContent = optionText;
        select.appendChild(option);
    });
    td.appendChild(select);
    return td;
}

// Helper function to setup event listeners for a row
function setupRowEventListeners(row) {
    const select = row.querySelector('select');
    const priceInput = row.cells[1].querySelector('input');
    const quantityInput = row.cells[2].querySelector('input');
    
    select.addEventListener('change', function() {
        const description = this.value;
        const priceMapping = {
            "Frames": 300,
            "Glass": 200,
            "Paintings": 400,
            "Custom Design": 500
        };
        
        priceInput.value = priceMapping[description] || 0;
        quantityInput.value = 1;
        updateTotalAmount();
    });
    
    // Add input event listeners
    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', updateTotalAmount);
    });
}

// Helper function to create a new row
function createNewRow() {
    const newRow = document.createElement('tr');
    
    newRow.appendChild(createProductSelectionCell());
    newRow.appendChild(createTableCell('number')); // price
    newRow.appendChild(createTableCell('number', '1')); // quantity
    newRow.appendChild(createTableCell('number', '0')); // discount
    newRow.appendChild(createTableCell('number', '0', true)); // total (readonly)
    
    const actionCell = document.createElement('td');
    actionCell.className = 'action-tab';
    
    const addButton = document.createElement('button');
    addButton.textContent = '+';
    addButton.className = 'icon';
    addButton.addEventListener('click', function(e) {
        e.stopPropagation();
        const newRowClone = createNewRow();
        this.closest('tr').after(newRowClone);
        enableRemoveButtons();
        updateTotalAmount();
        
        newRowClone.style.opacity = '0';
        newRowClone.style.transition = 'opacity 0.3s ease-in-out';
        setTimeout(() => {
            newRowClone.style.opacity = '1';
        }, 50);
    });
    
    const removeButton = document.createElement('button');
    removeButton.textContent = '-';
    removeButton.className = 'minus-button';
    removeButton.addEventListener('click', function(e) {
        e.stopPropagation();
        const row = this.closest('tr');
        
        row.style.transition = 'opacity 0.3s ease-in-out';
        row.style.opacity = '0';
        
        setTimeout(() => {
            row.remove();
            enableRemoveButtons();
            updateTotalAmount();
        }, 300);
    });
    
    actionCell.appendChild(addButton);
    actionCell.appendChild(removeButton);
    newRow.appendChild(actionCell);
    
    setupRowEventListeners(newRow);
    return newRow;
}

// Function to enable/disable remove buttons
function enableRemoveButtons() {
    const tbody = document.querySelector('tbody');
    const removeButtons = document.querySelectorAll('.minus-button');
    const disabled = tbody.rows.length <= 1;
    
    removeButtons.forEach(button => {
        button.disabled = disabled;
        if (disabled) {
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        } else {
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }
    });
}

// Function to update total amount
function updateTotalAmount() {
    let totalAmount = 0;
    document.querySelectorAll('tbody tr').forEach(row => {
        const price = parseFloat(row.cells[1].querySelector('input').value) || 0;
        const quantity = parseInt(row.cells[2].querySelector('input').value) || 1;
        const discount = parseFloat(row.cells[3].querySelector('input').value) || 0;
        const total = (price * quantity) * (1 - discount / 100);
        row.cells[4].querySelector('input').value = total.toFixed(2);
        totalAmount += total;
    });
    document.getElementById('total-amount').innerText = totalAmount.toFixed(2);
}

// Initialize the first row's button handlers
document.addEventListener('DOMContentLoaded', function() {
    const tbody = document.querySelector('tbody');
    const firstRow = tbody.querySelector('tr');
    
    // Setup action cell for the first row
    const actionCell = document.createElement('td');
    actionCell.className = 'action-tab';
    
    const addButton = document.createElement('button');
    addButton.textContent = '+';
    addButton.className = 'icon';
    addButton.addEventListener('click', function(e) {
        e.stopPropagation();
        const newRow = createNewRow();
        firstRow.after(newRow);
        enableRemoveButtons();
        updateTotalAmount();
        
        newRow.style.opacity = '0';
        newRow.style.transition = 'opacity 0.3s ease-in-out';
        setTimeout(() => {
            newRow.style.opacity = '1';
        }, 50);
    });
    
    const removeButton = document.createElement('button');
    removeButton.textContent = '-';
    removeButton.className = 'minus-button';
    removeButton.disabled = true;
    removeButton.addEventListener('click', function(e) {
        e.stopPropagation();
        const row = this.closest('tr');
        
        row.style.transition = 'opacity 0.3s ease-in-out';
        row.style.opacity = '0';
        
        setTimeout(() => {
            row.remove();
            enableRemoveButtons();
            updateTotalAmount();
        }, 300);
    });
    
    actionCell.appendChild(addButton);
    actionCell.appendChild(removeButton);
    firstRow.appendChild(actionCell);
    
    // Setup initial event listeners
    setupRowEventListeners(firstRow);
    enableRemoveButtons();
});

// Handle form submission
document.getElementById('submit').addEventListener('click', async function(event) {
    console.log('Submit button clicked');
    event.preventDefault();

    const customer = {
        name: document.getElementById('customer-name').value,
        contact: document.getElementById('contact-number').value,
        email: document.getElementById('email-id').value,
        address: document.getElementById('address').value,
        bill_date: document.getElementById('bill-date').value,
        payment_method: document.getElementById('payment-method').value
    };


    if (!customer.name || !customer.contact || !customer.bill_date) {
        alert('Please fill out all required fields!');
        return;
    }

    const products = [];
    let totalAmount = 0;

    document.querySelectorAll('tbody tr').forEach(row => {
        const productName = row.querySelector('select') ? row.querySelector('select').value : null;
        const priceInput = row.cells[1] ? row.cells[1].querySelector('input') : null;
        const quantityInput = row.cells[2] ? row.cells[2].querySelector('input') : null;
        const discountInput = row.cells[3] ? row.cells[3].querySelector('input') : null;

        if (!productName || !priceInput || !quantityInput || !discountInput) {
            console.error('Input element not found in row:', row);
            return;
        }

        const price = parseFloat(priceInput.value) || 0;
        const quantity = parseInt(quantityInput.value) || 1;
        const discount = parseFloat(discountInput.value) || 0;
        const total = (price * quantity) * (1 - discount / 100);

        if (productName !== 'select' && price > 0) {
            totalAmount += total;
            products.push({ productName, price, quantity, discount, total });
        }
    });


    if (products.length === 0) {
        alert('Please add at least one product!');
        return;
    }

        const taxRate = 0.18; // 18% GST
        const taxAmount = totalAmount * taxRate;
        const grandTotal = totalAmount + taxAmount;

        try {
            // Send data to server
            const response = await fetch('http://localhost:5000/save-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer,
                    products,
                    totalAmount,
                    taxAmount,
                    grandTotal
                })
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.message || 'Failed to save order');
            }
    
            // Generate invoice in new window
            generateInvoice(customer, products, totalAmount, taxAmount, grandTotal);
            
            // Clear form and show success message
            alert('Order saved successfully!');
            location.reload();
            
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    });

    // Create an invoice page dynamically
    // Update the invoiceContent template
function generateInvoice(customer, products = [], totalAmount, taxAmount, grandTotal) {
    let invoiceContent = `
    <html>
    <head>
        <title>Invoice</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #f8f9fa; }
            .invoice-box { 
                max-width: 800px; 
                margin: auto; 
                padding: 30px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 40px;
                border-bottom: 2px solid #02257d;
                padding-bottom: 20px;
            }
            .logo-section img { height: 60px; }
            .company-info {
                text-align: right;
                color: #555;
                font-size: 14px;
            }
            .invoice-title {
                color: #02257d;
                font-size: 28px;
                margin: 0;
            }
            .invoice-number {
                color: #666;
                font-size: 16px;
            }
            .invoice-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
            }
            .customer-details, .invoice-info {
                padding: 15px;
                background: #f8f9fa;
                border-radius: 4px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 25px 0;
            }
            th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            th {
                background-color: #02257d;
                color: white;
                font-weight: 500;
            }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .total-section {
                text-align: right;
                padding: 20px 0;
                border-top: 2px solid #009879;
                margin-top: 20px;
            }
            .amount-due {
                font-size: 20px;
                color: #02257d;
                font-weight: bold;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 14px;
            }
            .action-buttons {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-top: 20px;
            }
            .action-button {
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s;
            }
            .download-btn {
                background: #02257d;
                color: white;
            }
            .print-btn {
                background: #f0f0f0;
                color: #333;
            }
        </style>
    </head>
    <body>
        <div class="invoice-box">
            <div class="header">
                <div class="logo-section">
                    <img src="sanghamitra.png" alt="Sanghamitra Logo">
                    <h1 class="invoice-title">Sanghamitra SmartBillS</h1>
                    <div class="invoice-number">Invoice #${Date.now()}</div>
                </div>
                <div class="company-info">
                    <p>Sanghamitra Enterprise<br>
                    Gachibowli,Telangana<br>
                    Phone: (+91) 9836721639</p>
                </div>
            </div>

            <div class="invoice-details">
                <div class="customer-details">
                    <h3>Bill To:</h3>
                    <p>${customer.name}<br>
                    ${customer.address || 'N/A'}<br>
                    Phone: ${customer.contact}<br>
                    Email: ${customer.email || 'N/A'}</p>
                </div>
                <div class="invoice-info">
                    <h3>Invoice Details:</h3>
                    <p>Invoice Date: ${customer.bill_date}<br>
                    Payment Method: ${customer.payment_method}<br>
                    Due Date: ${new Date(new Date(customer.bill_date).getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Discount</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                ${Array.isArray(products) ? products.map(product => `
                        <tr>
                            <td>${product.productName}</td>
                            <td>₹${product.price.toFixed(2)}</td>
                            <td>${product.quantity}</td>
                            <td>${product.discount}%</td>
                            <td>₹${product.total.toFixed(2)}</td>
                        </tr>
                    `).join(''): ''}
                </tbody>
            </table>


            <div class="total-section">
                <p>Subtotal: ₹${totalAmount.toFixed(2)}</p>
                <p>Tax (18%): ₹${taxAmount.toFixed(2)}</p>
                <p class="amount-due">Total Amount Due: ₹${grandTotal.toFixed(2)}</p>
            </div>

            <div class="footer">
                <p>Thank you for your business!</p>
                <p>Visit our website : <a href="https://sanghamitra.store/">Sanghamitra.store</a></p>
            </div>
            
            <div class="action-buttons">
                <button onclick="window.print()" class="action-button print-btn">Print Invoice</button>
                <button onclick="downloadPDF()" class="action-button download-btn">Download PDF</button>
            </div>
        </div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js"></script>
        <script>
            function downloadPDF() {
                const element = document.querySelector('.invoice-box');
                html2pdf().from(element).save('invoice-${Date.now()}.pdf');
            }
        </script>
    </body>
    </html>`;

     // Open invoice in new window
     const invoiceWindow = window.open('', '_blank');
     if (invoiceWindow) {
        invoiceWindow.document.write(invoiceContent);
        invoiceWindow.document.close();
    }
    else {
        alert('Please allow pop-ups to view the invoice');
    }
 }

// Handle submit button animation
const submitBtn = document.querySelector('#submit');
submitBtn.addEventListener('click', function() {
    this.classList.toggle('active');
});
submitBtn.addEventListener('transitionend', function() {
    this.classList.remove('active');
    this.classList.add('finished');
});

// Add input event listener for real-time updates
document.addEventListener('input', function(event) {
    if (event.target.closest('tbody tr')) {
        updateTotalAmount();
    }
});

// when i click on the previous bills button, it should fetch the orders from the server and display them in a modal

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');

    // Ensure Feather icons load properly
    if (typeof feather !== 'undefined') {
        feather.replace();
    } else {
        console.error('Feather icons library not loaded');
    }

    // Find the "Previous Bills" and "Home" button
    const previousBillsLink = document.getElementById("previous-bills-link");
    const homeLink = document.getElementById("home-link");

    if (previousBillsLink) {
        console.log('Previous bills button found:', previousBillsLink);

        previousBillsLink.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('Previous bills button clicked');
            try {
                await showPreviousBills();
                document.getElementById('customer-info-page').style.display = 'none';
                document.getElementById('previous-bills-page').style.display = 'block';
            } catch (error) {
                console.error('Error showing previous bills:', error);
            }
        });

    } else {
        console.error('Previous bills button NOT found in the DOM');
    }

    if(homeLink){
        homeLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Home button clicked');
            document.getElementById('customer-info-page').style.display = 'block';
            document.getElementById('previous-bills-page').style.display = 'none';
        });
    }else{
        console.error('Home button NOT found in the DOM');
    }

    // Add event listeners for sorting arrows
    document.querySelectorAll('.sort-arrow').forEach(arrow => {
        arrow.addEventListener('click', function() {
            const column = this.getAttribute('data-column');
            const order = this.getAttribute('data-order');
            sortTable(column, order);
            this.setAttribute('data-order', order === 'asc' ? 'desc' : 'asc');
            this.textContent = order === 'asc' ? '▼' : '▲';
        });
    });
});

function sortTable(column, order) {
    const tableBody = document.getElementById('previous-bills-table-body');
    const rows = Array.from(tableBody.querySelectorAll('tr'));

    const compare = (a, b) => {
        const cellA = a.querySelector(`td:nth-child(${getColumnIndex(column)})`).textContent.trim();
        const cellB = b.querySelector(`td:nth-child(${getColumnIndex(column)})`).textContent.trim();

        if (column === 'date') {
            return order === 'asc' ? new Date(cellA) - new Date(cellB) : new Date(cellB) - new Date(cellA);
        } else if (column === 'total_amount') {
            return order === 'asc' ? parseFloat(cellA.replace('₹', '')) - parseFloat(cellB.replace('₹', '')) : parseFloat(cellB.replace('₹', '')) - parseFloat(cellA.replace('₹', ''));
        } else {
            return order === 'asc' ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
        }
    };

    rows.sort(compare);
    rows.forEach(row => tableBody.appendChild(row));
}

function getColumnIndex(column) {
    switch (column) {
        case 'order_id':
            return 1;
        case 'date':
            return 2;
        case 'customer_name':
            return 3;
        case 'total_amount':
            return 4;
        case 'preview':
            return 5;
        default:
            return 1;
    }
}

async function showPreviousBills() {
    try {
        console.log('Fetching previous bills...');
        const response = await fetch('http://localhost:5000/get-orders');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const orders = await response.json();
        console.log('Orders received:', orders);
        
        // Create modal with orders data
        displayOrders(orders);
        
    } catch (error) {
        console.error('Error in showPreviousBills:', error);
        alert('Failed to fetch previous bills. Please try again.');
    }
}

function displayOrders(orders) {
    const tableBody = document.getElementById('previous-bills-table-body');
    tableBody.innerHTML = ''; // Clear existing rows

    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.order_id}</td>
            <td>${new Date(order.created_at).toLocaleDateString()}</td>
            <td>${order.customer_name}</td>
            <td>₹${order.grand_total.toFixed(2)}</td>
            <td>
                <button class="btn btn-primary" onclick="viewOrderDetails(${order.order_id})">View Details</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function displayOrdersModal(orders) {
    // Create modal HTML
    const modalHtml = `
        <div id="previousBillsModal" class="modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center;">
            <div class="modal-content" style="background: white; padding: 20px; border-radius: 10px; width: 80%; max-width: 800px;">
                <h2>Previous Bills</h2>
                <table class="styled-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Customer Name</th>
                            <th>Total Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td>${order.order_id}</td>
                                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                                <td>${order.customer_name}</td>
                                <td>₹${order.grand_total.toFixed(2)}</td>
                                <td>
                                    <button onclick="viewOrderDetails(${order.order_id})">View Details</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button onclick="closeModal()" style="margin-top: 20px; padding: 10px 20px; background: #02257d; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
            </div>
        </div>
    `;

    // Insert modal into the DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeModal() {
    const modal = document.getElementById('previousBillsModal');
    if (modal) {
        modal.remove();
    }
}

async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`http://localhost:5000/get-order-details/${orderId}`);
        
        // Check if the response is okay
        if (!response.ok) {
            throw new Error(`Server returned an error: ${response.status}`);
        }

        // Log the response before accessing the data
        const orderDetails = await response.json();
        console.log('Received order details:', orderDetails);

        generateInvoice(
            {
                name: orderDetails.customer_name,
                contact: orderDetails.contact,
                email: orderDetails.email || 'N/A',
                address: orderDetails.address || 'N/A',
                bill_date: new Date(orderDetails.created_at).toLocaleDateString(),
                payment_method: orderDetails.payment_method
            },
            orderDetails.items || [], // Ensure items array exists
            orderDetails.total_amount,
            orderDetails.tax_amount,
            orderDetails.grand_total
        );

    } catch (error) {
        console.error('Error regenerating invoice:', error);
        alert(`Failed to regenerate invoice: ${error.message}`);
    }
}




