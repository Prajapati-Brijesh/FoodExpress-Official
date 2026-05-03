import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Form, FormControl, Button, NavDropdown, Badge } from 'react-bootstrap';
import { useTranslation } from "react-i18next";
import { MenuContext } from "../context/MenuContext";
import { CartContext } from "../context/CartContext";
import { useNotifications } from "../context/NotificationContext";
import ScanButton from "../components/ScanButton";
import "./Navbar.css";

function CustomNavbar() {
  const { cartItemCount } = useContext(CartContext);
  const { allProducts } = useContext(MenuContext);
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.body.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      document.body.classList.toggle('light-mode', next === false);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
    } else {
      setSearchResults(
        allProducts.filter(item =>
          (item.displayName || item.name).toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  };

  const handleSelectProduct = (item) => {
    setSearchQuery("");
    setSearchResults([]);
    navigate(`/product/${encodeURIComponent(item.name)}`);
  };

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossOrigin="anonymous" />
      <Navbar expand="lg" sticky="top" variant="dark" className="custom-navbar">
        <Container>
          {/* Brand */}
          <Navbar.Brand as={Link} to="/" className="logo">FoodExpress</Navbar.Brand>

          {/* Mobile: show cart + bell + toggle before hamburger */}
          <div className="d-flex align-items-center gap-2 d-lg-none ms-auto me-2">
            {/* Scanner - mobile */}
            <ScanButton />
            {/* Bell - mobile */}
            <div className="nb-icon-btn position-relative" ref={notifRef} onClick={() => { setShowNotifs(s => !s); markAllRead(); }}>
              <i className="fa-solid fa-bell"></i>
              {unreadCount > 0 && <span className="nb-badge">{unreadCount}</span>}
              {showNotifs && (
                <div className="notif-dropdown">
                  <div className="notif-header">🔔 Notifications</div>
                  {notifications.length === 0
                    ? <div className="notif-empty">No notifications yet</div>
                    : notifications.map(n => (
                      <div key={n.id} className="notif-item">
                        <span className="notif-icon">{n.type === 'order' ? '🛵' : n.type === 'success' ? '✅' : 'ℹ️'}</span>
                        <div>
                          <div className="notif-title">{n.title}</div>
                          <div className="notif-msg">{n.message}</div>
                          <div className="notif-time">{new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
            {/* Cart - mobile */}
            <Link to="/checkout" className="nb-icon-btn position-relative">
              <i className="fa-solid fa-cart-shopping"></i>
              {cartItemCount > 0 && <span className="nb-badge">{cartItemCount}</span>}
            </Link>
          </div>

          <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />

          <Navbar.Collapse id="basic-navbar-nav">
            {/* Search Bar */}
            <Form className="d-flex search-form me-3" onSubmit={e => e.preventDefault()}>
              <FormControl
                type="search"
                placeholder={t('search_placeholder')}
                className="search-input"
                value={searchQuery}
                onChange={handleSearch}
              />
              <Button variant="link" className="search-btn">
                <i className="fa-solid fa-magnifying-glass"></i>
              </Button>
              {searchResults.length > 0 && (
                <div className="search-dropdown">
                  {searchResults.map((item, index) => (
                    <div key={index} className="search-dropdown-item" onClick={() => handleSelectProduct(item)}>
                      <img src={item.img} alt={item.displayName || item.name} className="search-item-img" />
                      <div>
                        <div className="search-item-name">{item.displayName || item.name}</div>
                        <div className="search-item-price">₹{item.discountedPrice || item.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Form>

            {/* Nav Links */}
            <Nav className="me-auto mb-2 mb-lg-0">
              <Nav.Link as={Link} to="/" className="nav-link">{t('home')}</Nav.Link>
              <Nav.Link as={Link} to="/Menu" className="nav-link">{t('menu')}</Nav.Link>
              <Nav.Link as={Link} to="/restaurants" className="nav-link">{t('restaurants')}</Nav.Link>
              <Nav.Link as={Link} to="/Contact" className="nav-link">{t('contact')}</Nav.Link>
              <Nav.Link as={Link} to="/discover" className="nav-link discover-link">
                ⚡ {t('discover')}
              </Nav.Link>
            </Nav>

            {/* Desktop-only right icons */}
            <Nav className="align-items-center gap-3 d-none d-lg-flex">
              
              {/* Cart stays outside for quick access */}
              <Link to="/checkout" className="nb-icon-btn position-relative" title={t('cart')}>
                <i className="fa-solid fa-cart-shopping"></i>
                {cartItemCount > 0 && <span className="nb-badge">{cartItemCount}</span>}
              </Link>

              {/* Scanner - desktop */}
              <ScanButton />

              {/* Account / More Menu */}
              <NavDropdown 
                align="end"
                title={
                  <div className="position-relative d-inline-block">
                    <i className="fa-solid fa-user-circle fs-5"></i>
                    {unreadCount > 0 && <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"><span className="visually-hidden">New alerts</span></span>}
                  </div>
                } 
                id="account-nav-dropdown"
                className="account-dropdown"
              >
                {/* Profile */}
                <NavDropdown.Item as={Link} to="/profile">
                  <i className="fa-solid fa-user me-2"></i> {t('profile')}
                </NavDropdown.Item>

                {/* Login / Auth */}
                <NavDropdown.Item as={Link} to="/login">
                  <i className="fa-solid fa-right-to-bracket me-2"></i> {t('signin')}
                </NavDropdown.Item>

                <NavDropdown.Divider />

                {/* Notifications */}
                <div className="px-3 py-2">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold" style={{ fontSize: '0.9rem' }}>🔔 Notifications</span>
                    {unreadCount > 0 && (
                      <span className="badge bg-danger rounded-pill" onClick={markAllRead} style={{ cursor: 'pointer', fontSize: '0.7rem' }}>
                        Mark Read
                      </span>
                    )}
                  </div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {notifications.length === 0
                      ? <div className="text-muted small text-center py-2">No notifications yet</div>
                      : notifications.map(n => (
                        <div key={n.id} className="d-flex gap-2 align-items-start mb-2 pb-2 border-bottom border-secondary border-opacity-25">
                          <span style={{ fontSize: '1.2rem' }}>{n.type === 'order' ? '🛵' : n.type === 'success' ? '✅' : 'ℹ️'}</span>
                          <div style={{ lineHeight: '1.2' }}>
                            <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{n.title}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{n.message}</div>
                            <div className="text-secondary" style={{ fontSize: '0.65rem', marginTop: '2px' }}>{new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>

                <NavDropdown.Divider />

                {/* Theme Toggle */}
                <NavDropdown.Item onClick={toggleTheme}>
                  {isDarkMode 
                    ? <><i className="fa-solid fa-sun text-warning me-2"></i> Light Mode</> 
                    : <><i className="fa-solid fa-moon me-2"></i> Dark Mode</>
                  }
                </NavDropdown.Item>

              </NavDropdown>
            </Nav>

            {/* Mobile-only extra links */}
            <Nav className="d-lg-none mt-2 border-top border-secondary pt-2">
              <Nav.Link as={Link} to="/profile" className="nav-link">{t('profile')}</Nav.Link>
              <Nav.Link as={Link} to="/login" className="nav-link">{t('signin')}</Nav.Link>
              <Nav.Link as={Link} to="/checkout" className="nav-link">🛒 {t('cart')} {cartItemCount > 0 && `(${cartItemCount})`}</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default CustomNavbar;
