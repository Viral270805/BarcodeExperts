// src/components/Sidebar.js
import React from 'react';
import './Sidebar.css'; // Import the CSS file

const Sidebar = ({ setCurrentView, isOpen, toggleSidebar }) => {
    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <button className="close-btn" onClick={toggleSidebar}>X</button>
            <ul>
                <li onClick={() => { setCurrentView('login'); toggleSidebar(); }}>Login</li>
                <li onClick={() => { setCurrentView('signup'); toggleSidebar(); }}>Sign Up</li>
                <li onClick={() => { setCurrentView('forgot-password'); toggleSidebar(); }}>Forgot Password</li>
                <li onClick={() => { setCurrentView('billing'); toggleSidebar(); }}>Billing</li>
            </ul>
        </div>
    );
};

export default Sidebar;