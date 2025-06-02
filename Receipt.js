// src/components/Receipt.js
import React from 'react';

const Receipt = ({ billDetails }) => {
    return (
        <div>
            <h2>Receipt</h2>
            <p>Bill No: {billDetails.billNo}</p>
            <p>Date: {billDetails.date}</p>
            <p>Total Amount: ${billDetails.totalAmount}</p>
            {/* Additional receipt details can be added here */}
        </div>
    );
};

export default Receipt;