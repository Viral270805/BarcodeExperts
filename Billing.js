import React, { useState } from 'react';
import axios from 'axios';

const Billing = () => {
    const [billNo, setBillNo] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [date, setDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [items, setItems] = useState([]);
    const [description, setDescription] = useState('');
    const [qty, setQty] = useState(1);
    const [rate, setRate] = useState(0);

    const addItem = () => {
        const newItem = { description, qty, rate };
        axios.post('http://localhost:5000/api/items', newItem)
            .then(response => {
                setItems([...items, newItem]);
                setDescription('');
                setQty(1);
                setRate(0);
            })
            .catch(error => {
                console.error('Error adding item:', error);
            });
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => total + item.qty * item.rate, 0);
    };

    return (
        <div className="container">
            <div className="form-section">
                <label htmlFor="billNo">BILL NO</label>
                <input type="text" id="billNo" value={billNo} onChange={(e) => setBillNo(e.target.value)} />
                <label htmlFor="firstName">FIRST NAME</label>
                <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <label htmlFor="lastName">LAST NAME</label>
                <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                <label htmlFor="mobileNo">MOBILE NO</label>
                <input type="text" id="mobileNo" value={mobileNo} onChange={(e) => setMobileNo(e.target.value)} />
                <label htmlFor="date">DATE</label>
                <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <label htmlFor="paymentMethod">PAYMENT METHOD</label>
                <select id="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="online">Online</option>
                </select>
            </div>
            <div className="items-section">
                <table>
                    <thead>
                        <tr>
                            <th>NO</th>
                            <th>DESCRIPTION</th>
                            <th>QTY</th>
                            <th>RATE</th>
                            <th>AMT</th>
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
                            <td colSpan="4">TOTAL</td>
                            <td>{calculateTotal()}</td>
                        </tr>
                    </tbody>
                </table>
                <div>
                    <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    <input type="number" placeholder="Quantity" value={qty} onChange={(e) => setQty(parseInt(e.target.value))} />
                    <input type="number" placeholder="Rate" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} />
                    <button onClick={addItem}>Add Item</button>
                </div>
            </div>
            <a href="#" className="next-button">NEXT</a>
        </div>
    );
};

export default Billing;
