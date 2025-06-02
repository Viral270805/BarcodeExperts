// src/components/Sidebar.js
import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ setCurrentView, isAuthenticated, setIsAuthenticated }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleViewChange = (view) => {
        setCurrentView(view);
        setIsOpen(false);
    };

    const handleBillingClick = () => {
        if (!isAuthenticated) {
            alert('Please log in with your credentials to access billing.');
            handleViewChange('login');
        } else {
            handleViewChange('billing');
        }
    };

    const handleLogout = () => {
        const confirmLogout = window.confirm('Are you sure you want to log out?');
        if (confirmLogout) {
            setIsAuthenticated(false);
            alert('You have been logged out.');
            handleViewChange('login');
        }
    };

    return (
        <>
            <button className="hamburger" onClick={toggleSidebar}>
                ☰
            </button>

            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <ul>
                    <li onClick={() => handleViewChange('login')}>Login</li>
                    <li onClick={() => handleViewChange('signup')}>Sign Up</li>
                    <li onClick={() => handleViewChange('forgot-password')}>Forgot Password</li>
                    <li onClick={handleBillingClick}>Billing</li>
                    {isAuthenticated && (
                        <li 
                            onClick={handleLogout} 
                            style={{
                                color: '#d90429',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                marginTop: '10px',
                                borderTop: '1px solid #ccc',
                                paddingTop: '10px'
                            }}
                        >
                            Logout
                        </li>
                    )}
                </ul>
            </div>
        </>
    );
};

export default Sidebar;
