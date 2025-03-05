const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise'); // Use promise-based MySQL
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit'); // For rate limiting
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Create MySQL connection
const dbConfig = {
    host: 'localhost',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: 'billing_system'
};

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Object to store OTPs and their expiration times
const otps = {};

// Rate limiter for OTP requests
const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many OTP requests, please try again later.'
});

// Create tables if they do not exist
const createTables = async () => {
    const connection = await mysql.createConnection(dbConfig);
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
        );
    `;
    const createBillingTable = `
        CREATE TABLE IF NOT EXISTS billing (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_email VARCHAR(255) NOT NULL,
            billing_address VARCHAR(255),
            payment_method VARCHAR(50),
            amount DECIMAL(10, 2),
            FOREIGN KEY (user_email) REFERENCES users(email)
        );
    `;
    await connection.execute(createUsersTable);
    await connection.execute(createBillingTable);
    await connection.end(); // Close the connection
};

// Call the function to create tables
createTables();

// Account Registration (Sign Up)
app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (email, password) VALUES (?, ?)';

        await connection.execute(query, [email, hashedPassword]);
        await connection.end(); // Close the connection
        res.status(201).json({ message: 'Account registered successfully' });
    } catch (error) {
        console.error('Error during signup:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Send OTP with rate limiting
app.post('/api/forgot-password', otpLimiter, async (req, res) => {
    const { email } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [results] = await connection.execute(query, [email]);
        await connection.end(); // Close the connection

        if (results.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        // Generate a random OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expirationTime = Date.now() + 300000; // OTP valid for 5 minutes
        otps[email] = { otp, expirationTime };

        // Send OTP via email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'OTP sent to your email' });
    } catch (error) {
        console.error('Error querying database or sending OTP:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify OTP and allow password reset
app.post('/api/verify-otp', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const otpData = otps[email];

    if (otpData && otpData.otp === otp && Date.now() < otpData.expirationTime) {
        // Update account password
        const query = 'UPDATE users SET password = ? WHERE email = ?';

        try {
            const connection = await mysql.createConnection(dbConfig);
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await connection.execute(query, [hashedPassword, email]);
            await connection.end(); // Close the connection
            delete otps[email]; // Remove OTP after verification
            res.json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error('Error during password update:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(400).json({ error: 'Invalid or expired OTP' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [results] = await connection.execute(query, [email]);
        await connection.end(); // Close the connection

        if (results.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password); // Compare hashed password

        if (isMatch) {
            res.json({ message: 'Login successful' });
        } else {
            res.status(401).json({ error: 'Invalid password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// New endpoint to get billing information
app.get('/api/billing/:email', async (req, res) => {
    const { email } = req.params;
    const query = 'SELECT * FROM billing WHERE user_email = ?';

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [results] = await connection.execute(query, [email]);
        await connection.end(); // Close the connection

        if (results.length === 0) {
            return res.status(404).json({ error: 'Billing information not found' });
        }

        res.json(results[0]); // Return the billing information
    } catch (error) {
        console.error('Error retrieving billing information:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// New endpoint to update billing information
app.put('/api/billing', async (req, res) => {
    const { email, billingDetails } = req.body; // billingDetails should contain the fields to update
    const query = 'UPDATE billing SET ? WHERE user_email = ?';

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(query, [billingDetails, email]);
        await connection.end(); // Close the connection
        res.json({ message: 'Billing information updated successfully' });
    } catch (error) {
        console.error('Error updating billing information:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// New endpoint to fetch items
app.get('/api/items', async (req, res) => {
    const query = 'SELECT * FROM items';

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [results] = await connection.execute(query);
        await connection.end(); // Close the connection

        if (results.length === 0) {
            return res.status(404).json({ error: 'Items not found' });
        }

        res.json(results); // Return the items
    } catch (error) {
        console.error('Error retrieving items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
