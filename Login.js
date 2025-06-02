// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ setCurrentView, toggleSidebar, setIsAuthenticated }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', { email, password });
            alert(response.data.message);

            //Set authenticated state
            setIsAuthenticated(true);

            // Navigate to billing after login
            setCurrentView('billing');

            //Close sidebar
            toggleSidebar();
        } catch (error) {
            alert(error.response ? error.response.data.error : 'An unexpected error occurred.');
        }
    };

    return (
        <div className="main-wrapper">
            {/* Left Image Section */}
            <div className="image-section">
                {/* Background image is handled in CSS */}
            </div>

            {/* Right Login Section */}
            <div className="login-container">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>

                <p>
                    Don't have an account?{' '}
                    <button onClick={() => { setCurrentView('signup'); toggleSidebar(); }}>
                        Sign up
                    </button>
                </p>

                <p>
                    Forgot your password?{' '}
                    <button onClick={() => { setCurrentView('forgot-password'); toggleSidebar(); }}>
                        Reset password
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
