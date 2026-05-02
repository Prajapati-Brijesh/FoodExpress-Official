import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from "../config";
import { toast } from 'react-toastify';
import './PartnerLogin.css';

const API = API_BASE_URL;

export default function PartnerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/partner/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        localStorage.setItem('partnerToken', data.token);
        localStorage.setItem('partnerInfo', JSON.stringify(data.restaurant));
        toast.success('Login successful!');
        navigate('/admin/vendor'); // Redirect to vendor dashboard
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch {
      toast.error('Server error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pl-page">
      <div className="pl-container">
        <div className="pl-box">
          <div className="pl-header">
            <div className="pl-logo">FoodExpress <span>Partner</span></div>
            <h1>Partner Dashboard Login</h1>
            <p>Manage your restaurant, menu and orders live.</p>
          </div>

          <form onSubmit={handleLogin} className="pl-form">
            <div className="pl-input-group">
              <label>Registered Email Address</label>
              <input 
                type="email" 
                placeholder="owner@restaurant.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="pl-input-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="pl-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Login to Dashboard'}
            </button>
          </form>

          <div className="pl-footer">
            Don't have a partner account? <Link to="/partner">Register your Restaurant</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
