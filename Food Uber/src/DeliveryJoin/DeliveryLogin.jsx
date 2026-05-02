import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../Navbar/Navbar';
import Footer from '../footer';

export default function DeliveryLogin() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      toast.warning('Please enter phone and PIN');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/delivery/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Logged in successfully!');
        localStorage.setItem('driverToken', data.token);
        localStorage.setItem('driverInfo', JSON.stringify(data.driver));
        navigate('/delivery/dashboard');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error('Network error. Is backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '80vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#1a1a1a', padding: '40px', borderRadius: '16px', border: '1px solid #333', width: '100%', maxWidth: '400px' }}>
          <div className="text-center mb-4">
            <h2 className="text-white fw-bold">Delivery Partner</h2>
            <p className="text-secondary">Log in to start your shift</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="text-secondary mb-1">Phone Number</label>
              <input 
                type="tel" 
                className="form-control bg-dark text-white border-secondary"
                placeholder="Enter 10-digit number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="text-secondary mb-1">PIN (Default: 1234)</label>
              <input 
                type="password" 
                className="form-control bg-dark text-white border-secondary"
                placeholder="Enter your PIN"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-warning w-100 fw-bold py-2 mb-3"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <div className="text-center text-secondary" style={{ fontSize: '0.9rem' }}>
              Want to join our fleet? <Link to="/delivery-join" className="text-warning">Apply here</Link>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
