import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Billing.css';

const Billing = ({ setCurrentView, setIsAuthenticated }) => {
    const [billNo, setBillNo] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [date, setDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [items, setItems] = useState([]);
    const [description, setDescription] = useState('');
    const [qty, setQty] = useState(1);

    const fetchNewBill = () => {
        axios.get('http://localhost:5000/api/bill/new')
            .then(res => {
                setBillNo(res.data.billNo);
                setDate(res.data.date);
                setFirstName('');
                setLastName('');
                setMobileNo('');
                setPaymentMethod('cash');
                setItems([]);
                setDescription('');
                setQty(1);
            })
            .catch(err => {
                console.error("Error fetching new bill:", err);
                alert("Failed to generate new bill.");
            });
    };

    useEffect(() => {
        fetchNewBill();
    }, []);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/last-scanned');
                if (res.status === 200 && res.data && res.data.description) {
                    const newItem = res.data;
                    setItems(prevItems => {
                        const index = prevItems.findIndex(item => item.description === newItem.description);
                        if (index !== -1) {
                            const updated = [...prevItems];
                            updated[index].qty += newItem.qty;
                            return updated;
                        } else {
                            return [...prevItems, newItem];
                        }
                    });
                }
            } catch (error) {
                if (error.response?.status !== 204) {
                    console.error("Scan check error:", error);
                }
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        const confirmLogout = window.confirm("Do you want to logout?");
        if (confirmLogout) {
            setIsAuthenticated(false);
            alert("You have been logged out.");
            setCurrentView('login');
        }
    };

    const addItem = async () => {
        if (!description || !qty) {
            alert("Please enter item name and quantity.");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/items/manual', {
                name: description,
                qty
            });

            const item = response.data.item;

            setItems(prevItems => {
                const index = prevItems.findIndex(i => i.description === item.description);
                if (index !== -1) {
                    const updated = [...prevItems];
                    updated[index].qty += item.qty;
                    return updated;
                } else {
                    return [...prevItems, item];
                }
            });

            setDescription('');
            setQty(1);
        } catch (error) {
            console.error("Error adding item manually:", error);
            alert("Item not found or could not be added.");
        }
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => total + item.qty * item.rate, 0);
    };

    const handlePrint = () => {
        const confirmPrint = window.confirm("Do you want to print the bill?");
        if (confirmPrint) {
            const newWindow = window.open('', '_blank');
            const printContent = `
                <html>
                <head>
                    <title>Print Bill</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h2 { text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #333; padding: 8px; text-align: center; }
                        .total-row td { font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h2>Customer Bill</h2>
                    <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                    <p><strong>Mobile No:</strong> ${mobileNo}</p>
                    <p><strong>Bill No:</strong> ${billNo}</p>
                    <p><strong>Date:</strong> ${date}</p>
                    <p><strong>Payment Method:</strong> ${paymentMethod}</p>

                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Description</th>
                                <th>Qty</th>
                                <th>Rate</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map((item, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${item.description}</td>
                                    <td>${item.qty}</td>
                                    <td>${item.rate}</td>
                                    <td>${item.qty * item.rate}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="4">Total</td>
                                <td>${calculateTotal()}</td>
                            </tr>
                        </tbody>
                    </table>
                </body>
                </html>
            `;

            newWindow.document.write(printContent);
            newWindow.document.close();
            newWindow.print();
        } else {
            const makeNew = window.confirm("Do you want to make another bill?");
            if (makeNew) {
                fetchNewBill();
            }
        }
    };

    return (
        <div className="billing-container">
            <button className="logout-button" onClick={handleLogout}>Logout</button>

            <div className="billing-form-section">
                <h2>Billing Information</h2>
                <hr className="separator-line" />
                <div className="billing-input-grid">
                    <div>
                        <label>Bill No</label>
                        <input type="text" value={billNo} readOnly />
                        <label>First Name</label>
                        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        <label>Last Name</label>
                        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        <label>Mobile No</label>
                        <input type="text" value={mobileNo} onChange={(e) => setMobileNo(e.target.value)} />
                        <label>Date</label>
                        <input type="date" value={date} readOnly />
                        <label>Payment Method</label>
                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="online">Online</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="billing-items-section">
                <h2>Items List</h2>
                <table className="billing-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Rate</th>
                            <th>Amt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.description}</td>
                                <td>{item.qty}</td>
                                <td>{item.rate}</td>
                                <td>{item.qty * item.rate}</td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan="4">Total</td>
                            <td>{calculateTotal()}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="billing-inputs">
                    <input
                        type="text"
                        placeholder="Item Name"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Quantity"
                        value={qty}
                        onChange={(e) => setQty(parseInt(e.target.value))}
                    />
                    <button onClick={addItem}>Add Item</button>
                </div>
            </div>

            <button className="billing-next-button" onClick={handlePrint}>Next</button>
        </div>
    );
};

export default Billing;
