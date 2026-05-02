import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from "../config";

export default function AdminDashboard() {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate("/admin-login");
            return;
        }

        fetch(`${API_BASE_URL}/api/get-orders/`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                setOrders(data.data);
            } else {
                alert(data.message);
                navigate("/admin-login");
            }
        });
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("adminToken");
        navigate("/admin-login");
    };

    return (
        <div className="container py-5 text-white">
            <div className="d-flex justify-content-between mb-4">
                <h2>Admin Dashboard - Live Orders</h2>
                <button className="btn btn-danger" onClick={logout}>Logout</button>
            </div>
            
            <table className="table table-dark table-striped">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Total (₹)</th>
                        <th>Items</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order, i) => (
                        <tr key={i}>
                            <td>{new Date(order.date).toLocaleString()}</td>
                            <td>{order.customer?.name}</td>
                            <td>{order.customer?.phone}</td>
                            <td>₹{order.totalAmount}</td>
                            <td>
                                {order.items?.map(item => (
                                    <span key={item.name} className="badge bg-secondary me-1">
                                        {item.name} x{item.qty}
                                    </span>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
