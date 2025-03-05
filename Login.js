// src/components /Login.js
import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Import the CSS file

const Login = ({ setCurrentView, toggleSidebar }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', { email, password });
            alert(response.data.message); // Handle successful login
            setCurrentView('billing'); // Navigate to Billing after successful login
            toggleSidebar(); // Close the sidebar after login
        } catch (error) {
            alert(error.response ? error.response.data.error : 'An unexpected error occurred.');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Login</button>
            </form>
            <p>
                Don't have an account? <button onClick={() => { setCurrentView('signup'); toggleSidebar(); }}>Sign up</button>
            </p>
            <p>
                Forgot your password? <button onClick={() => { setCurrentView('forgot-password'); toggleSidebar(); }}>Reset password</button>
            </p>
        </div>
    );
};

export default Login;