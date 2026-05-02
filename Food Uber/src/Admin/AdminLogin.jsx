import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from "../config";
import './AdminLogin.css';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin-login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.status === "success") {
                localStorage.setItem("adminToken", data.token);
                navigate("/admin");
            } else {
                setError(data.message || "Login failed. Please try again.");
            }
        } catch (err) {
            setError("Cannot reach server. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <div className="admin-login-icon">
                    <i className="fa-solid fa-store"></i>
                </div>
                <h2 className="admin-login-title">Admin Portal</h2>
                <p className="admin-login-subtitle">Sign in to manage the system</p>

                <form onSubmit={handleLogin} className="admin-login-form">
                    <div className="admin-input-group">
                        <i className="fa-solid fa-user admin-input-icon"></i>
                        <input
                            type="text"
                            placeholder="Username"
                            className="admin-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="admin-input-group">
                        <i className="fa-solid fa-lock admin-input-icon"></i>
                        <input
                            type="password"
                            placeholder="Password"
                            className="admin-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="admin-login-error">
                            <i className="fa-solid fa-circle-exclamation me-2"></i>{error}
                        </div>
                    )}

                    <button type="submit" className="admin-login-btn" disabled={loading}>
                        {loading
                            ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Signing in...</>
                            : <><i className="fa-solid fa-right-to-bracket me-2"></i>Sign In</>
                        }
                    </button>
                </form>

                <p className="admin-login-hint">
                    <i className="fa-solid fa-shield-halved me-1 text-warning"></i>
                    Restricted to authorized personnel only
                </p>
            </div>
        </div>
    );
}
