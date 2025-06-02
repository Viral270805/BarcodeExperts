// src/components/Cart.js
import React from 'react';

const Cart = ({ cart, totalAmount, onPrint }) => {
    return (
        <div className="cart-container">
            <h3>Cart</h3>
            <table>
                <thead>
                    <tr>
                        <th>Sr No</th>
                        <th>Name of Item</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {cart.map((item, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.description}</td>
                            <td>{item.qty}</td>
                            <td>{item.rate}</td>
                            <td>{item.rate * item.qty}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h4>Total Amount: ₹{totalAmount}</h4>
            <button onClick={onPrint}>Print Bill</button>
        </div>
    );
};

export default Cart;
