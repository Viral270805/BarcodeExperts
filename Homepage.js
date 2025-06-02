// src/components/HomePage.js
import React from 'react';
import './HomePage.css';

const HomePage = ({ setCurrentView }) => {
    return (
        <div className="homepage-container">
            {/* Homepage Box */}
            <div className="homepage-box">
                <h1 className="homepage-title">Welcome to Barcode Experts.</h1>
                <p className="homepage-description">
                    Our platform offers best user-experience for creating bills in easier way.
                </p>
                <button className="homepage-button" onClick={() => setCurrentView('login')}>
                    Go to Login
                </button>
                <div className="homepage-footer">
                    &copy; 2025 Your Company Name. All Rights Reserved.
                </div>
            </div>
        </div>
    );
};

export default HomePage;
