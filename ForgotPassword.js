import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';

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
        <div className="forgot-password-container">
            <form>
                <h2>Forgot Password</h2>
                {step === 1 ? (
                    <div className="form-step">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button onClick={handleRequestOtp}>Request OTP</button>
                    </div>
                ) : (
                    <div className="form-step">
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <button onClick={handleVerifyOtp}>Reset Password</button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default ForgotPassword;
