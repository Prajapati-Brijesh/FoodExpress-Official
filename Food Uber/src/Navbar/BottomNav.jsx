import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import ScanButton from '../components/ScanButton';
import './BottomNav.css';

export default function BottomNav() {
  const { cartItemCount } = useContext(CartContext);
  const location = useLocation();

  // Hide on admin and delivery pages — they have their own sidebar/navigation
  const HIDDEN_PATHS = ['/admin', '/vendor-dashboard', '/admin-dashboard', '/admin-login', '/delivery'];
  if (HIDDEN_PATHS.some(p => location.pathname.startsWith(p))) return null;

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.toLowerCase().startsWith(path.toLowerCase());
  };

  return (
    <div className="bottom-nav d-md-none d-flex justify-content-around align-items-center">
      <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
        <i className="fa-solid fa-house"></i>
        <span>Home</span>
      </Link>
      <Link to="/Menu" className={`nav-item ${isActive('/menu') ? 'active' : ''}`}>
        <i className="fa-solid fa-utensils"></i>
        <span>Menu</span>
      </Link>
      
      {/* Scanner Center Item */}
      <div className="nav-item">
        <ScanButton />
        <span>Scan</span>
      </div>

      <Link to="/checkout" className={`nav-item position-relative ${isActive('/checkout') ? 'active' : ''}`}>
        <i className="fa-solid fa-cart-shopping"></i>
        <span>Cart</span>
        {cartItemCount > 0 && (
          <span className="badge rounded-pill bg-danger cart-badge">
            {cartItemCount}
          </span>
        )}
      </Link>
      <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
        <i className="fa-solid fa-user"></i>
        <span>Profile</span>
      </Link>
    </div>
  );
}
