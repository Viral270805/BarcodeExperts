// src/components/SignUp.js
import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css'; // Import the CSS file

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/signup', { email, password });
            alert(response.data.message);
        } catch (error) {
            alert(error.response ? error.response.data.error : 'An unexpected error occurred.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Sign Up</button>
        </form>
    );
};

export default SignUp;