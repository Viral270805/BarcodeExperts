// src/components/ForgotPassword.js
import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/forgot-password', { email });
            alert(response.data.message);
            setStep(2); // Move to OTP verification step
        } catch (error) {
            alert(error.response ? error.response.data.error : 'An unexpected error occurred.');
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/verify-otp', { email, otp, newPassword });
            alert(response.data.message);
            // Optionally redirect to login or another page
        } catch (error) {
            alert(error.response ? error.response.data.error : 'An unexpected error occurred.');
        }
    };

    return (
        <div>
            <h2>Forgot Password</h2>
            {step === 1 ? (
                <form onSubmit={handleRequestOtp}>
                    <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <button type ="submit">Request OTP</button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp}>
                    <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                    <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    <button type="submit">Reset Password</button>
                </form>
            )}
        </div>
    );
};

export default ForgotPassword;