const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const util = require('util');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',       // Change if using another user
    password: '12345',       // Your MySQL password
    database: 'billing_system',
    port: 3306
});

// Convert callbacks to promises
db.query = util.promisify(db.query);
db.beginTransaction = util.promisify(db.beginTransaction);
db.commit = util.promisify(db.commit);
db.rollback = util.promisify(db.rollback);
// ✅ Insert Customer & Order Data
// Add after the existing code

app.post('/save-order', async (req, res) => {
    const { customer, products, totalAmount, taxAmount, grandTotal } = req.body;
    
    try {
        // Start transaction
        await db.beginTransaction();
        
        // Insert customer
        const customerResult = await db.query(
            'INSERT INTO customers (name, contact, email, address, bill_date, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
            [customer.name, customer.contact, customer.email, customer.address, customer.bill_date, customer.payment_method]
        );
        
        const customerId = customerResult.insertId;
        
        // Insert order
        const orderResult = await db.query(
            'INSERT INTO orders (customer_id, total_amount, tax_amount, grand_total) VALUES (?, ?, ?, ?)',
            [customerId, totalAmount, taxAmount, grandTotal]
        );
        
        const orderId = orderResult.insertId;
        
        // Insert order items
        for (const product of products) {
            await db.query(
                'INSERT INTO order_items (order_id, product_name, price, quantity, discount, total) VALUES (?, ?, ?, ?, ?, ?)',
                [orderId, product.productName, product.price, product.quantity, product.discount, product.total]
            );
        }
        
        // Commit transaction
        await db.commit();
        return res.status(200).json({ 
            success: true, 
            message: 'Order saved successfully',
            orderId: orderId 
        });
        
    } catch (error) {
        await db.rollback();
        console.error('Error saving order:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Internal server error' 
        });
    }
});

// ✅ Retrieve Customer & Order Data
app.get('/get-orders', (req, res) => {
    const sql = `
        SELECT o.id AS order_id, c.name AS customer_name, c.contact, o.total_amount, o.grand_total, o.created_at
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        ORDER BY o.created_at DESC
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// ✅ Retrieve Order Details by Order ID
app.get('/get-order/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    const sql = `
        SELECT oi.product_name, oi.price, oi.quantity, oi.discount, oi.total
        FROM order_items oi
        WHERE oi.order_id = ?
    `;
    db.query(sql, [orderId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

const PORT = 5000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log('Press Ctrl+C to stop');
    });
}

// Add these new endpoints to your server.js

// Get order details including customer information
app.get('/get-order-details/:orderId', async (req, res) => {
    const orderId = req.params.orderId;
    try {
        const orderSql = `
            SELECT o.*, c.name as customer_name, c.contact, c.email, c.address, c.payment_method
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE o.id = ?
        `;
        const orderResult = await db.query(orderSql, [orderId]);

        const itemsSql = `
            SELECT product_name as productName, price, quantity, discount, total
            FROM order_items
            WHERE order_id = ?
        `;
        const itemsResult = await db.query(itemsSql, [orderId]);

        const orderDetails = {
            ...orderResult[0],
            items: itemsResult
        };

        res.json(orderDetails);
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Failed to fetch order details' });
    }
});

// Update the existing get-orders endpoint for better sorting and pagination
app.get('/get-orders', async (req, res) => {
    try {
        const sql = `
            SELECT 
                o.id as order_id,
                o.created_at,
                c.name as customer_name,
                o.grand_total,
                o.total_amount,
                o.tax_amount
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            ORDER BY o.created_at DESC
        `;
        const result = await db.query(sql);
        res.json(result);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});