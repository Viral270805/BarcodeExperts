const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MySQL config
const dbConfig = {
    host: 'localhost',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: 'billing_system'
};

// Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// OTP store & limiter
const otps = {};
const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: 'Too many OTP requests, try again later.'
});

// Store last scanned item from Raspberry Pi
let lastScannedItem = null;

// Create tables
const createTables = async () => {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
        );
    `);
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS billing (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_email VARCHAR(255) NOT NULL,
            billing_address VARCHAR(255),
            payment_method VARCHAR(50),
            amount DECIMAL(10, 2),
            FOREIGN KEY (user_email) REFERENCES users(email)
        );
    `);
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            price DECIMAL(10, 2),
            barcode VARCHAR(255) UNIQUE
        );
    `);
    await connection.end();
};
createTables();

// ----------- AUTH ROUTES -----------

app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashed = await bcrypt.hash(password, 10);
        const conn = await mysql.createConnection(dbConfig);
        await conn.execute('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashed]);
        await conn.end();
        res.status(201).json({ message: 'Account registered successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists' });
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const conn = await mysql.createConnection(dbConfig);
        const [rows] = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);
        await conn.end();

        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const match = await bcrypt.compare(password, rows[0].password);
        return match
            ? res.json({ message: 'Login successful' })
            : res.status(401).json({ error: 'Wrong password' });
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/forgot-password', otpLimiter, async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps[email] = { otp, expires: Date.now() + 300000 };

    try {
        const conn = await mysql.createConnection(dbConfig);
        const [rows] = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);
        await conn.end();

        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP is ${otp}`
        });

        res.json({ message: 'OTP sent' });
    } catch {
        res.status(500).json({ error: 'Email sending failed' });
    }
});

app.post('/api/verify-otp', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const data = otps[email];

    if (!data || data.otp !== otp || Date.now() > data.expires) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    try {
        const hashed = await bcrypt.hash(newPassword, 10);
        const conn = await mysql.createConnection(dbConfig);
        await conn.execute('UPDATE users SET password = ? WHERE email = ?', [hashed, email]);
        await conn.end();
        delete otps[email];
        res.json({ message: 'Password updated' });
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

// ----------- BILLING ROUTES -----------

app.get('/api/items', async (_, res) => {
    try {
        const conn = await mysql.createConnection(dbConfig);
        const [rows] = await conn.execute('SELECT * FROM items');
        await conn.end();
        res.json(rows);
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/items', async (req, res) => {
    const { name, price, barcode } = req.body;
    if (!name || !price || !barcode) return res.status(400).json({ error: 'Missing fields' });

    try {
        const conn = await mysql.createConnection(dbConfig);
        await conn.execute('INSERT INTO items (name, price, barcode) VALUES (?, ?, ?)', [name, price, barcode]);
        await conn.end();
        res.json({ message: 'Item added successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Barcode already exists' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
});

app.post('/api/items/manual', async (req, res) => {
    const { name, qty } = req.body;
    if (!name || !qty) return res.status(400).json({ error: 'Missing name or quantity' });

    try {
        const conn = await mysql.createConnection(dbConfig);
        const [rows] = await conn.execute('SELECT * FROM items WHERE name = ?', [name]);
        await conn.end();

        if (rows.length === 0) return res.status(404).json({ error: 'Item not found' });

        const item = rows[0];
        res.json({
            message: 'Item added manually',
            item: { description: item.name, qty, rate: item.price }
        });
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

// Auto-generate new bill number and date
app.get('/api/bill/new', async (_, res) => {
    try {
        const conn = await mysql.createConnection(dbConfig);
        const [rows] = await conn.execute('SELECT MAX(id) as maxId FROM billing');
        const maxId = rows[0].maxId || 0;
        const billNo = `BILL-${String(maxId + 1).padStart(4, '0')}`;
        const date = new Date().toISOString().split('T')[0];
        await conn.end();
        res.json({ billNo, date });
    } catch {
        res.status(500).json({ error: 'Failed to generate bill number' });
    }
});

// ----------- SCANNER SUPPORT -----------

app.get('/api/scan-item', async (req, res) => {
    const { barcode } = req.query;
    if (!barcode) return res.status(400).json({ error: 'Missing barcode' });

    try {
        const conn = await mysql.createConnection(dbConfig);
        const [rows] = await conn.execute('SELECT * FROM items WHERE barcode = ?', [barcode]);
        await conn.end();

        if (rows.length === 0) return res.status(404).json({ error: 'Item not found' });

        const item = rows[0];
        lastScannedItem = {
            description: item.name,
            qty: 1,
            rate: item.price
        };

        res.json({ message: 'Item scanned', item: lastScannedItem });
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/last-scanned', (req, res) => {
    if (lastScannedItem) {
        const temp = lastScannedItem;
        lastScannedItem = null;
        res.json(temp);
    } else {
        res.status(204).send(); // No Content
    }
});

// ----------- START SERVER -----------

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
