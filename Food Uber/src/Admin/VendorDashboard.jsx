import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Table, Button, Modal, Form } from 'react-bootstrap';
import './VendorDashboard.css';
import ImageUpload from '../components/ImageUpload';
import Navbar from '../Navbar/Navbar';
import { API_BASE_URL } from '../config';
import Footer from '../Footer';
import { toast } from 'react-toastify';

const STATUS_FLOW = {
  'New':       { next: 'Preparing', label: 'Accept',      variant: 'success' },
  'Preparing': { next: 'Ready',     label: 'Mark Ready',  variant: 'warning' },
  'Ready':     { next: 'Delivered', label: 'Handed Over', variant: 'outline-light' },
};

// ── Simple SVG Chart Component for Wow Factor ──
const RevenueChart = ({ data = [] }) => {
  const points = data.length > 0 ? data : [30, 45, 35, 60, 50, 75, 65];
  const max = Math.max(...points) * 1.2 || 1;
  const width = 280;
  const height = 60;
  
  const pathData = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - (p / max) * height;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff6f00" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ff6f00" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${pathData} V ${height} H 0 Z`} fill="url(#grad)" />
      <path d={pathData} fill="none" stroke="#ff6f00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ── KDS Timer Component ──
const KDSTimer = ({ orderDate }) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (!orderDate) return;
    const interval = setInterval(() => {
      const diff = Math.floor((new Date() - new Date(orderDate)) / 1000);
      if (diff < 0) return;
      const m = Math.floor(diff / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setElapsed(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [orderDate]);

  return <span className="kds-timer badge bg-dark"><i className="fa-regular fa-clock me-1"></i> {elapsed || '00:00'}</span>;
};

export default function VendorDashboard() {
  const [orders, setOrders]   = useState([]);
  const [stats, setStats]     = useState({ todayOrders: 0, todayRevenue: 0, activeOrders: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // orderId being updated
  const [activeView, setActiveView] = useState('orders'); // orders | menu | kds | history
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [menu, setMenu] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemForm, setItemForm] = useState({ name: '', price: '', category: 'Main Course', img: '', desc: '' });
  const [savingItem, setSavingItem] = useState(false);
  const navigate = useNavigate();

  const partnerToken = localStorage.getItem('partnerToken');
  const partnerInfo = JSON.parse(localStorage.getItem('partnerInfo') || '{}');

  // ── Redirect if not logged in ──
  useEffect(() => {
    if (!partnerToken) navigate('/partner/login');
  }, [partnerToken, navigate]);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/partner/orders/`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${partnerToken}` }
      });
      const data = await response.json();

      if (data.status === 'success') {
        const formatted = data.data.map(order => ({
          id:       order._id?.$oid || '',
          shortId:  (order._id?.$oid || 'N/A').slice(-8).toUpperCase(),
          customer: order.customer?.name  || 'Unknown',
          phone:    order.customer?.phone || '—',
          address:  order.customer?.address || '—',
          payment:  order.customer?.paymentMethod || 'cod',
          items:    order.items ? order.items.map(i => `${i.qty || 1}x ${i.name}`).join(', ') : '',
          total:    order.totalAmount  || 0,
          status:   order.status       || 'New',
          date:     order.date         || '',
          userId:   order.userId,
          time:     order.date ? new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        }));
        setOrders(formatted);
        
        // Play Audio Notification for new orders
        const newOrdersCount = formatted.filter(o => o.status === 'New').length;
        if (newOrdersCount > lastOrderCount && lastOrderCount !== 0) {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(e => console.log('Audio blocked:', e));
          toast.info('🔔 New Order Received!');
        }
        setLastOrderCount(newOrdersCount);

        if (data.stats) setStats(data.stats);
      } else if (response.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('partnerToken');
        navigate('/partner/login');
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  }, [partnerToken, navigate]);

  useEffect(() => {
    fetchOrders();
    fetchMenu();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/restaurants/${partnerInfo.id || partnerInfo._id}/`);
      const data = await res.json();
      if (data.status === 'success') setMenu(data.data.menu || []);
    } catch (err) { console.error('Fetch menu error:', err); }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.price) { toast.error('Name and price required'); return; }
    setSavingItem(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/restaurants/menu/add/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          restaurantId: partnerInfo.id || partnerInfo._id, 
          ...itemForm, 
          price: parseInt(itemForm.price) 
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success('Item added!');
        setShowItemModal(false);
        setItemForm({ name: '', price: '', category: 'Main Course', img: '', desc: '' });
        fetchMenu();
      }
    } catch { toast.error('Error adding item'); }
    finally { setSavingItem(false); }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/admin/restaurants/menu/delete/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: partnerInfo.id || partnerInfo._id, itemId }),
      });
      toast.success('Item removed!');
      fetchMenu();
    } catch { toast.error('Error deleting item'); }
  };

  const handleStatusUpdate = async (order, newStatus) => {
    setUpdating(order.id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/partner/orders/update/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${partnerToken}`,
        },
        body: JSON.stringify({ orderId: order.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success(`Order #${order.shortId} → ${newStatus}`);
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
        // Update active count locally
        setStats(prev => ({
          ...prev,
          activeOrders: newStatus === 'Delivered'
            ? Math.max(0, prev.activeOrders - 1)
            : prev.activeOrders,
        }));

        // Send notification to user
        if (order.userId) {
          fetch(`${API_BASE_URL}/api/notifications/send/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetId: order.userId,
              role: 'user',
              title: `Order ${newStatus}!`,
              message: `Your order #${order.shortId} from ${partnerInfo.name} is now ${newStatus.toLowerCase()}.`,
              type: 'info'
            })
          }).catch(console.error);
        }
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch {
      toast.error('Server error. Could not update status.');
    } finally {
      setUpdating(null);
    }
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Cancel order #${order.shortId}?`)) return;
    await handleStatusUpdate(order, 'Cancelled');
  };

  const logout = () => {
    localStorage.removeItem('partnerToken');
    localStorage.removeItem('partnerInfo');
    navigate('/partner/login');
  };

  const getStatusBadge = (status) => {
    const map = {
      'New':       <Badge bg="danger"    className="px-3 py-2 rounded-pill">🆕 New</Badge>,
      'Preparing': <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill">🔥 Preparing</Badge>,
      'Ready':     <Badge bg="success"   className="px-3 py-2 rounded-pill">✅ Ready</Badge>,
      'Delivered': <Badge bg="secondary" className="px-3 py-2 rounded-pill">📦 Delivered</Badge>,
      'Cancelled': <Badge bg="dark"      className="px-3 py-2 rounded-pill">❌ Cancelled</Badge>,
    };
    return map[status] || <Badge bg="primary">{status}</Badge>;
  };

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', backgroundColor: '#0d0d0d', color: '#fff', paddingBottom: '3rem' }}>
        <Container className="py-5 mt-4">

          {/* ── Header ── */}
          <div className="d-flex justify-content-between align-items-center mb-4 p-4 rounded-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="d-flex align-items-center gap-4">
              <div style={{ width: 80, height: 80, borderRadius: 16, overflow: 'hidden', background: '#222' }}>
                {partnerInfo.logo ? <img src={partnerInfo.logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🏪</div>}
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <Badge bg="success" className="px-2 py-1">APPROVED PARTNER</Badge>
                  {loading && <div className="spinner-grow spinner-grow-sm text-warning" role="status"></div>}
                </div>
                <h1 className="fw-900 mb-1" style={{ fontSize: '1.8rem', letterSpacing: '-0.5px' }}>
                  {partnerInfo.name || 'Vendor Dashboard'}
                </h1>
                <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>
                  <i className="fa-solid fa-location-dot me-2"></i>
                  {partnerInfo.address}, {partnerInfo.city}
                </p>
              </div>
            </div>
            <div className="text-end d-flex flex-column gap-2">
               <div className="d-flex gap-2">
                 <Button variant={activeView === 'orders' ? 'primary' : 'outline-light'} size="sm" className="rounded-pill px-3" onClick={() => setActiveView('orders')}>
                   <i className="fa-solid fa-receipt me-2"></i>Orders
                 </Button>
                 <Button variant={activeView === 'menu' ? 'primary' : 'outline-light'} size="sm" className="rounded-pill px-3" onClick={() => setActiveView('menu')}>
                   <i className="fa-solid fa-utensils me-2"></i>Menu
                 </Button>
                 <Button variant={activeView === 'kds' ? 'warning' : 'outline-warning'} size="sm" className="rounded-pill px-3" onClick={() => setActiveView('kds')}>
                   <i className="fa-solid fa-fire-burner me-2"></i>KITCHEN MODE
                 </Button>
                 <Button variant={activeView === 'history' ? 'secondary' : 'outline-light'} size="sm" className="rounded-pill px-3" onClick={() => setActiveView('history')}>
                   <i className="fa-solid fa-clock-rotate-left me-2"></i>History
                 </Button>
               </div>
               <Button variant="outline-danger" size="sm" className="rounded-pill px-3" onClick={logout}>
                 <i className="fa-solid fa-right-from-bracket me-2"></i>Logout Portal
               </Button>
            </div>
          </div>

          {/* ── Daily Highlights Ticker ── */}
          <div className="vd-ticker mb-4">
             <div className="vd-ticker-item"><i className="fa-solid fa-star text-warning"></i> 4.8 Average Rating</div>
             <div className="vd-ticker-item"><i className="fa-solid fa-clock text-info"></i> 24 min Avg. Prep Time</div>
             <div className="vd-ticker-item"><i className="fa-solid fa-user-check text-success"></i> 92% Order Completion</div>
          </div>


          {activeView === 'orders' ? (
            <>
              {/* ── Stats ── */}
              <Row className="g-3 mb-5">
                <Col md={3} sm={6}>
                  <Card className="border-0 rounded-4 p-3 h-100 vd-glass" style={{ background: 'rgba(255,87,34,0.08)', border: '1px solid rgba(255,87,34,0.15)' }}>
                    <div className="d-flex justify-content-between">
                      <div className="vd-icon-box" style={{ background: 'rgba(255,87,34,0.15)', color: '#ff5722' }}>
                        <i className="fa-solid fa-receipt"></i>
                      </div>
                      <span className="text-success small fw-bold">+12% ↑</span>
                    </div>
                    <div className="mt-3">
                      <h3 className="fw-900 mb-0">{stats.todayOrders}</h3>
                      <small className="text-secondary">Today's Orders</small>
                    </div>
                  </Card>
                </Col>
                <Col md={3} sm={6}>
                  <Card className="border-0 rounded-4 p-3 h-100 vd-glass" style={{ background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.15)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                       <small className="text-secondary">Revenue Trend</small>
                       <span className="text-success small fw-bold">₹{stats.todayRevenue}</span>
                    </div>
                    <RevenueChart data={orders.filter(o => o.status === 'Delivered').map(o => o.total).slice(-10).length > 0 ? orders.filter(o => o.status === 'Delivered').map(o => o.total).slice(-10) : [20, 35, 25, 50, 40, 65, 55]} />
                    <div className="mt-2">
                      <small className="text-secondary">Today's Revenue</small>
                    </div>
                  </Card>
                </Col>
                <Col md={3} sm={6}>
                  <Card className="border-0 rounded-4 p-3 h-100 vd-glass" style={{ background: 'rgba(255,152,0,0.08)', border: '1px solid rgba(255,152,0,0.15)' }}>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <div className="vd-pulse-dot"></div>
                      <small className="text-warning fw-bold">LIVE ACTIVITY</small>
                    </div>
                    <h3 className="fw-900 mb-0">{stats.activeOrders}</h3>
                    <small className="text-secondary">Active Orders Now</small>
                  </Card>
                </Col>
                <Col md={3} sm={6}>
                  <Card className="border-0 rounded-4 p-3 h-100 vd-glass" style={{ background: 'rgba(33,150,243,0.08)', border: '1px solid rgba(33,150,243,0.15)' }}>
                    <h6 className="text-secondary small mb-3">Customer Loyalty</h6>
                    <div className="d-flex align-items-end gap-1 mb-2">
                      {[30, 45, 60, 40, 80, 50, 90].map((h, i) => (
                        <div key={i} style={{ flex: 1, height: h * 0.3, background: i === 6 ? '#2196f3' : 'rgba(33,150,243,0.3)', borderRadius: 2 }}></div>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                       <small className="text-secondary">Returning Users</small>
                       <span className="fw-bold" style={{ color: '#2196f3' }}>88%</span>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* ── Orders Table ── */}
              <Card className="border-0 rounded-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Card.Header className="bg-transparent border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold text-white"><i className="fa-solid fa-bolt me-2 text-warning"></i>Live Orders</h5>
                </Card.Header>
                <Table responsive variant="dark" className="mb-0">
                  <thead>
                    <tr>
                      {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-5">No live orders.</td></tr>
                    ) : orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').map((order, i) => (
                      <tr key={i}>
                        <td className="py-3"><span className="fw-bold text-warning">#{order.shortId}</span></td>
                        <td>{order.customer}</td>
                        <td style={{maxWidth: '200px'}}>{order.items}</td>
                        <td className="text-success fw-bold">₹{order.total}</td>
                        <td>{getStatusBadge(order.status)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            {STATUS_FLOW[order.status] && (
                              <Button size="sm" variant={STATUS_FLOW[order.status].variant} onClick={() => handleStatusUpdate(order, STATUS_FLOW[order.status].next)}>
                                {STATUS_FLOW[order.status].label}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </>
          ) : activeView === 'menu' ? (
            <div className="ap-menu-section">
              <Row>
                <Col md={8}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold mb-0">Menu Management</h2>
                    <Button variant="primary" onClick={() => setShowItemModal(true)}>Add Item</Button>
                  </div>
                  <Row className="g-3">
                    {menu.map(item => (
                      <Col md={6} key={item.id}>
                        <Card className="bg-dark border-secondary p-2">
                          <div className="d-flex gap-3">
                            <img src={item.img || 'https://via.placeholder.com/60'} style={{width:60, height:60, borderRadius:8, objectFit:'cover'}} alt="" />
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between">
                                <h6 className="mb-0">{item.name}</h6>
                                <span className="text-success fw-bold">₹{item.price}</span>
                              </div>
                              <small className="text-muted d-block">{item.category}</small>
                              <Button variant="link" className="text-danger p-0" onClick={() => handleDeleteItem(item.id)}>Delete</Button>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Col>
                <Col md={4}>
                  <div className="vd-preview-container">
                    <div className="vd-phone-frame">
                      <div className="vd-phone-screen">
                        <div className="vd-phone-top">
                          <div className="vd-phone-banner" style={{backgroundImage: `url(${partnerInfo.banner || ''})`}}></div>
                          <div className="vd-phone-info"><h6>{partnerInfo.name}</h6></div>
                        </div>
                        <div className="vd-phone-menu">
                          {menu.slice(0,3).map((m,i) => (
                            <div key={i} className="vd-phone-item">
                              <div><div className="small fw-bold">{m.name}</div><div className="x-small text-success">₹{m.price}</div></div>
                              <button className="vd-phone-add">ADD</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          ) : activeView === 'kds' ? (
            <div className="vd-kds-section">
              <h2 className="text-warning mb-4"><i className="fa-solid fa-fire-burner me-2"></i>Kitchen Display</h2>
              <Row className="g-3">
                {orders.filter(o => o.status === 'New' || o.status === 'Preparing').map(order => (
                  <Col md={4} key={order.id}>
                    <div className={`vd-kds-card ${order.status === 'New' ? 'new' : ''}`}>
                      <div className="vd-kds-head d-flex justify-content-between align-items-center">
                        <span className="vd-kds-id">#{order.shortId}</span>
                        <KDSTimer orderDate={order.date} />
                      </div>
                      <div className="vd-kds-items">
                        {order.items.split(',').map((it, i) => <div key={i} className="vd-kds-item">{it}</div>)}
                      </div>
                      <div className="vd-kds-foot">
                        <Button variant={order.status === 'New' ? 'success' : 'warning'} className="w-100 py-3" onClick={() => handleStatusUpdate(order, STATUS_FLOW[order.status].next)}>
                          {order.status === 'New' ? 'ACCEPT' : 'MARK READY'}
                        </Button>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          ) : activeView === 'history' ? (
            <Card className="border-0 rounded-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Card.Header className="bg-transparent border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold text-white"><i className="fa-solid fa-clock-rotate-left me-2 text-secondary"></i>Order History</h5>
              </Card.Header>
              <Table responsive variant="dark" className="mb-0">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date/Time</th></tr></thead>
                <tbody>
                  {orders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled').length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-5">No past orders.</td></tr>
                  ) : orders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled').map((order, i) => (
                    <tr key={i}>
                      <td className="py-3"><span className="fw-bold text-secondary">#{order.shortId}</span></td>
                      <td>{order.customer}</td>
                      <td style={{maxWidth: '200px'}}>{order.items}</td>
                      <td className="text-success fw-bold">₹{order.total}</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td className="text-muted">{order.date ? new Date(order.date).toLocaleString() : order.time}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          ) : null}

        </Container>
      </div>

      {/* ── Add Item Modal ── */}
      <Modal show={showItemModal} onHide={() => setShowItemModal(false)} centered contentClassName="bg-dark text-white rounded-4 border-secondary">
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title className="fw-bold">Add Menu Item</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleAddItem}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-secondary">ITEM NAME</Form.Label>
              <Form.Control className="bg-secondary border-0 text-white" placeholder="e.g. Farmhouse Pizza" value={itemForm.name} onChange={e=>setItemForm({...itemForm, name:e.target.value})} required />
            </Form.Group>
            
            <Row className="g-3 mb-3">
              <Col xs={6}>
                <Form.Label className="small fw-bold text-secondary">PRICE (₹)</Form.Label>
                <Form.Control type="number" className="bg-secondary border-0 text-white" placeholder="199" value={itemForm.price} onChange={e=>setItemForm({...itemForm, price:e.target.value})} required />
              </Col>
              <Col xs={6}>
                <Form.Label className="small fw-bold text-secondary">CATEGORY</Form.Label>
                <Form.Select className="bg-secondary border-0 text-white" value={itemForm.category} onChange={e=>setItemForm({...itemForm, category:e.target.value})}>
                  <option>Main Course</option>
                  <option>Starters</option>
                  <option>Beverages</option>
                  <option>Desserts</option>
                  <option>Snacks</option>
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold text-secondary">DESCRIPTION</Form.Label>
              <Form.Control as="textarea" rows={3} className="bg-secondary border-0 text-white" placeholder="Tell customers about this dish..." value={itemForm.desc} onChange={e=>setItemForm({...itemForm, desc:e.target.value})} />
            </Form.Group>

            <ImageUpload label="Item Photo" previewUrl={itemForm.img} onUpload={url => setItemForm({...itemForm, img: url})} />

            <Button variant="primary" type="submit" className="w-100 py-3 rounded-pill fw-bold mt-4" disabled={savingItem}>
              {savingItem ? 'Saving Item...' : 'Add to Menu'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Footer />
    </>
  );
}
