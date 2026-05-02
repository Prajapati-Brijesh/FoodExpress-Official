import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from "../config";
import { toast } from 'react-toastify';
import './AdminPanel.css';

import AdminOverview      from './sections/AdminOverview';
import AdminOrders        from './sections/AdminOrders';
import AdminMenu          from './sections/AdminMenu';
import AdminUsers         from './sections/AdminUsers';
import AdminCoupons       from './sections/AdminCoupons';
import AdminNotifications from './sections/AdminNotifications';
import AdminSettings      from './sections/AdminSettings';
import AdminRestaurants   from './sections/AdminRestaurants';
import AdminDelivery      from './sections/AdminDelivery';
import AdminVendorList    from './AdminVendorList';


const NAV = [
  {
    section: 'MAIN',
    items: [
      { id:'overview',      icon:'fa-chart-pie',       label:'Overview',       badge: null },
      { id:'orders',        icon:'fa-receipt',          label:'Orders',         badge: 'orders' },
    ],
  },
  {
    section: 'MANAGE',
    items: [
      { id:'restaurants',   icon:'fa-store',            label:'Restaurants',    badge: null },
      { id:'vendor',        icon:'fa-user-tie',         label:'Vendors',        badge: null },
      { id:'menu',          icon:'fa-utensils',         label:'Menu Items',     badge: null },

      { id:'users',         icon:'fa-users',            label:'Users',          badge: null },
      { id:'coupons',       icon:'fa-ticket',           label:'Coupons',        badge: null },
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      { id:'delivery',      icon:'fa-motorcycle',       label:'Delivery Partners', badge: null },
    ],
  },
  {
    section: 'COMMUNICATE',
    items: [
      { id:'notifications', icon:'fa-bell',             label:'Notifications',  badge: null },
    ],
  },
  {
    section: 'SYSTEM',
    items: [
      { id:'settings',      icon:'fa-sliders',          label:'Settings',       badge: null },
    ],
  },
];

const PAGE_TITLES = {
  overview:      { title: 'Overview',           subtitle: 'Platform snapshot & analytics' },
  orders:        { title: 'Order Management',   subtitle: 'Live orders · Auto-refresh every 10s' },
  restaurants:   { title: 'Restaurants',        subtitle: 'Add, edit and manage partner restaurants' },
  menu:          { title: 'Menu Management',    subtitle: 'Add, edit, and remove menu items' },
  users:         { title: 'User Management',    subtitle: 'Manage registered customers' },
  coupons:       { title: 'Coupons & Offers',   subtitle: 'Create and manage discount codes' },
  delivery:      { title: 'Delivery Partners',  subtitle: 'Approve riders and manage fleet' },
  vendor:        { title: 'Vendor Management',  subtitle: 'Manage restaurant partners and owners' },
  notifications: { title: 'Notifications',      subtitle: 'Broadcast messages to users' },

  settings:      { title: 'Platform Settings',  subtitle: 'Configure pricing and app behaviour' },
};

export default function AdminPanel() {
  const [active,   setActive]   = useState('overview');
  const [newCount, setNewCount] = useState(0);
  const [sideOpen, setSideOpen] = useState(false);
  const navigate  = useNavigate();

  const token = localStorage.getItem('adminToken');

  // Auth guard
  useEffect(() => {
    if (!token) { navigate('/admin-login'); }
  }, [token, navigate]);

  // Poll new-order badge count
  useEffect(() => {
    const poll = async () => {
      try {
        const res  = await fetch(`${API_BASE_URL}/api/get-orders/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.status === 'success') {
          setNewCount(data.data.filter(o => o.status === 'New').length);
        } else if (res.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin-login');
        }
      } catch {}
    };
    poll();
    const iv = setInterval(poll, 15000);
    return () => clearInterval(iv);
  }, [token, navigate]);

  const logout = () => {
    localStorage.removeItem('adminToken');
    toast.info('Logged out');
    navigate('/admin-login');
  };

  const renderSection = () => {
    const props = { token };
    switch(active) {
      case 'overview':      return <AdminOverview      {...props} />;
      case 'orders':        return <AdminOrders        {...props} />;
      case 'restaurants':   return <AdminRestaurants   {...props} />;
      case 'menu':          return <AdminMenu          {...props} />;
      case 'users':         return <AdminUsers         {...props} />;
      case 'coupons':       return <AdminCoupons       {...props} />;
      case 'delivery':      return <AdminDelivery      {...props} />;
      case 'vendor':        return <AdminVendorList    {...props} />;
      case 'notifications': return <AdminNotifications {...props} />;

      case 'settings':      return <AdminSettings      {...props} />;
      default:              return <AdminOverview      {...props} />;
    }
  };

  if (!token) return null;

  const { title, subtitle } = PAGE_TITLES[active] || {};

  return (
    <div className="ap-root">

      {/* ── SIDEBAR ── */}
      <aside className={`ap-sidebar ${sideOpen ? 'open' : ''}`}>

        {/* Logo */}
        <div className="ap-logo">
          <div className="ap-logo-icon">🍔</div>
          <h2>FoodExpress</h2>
          <span>Super Admin Panel</span>
        </div>

        {/* Nav */}
        <nav className="ap-nav">
          {NAV.map(group => (
            <React.Fragment key={group.section}>
              <div className="ap-nav-section">{group.section}</div>
              {group.items.map(item => {
                const badge = item.badge === 'orders' ? newCount : null;
                return (
                  <button
                    key={item.id}
                    className={`ap-nav-item ${active === item.id ? 'active' : ''}`}
                    onClick={() => { setActive(item.id); setSideOpen(false); }}
                  >
                    <i className={`fa-solid ${item.icon} nav-icon`}></i>
                    {item.label}
                    {badge > 0 && <span className="nav-badge">{badge}</span>}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </nav>

        {/* Footer */}
        <div className="ap-sidebar-footer">
          <div style={{padding:'8px 14px 12px', fontSize:'0.75rem', color:'var(--text-muted)'}}>
            <div style={{fontWeight:600, color:'var(--text)', marginBottom:2}}>Admin</div>
            <div>food123 session active</div>
          </div>
          <button className="ap-logout-btn" onClick={logout}>
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="ap-content">

        {/* Top Bar */}
        <div className="ap-topbar">
          <div style={{display:'flex', alignItems:'center', gap:14}}>
            {/* Mobile menu toggle */}
            <button
              style={{display:'none', background:'none', border:'none', color:'var(--text)', fontSize:'1.2rem', cursor:'pointer'}}
              className="ap-mobile-menu"
              onClick={() => setSideOpen(s => !s)}
            >
              <i className="fa-solid fa-bars"></i>
            </button>
            <div>
              <div className="ap-page-title">{title}</div>
              <div className="ap-page-subtitle">{subtitle}</div>
            </div>
          </div>

          <div className="ap-topbar-right">
            <div className="ap-admin-pill">
              <div className="ap-admin-dot"></div>
              <span style={{fontSize:'0.8rem', fontWeight:600}}>Admin Live</span>
            </div>
            <button
              className="ap-btn ap-btn-ghost ap-btn-sm"
              title="Go to main site"
              onClick={() => navigate('/')}
            >
              <i className="fa-solid fa-arrow-up-right-from-square"></i> View Site
            </button>
          </div>
        </div>

        {/* Page Content */}
        {renderSection()}
      </main>

      {/* Mobile overlay */}
      {sideOpen && (
        <div
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:99}}
          onClick={() => setSideOpen(false)}
        />
      )}
    </div>
  );
}
