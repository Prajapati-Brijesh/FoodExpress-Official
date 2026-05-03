import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './AdminVendor.css';

import { API_BASE_URL as API } from '../config';

export default function AdminVendorList() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const token = localStorage.getItem('adminToken');

    const fetchVendors = async () => {
        try {
            const res = await fetch(`${API}/api/admin/restaurants/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status === 'success') {
                // In this schema, each restaurant IS a vendor account
                setVendors(data.data);
            }
        } catch (err) {
            toast.error("Failed to load vendors");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleAction = async (id, status) => {
        try {
            const res = await fetch(`${API}/api/admin/restaurants/update/`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ _id: id, status: status, isActive: status === 'Approved' })
            });
            const data = await res.json();
            if (data.status === 'success') {
                toast.success(`Vendor ${status} successfully!`);
                fetchVendors();
            }
        } catch (err) {
            toast.error("Action failed");
        }
    };

    const filtered = vendors.filter(v => 
        v.name.toLowerCase().includes(search.toLowerCase()) || 
        v.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
        v.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="vendor-loading">Loading Vendors...</div>;

    return (
        <div className="admin-vendor-container">
            <div className="vendor-header">
                <div>
                    <h2 className="vendor-title">Vendor Management</h2>
                    <p className="vendor-subtitle">Manage restaurant partners and their applications</p>
                </div>
                <div className="vendor-search-box">
                    <i className="fa-solid fa-magnifying-glass search-icon"></i>
                    <input 
                        type="text" 
                        placeholder="Search by name, owner or email..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="vendor-search-input"
                    />
                </div>
            </div>

            <div className="vendor-stats-grid">
                <div className="vendor-stat-card">
                    <div className="stat-icon purple"><i className="fa-solid fa-store"></i></div>
                    <div className="stat-info">
                        <span className="stat-value">{vendors.length}</span>
                        <span className="stat-label">Total Partners</span>
                    </div>
                </div>
                <div className="vendor-stat-card">
                    <div className="stat-icon orange"><i className="fa-solid fa-clock"></i></div>
                    <div className="stat-info">
                        <span className="stat-value">{vendors.filter(v => v.status === 'Pending').length}</span>
                        <span className="stat-label">Pending Approval</span>
                    </div>
                </div>
                <div className="vendor-stat-card">
                    <div className="stat-icon green"><i className="fa-solid fa-check-double"></i></div>
                    <div className="stat-info">
                        <span className="stat-value">{vendors.filter(v => v.status === 'Approved').length}</span>
                        <span className="stat-label">Active Vendors</span>
                    </div>
                </div>
            </div>

            <div className="vendor-table-wrapper">
                <table className="vendor-table">
                    <thead>
                        <tr>
                            <th>Restaurant</th>
                            <th>Owner Details</th>
                            <th>Status</th>
                            <th>Joined On</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(v => (
                            <tr key={v._id}>
                                <td>
                                    <div className="vendor-name-cell">
                                        <div className="vendor-avatar">
                                            {v.logo ? <img src={v.logo} alt="" /> : v.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="v-name">{v.name}</div>
                                            <div className="v-sub">{v.cuisine} · {v.city}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="v-owner">{v.ownerName || 'N/A'}</div>
                                    <div className="v-sub">{v.email}</div>
                                    <div className="v-sub">{v.phone}</div>
                                </td>
                                <td>
                                    <span className={`status-badge ${v.status?.toLowerCase() || 'pending'}`}>
                                        {v.status || 'Pending'}
                                    </span>
                                </td>
                                <td>{v.registeredAt ? new Date(v.registeredAt).toLocaleDateString() : 'N/A'}</td>
                                <td>
                                    <div className="action-btns">
                                        {v.status === 'Pending' ? (
                                            <>
                                                <button className="btn-approve" onClick={() => handleAction(v._id, 'Approved')}>Approve</button>
                                                <button className="btn-reject" onClick={() => handleAction(v._id, 'Rejected')}>Reject</button>
                                            </>
                                        ) : (
                                            <button className="btn-view" onClick={() => toast.info(`Viewing details for ${v.name}`)}>View Details</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="no-vendors">
                        <i className="fa-solid fa-user-slash"></i>
                        <p>No vendors found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
