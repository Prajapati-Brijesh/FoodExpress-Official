import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// ─── Mini Bar Chart Component ──────────────────────────────────
function WeekChart({ data }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60 }}>
      {data.map((val, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: '100%', background: val > 0 ? 'linear-gradient(180deg, #f59e0b, #d97706)' : '#1f2937',
            borderRadius: 4, height: `${(val / max) * 50}px`, minHeight: val > 0 ? 6 : 4,
            transition: 'height 0.8s ease'
          }} />
          <span style={{ fontSize: '0.6rem', color: '#6b7280' }}>{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Achievement Badge ──────────────────────────────────────────
function Badge({ icon, label, unlocked }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      opacity: unlocked ? 1 : 0.3, filter: unlocked ? 'none' : 'grayscale(1)'
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%', fontSize: '1.4rem',
        background: unlocked ? 'linear-gradient(135deg, #f59e0b22, #d97706)' : '#1f2937',
        border: unlocked ? '1px solid #f59e0b66' : '1px solid #333',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>{icon}</div>
      <span style={{ fontSize: '0.65rem', color: unlocked ? '#f59e0b' : '#6b7280', textAlign: 'center' }}>{label}</span>
    </div>
  );
}

export default function DeliveryDashboard() {
  const [driver, setDriver] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [notifications, setNotifications] = useState([]);
  const [weekData] = useState(() => {
    // Simulated weekly data (to be replaced by real API later)
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 10));
  });
  const prevOrderCount = useRef(0);
  const navigate = useNavigate();

  const driverToken = localStorage.getItem('driverToken');

  const playNotification = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [880, 1100, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.4, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.15);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.15);
      });
    } catch (e) { }
  };

  const fetchDashboard = useCallback(async () => {
    if (!driverToken) { navigate('/delivery/login'); return; }
    try {
      const res = await fetch('http://localhost:8000/api/delivery/dashboard/', {
        headers: { 'Authorization': `Bearer ${driverToken}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setDriver(data.driver);
        setIsOnline(data.driver.isOnline);
        setActiveOrder(data.activeOrder);
        const newCount = data.availableOrders?.length || 0;
        if (newCount > prevOrderCount.current) {
          playNotification();
          const msg = '🔔 New order nearby! Go accept it.';
          toast.info(msg, { autoClose: 5000 });
          setNotifications(prev => [{ id: Date.now(), msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev.slice(0, 19)]);
        }
        prevOrderCount.current = newCount;
        setAvailableOrders(data.availableOrders);
      } else {
        localStorage.removeItem('driverToken');
        navigate('/delivery/login');
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [driverToken, navigate]);

  useEffect(() => {
    fetchDashboard();
    const iv = setInterval(fetchDashboard, 8000);
    return () => clearInterval(iv);
  }, [fetchDashboard]);

  const toggleDuty = async () => {
    try {
      const newStatus = !isOnline;
      const res = await fetch('http://localhost:8000/api/delivery/duty/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${driverToken}` },
        body: JSON.stringify({ isOnline: newStatus })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setIsOnline(newStatus);
        toast.info(newStatus ? '🟢 You are now ONLINE' : '🔴 You are now OFFLINE');
        fetchDashboard();
      }
    } catch { toast.error('Error toggling status'); }
  };

  const acceptOrder = async (orderId) => {
    try {
      const res = await fetch('http://localhost:8000/api/delivery/order/accept/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${driverToken}` },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (data.status === 'success') { toast.success('✅ Order Accepted! Head to restaurant.'); fetchDashboard(); }
      else toast.error(data.message);
    } catch { toast.error('Network Error'); }
  };

  const deliverOrder = async (orderId) => {
    try {
      const res = await fetch('http://localhost:8000/api/delivery/order/deliver/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${driverToken}` },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (data.status === 'success') { playNotification(); toast.success('🎉 Delivery Complete! Great job!'); fetchDashboard(); }
      else toast.error(data.message);
    } catch { toast.error('Network Error'); }
  };

  if (loading) return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'white' }}>
      <div className="spinner-border text-warning" role="status"></div>
      <p className="text-muted small">Loading your dashboard...</p>
    </div>
  );

  const hours = Math.floor((driver?.totalMinutesWorked || 0) / 60);
  const mins = (driver?.totalMinutesWorked || 0) % 60;
  const earnings = (hours * 50) + ((driver?.deliveries || 0) * 20);
  const deliveries = driver?.deliveries || 0;
  const acceptanceRate = deliveries > 0 ? Math.min(100, Math.round(deliveries * 9.3)) : 0;

  const achievements = [
    { icon: '🚀', label: 'First Delivery', unlocked: deliveries >= 1 },
    { icon: '🔥', label: '10 Rides', unlocked: deliveries >= 10 },
    { icon: '⭐', label: 'Top Rated', unlocked: (driver?.rating || 0) >= 4.5 },
    { icon: '💎', label: '50 Rides', unlocked: deliveries >= 50 },
    { icon: '👑', label: 'Elite', unlocked: deliveries >= 100 },
  ];

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ background: '#0a0a0a', width: '100%', maxWidth: '480px', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 0 20px rgba(245,158,11,0.05)' }}>

      {/* ── Sticky Header ── */}
      <div style={{ background: '#111', borderBottom: '1px solid #1f2937', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="d-flex align-items-center gap-3">
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.3rem', flexShrink: 0 }}>
            {driver?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="fw-bold" style={{ lineHeight: 1.1 }}>{driver?.name}</div>
            <div style={{ fontSize: '0.65rem', color: '#f59e0b', fontFamily: 'monospace', letterSpacing: 1, fontWeight: 700 }}>
              {driver?.deliveryId || 'FE-XXXXXX'} • {driver?.vehicleType}
            </div>
          </div>
        </div>

        {/* Duty Toggle */}
        <div className="d-flex align-items-center gap-2">
          <span style={{ fontSize: '0.75rem', color: isOnline ? '#4ade80' : '#6b7280', fontWeight: 600 }}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          <div onClick={toggleDuty} style={{
            width: 54, height: 28, borderRadius: 20, cursor: 'pointer', transition: 'background 0.3s',
            background: isOnline ? '#16a34a' : '#374151', position: 'relative', display: 'flex', alignItems: 'center', padding: '2px'
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: 'white',
              transition: 'transform 0.3s', transform: isOnline ? 'translateX(26px)' : 'translateX(0px)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
            }} />
          </div>
        </div>
      </div>

      {/* ── Main Scroll Area ── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>

        {/* ── HOME TAB ── */}
        {activeTab === 'home' && (
          <div style={{ padding: '16px' }}>

            {/* Earnings Hero */}
            <div style={{
              background: 'linear-gradient(135deg, #1c1407, #2d1f04)',
              border: '1px solid #f59e0b33', borderRadius: 20, padding: '20px', marginBottom: 16,
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.15), transparent)', pointerEvents: 'none' }} />
              <p style={{ color: '#9ca3af', fontSize: '0.78rem', margin: 0 }}>Today's Earnings</p>
              <h2 style={{ color: '#f59e0b', fontWeight: 900, fontSize: '2rem', margin: '4px 0 0' }}>₹{earnings}</h2>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: 0 }}>₹50/hr + ₹20/delivery</p>
              <div style={{ display: 'flex', gap: 20, marginTop: 14, paddingTop: 14, borderTop: '1px solid #2d2006' }}>
                {[
                  { label: 'Hours', value: `${hours}h ${mins}m` },
                  { label: 'Deliveries', value: deliveries },
                  { label: 'Acceptance', value: `${acceptanceRate}%` },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>{s.value}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak Bonus Banner */}
            {deliveries < 10 && (
              <div style={{ background: 'linear-gradient(135deg, #1e3a1e, #0f2a0f)', border: '1px solid #16a34a44', borderRadius: 16, padding: 14, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.88rem' }}>🎯 {deliveries === 0 ? 'Welcome Bonus!' : 'Streak Bonus!'}</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Complete {10 - deliveries} more → earn ₹100 bonus</div>
                  <div style={{ background: '#1f2937', borderRadius: 20, height: 5, width: 160, marginTop: 6 }}>
                    <div style={{ background: '#4ade80', height: 5, borderRadius: 20, width: `${(deliveries / 10) * 100}%` }} />
                  </div>
                </div>
                <span style={{ fontSize: '1.8rem' }}>🏆</span>
              </div>
            )}

            {/* Active Order / Search Orders */}
            {activeOrder ? (
              <div style={{ background: '#0f1f14', border: '1px solid #16a34a', borderRadius: 18, padding: '18px', marginBottom: 16 }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <span style={{ background: '#16a34a', color: 'white', padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700 }}>🚀 ACTIVE</span>
                  </div>
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>₹{activeOrder.totalAmount}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{activeOrder.customer?.name}</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.82rem' }}>📞 {activeOrder.customer?.phone}</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.82rem', marginTop: 2 }}>📍 {activeOrder.customer?.address}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                  {activeOrder.items?.map((item, i) => (
                    <div key={i} className="d-flex justify-content-between" style={{ fontSize: '0.82rem', marginBottom: 2 }}>
                      <span>{item.qty || 1}× {item.name || item.displayName}</span>
                      <span style={{ color: '#9ca3af' }}>₹{item.price}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(activeOrder.customer?.address || '')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ flex: 1, background: '#1e3a5f', border: 'none', color: '#38bdf8', borderRadius: 10, padding: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', fontSize: '0.85rem' }}
                  >
                    🗺️ Navigate
                  </a>
                  <button
                    onClick={() => deliverOrder(activeOrder._id || activeOrder.id)}
                    style={{ flex: 2, background: 'linear-gradient(135deg, #16a34a, #15803d)', border: 'none', color: 'white', borderRadius: 10, padding: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    ✅ Mark Delivered
                  </button>
                </div>
              </div>
            ) : isOnline ? (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0 fw-bold">Nearby Orders</h6>
                  <span style={{ background: '#16a34a22', color: '#4ade80', fontSize: '0.7rem', padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>{availableOrders.length} available</span>
                </div>
                {availableOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: '#111', borderRadius: 16, border: '1px dashed #1f2937' }}>
                    <div style={{ fontSize: '2.5rem', opacity: 0.3, marginBottom: 10 }}>🛵</div>
                    <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>No orders nearby. Sit tight, we'll alert you!</p>
                    <div style={{ marginTop: 16 }}>
                      <div className="spinner-grow spinner-grow-sm text-warning mx-1" role="status"></div>
                      <div className="spinner-grow spinner-grow-sm text-warning mx-1" role="status" style={{ animationDelay: '0.2s' }}></div>
                      <div className="spinner-grow spinner-grow-sm text-warning mx-1" role="status" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {availableOrders.map(order => (
                      <div key={order._id} style={{ background: '#151515', border: '1px solid #222', borderRadius: 14, padding: 14 }}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>📍 {order.customer?.address?.substring(0, 28)}...</div>
                            <div style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: 3 }}>{order.items?.length} items • Customer: {order.customer?.name}</div>
                          </div>
                          <div style={{ textAlign: 'right', marginLeft: 12, flexShrink: 0 }}>
                            <div style={{ color: '#f59e0b', fontWeight: 700 }}>₹{order.totalAmount}</div>
                            <button
                              onClick={() => acceptOrder(order._id || order.id)}
                              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: 'black', borderRadius: 8, padding: '5px 14px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', marginTop: 4 }}
                            >Accept</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px 20px', background: '#111', borderRadius: 16, border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>😴</div>
                <h6 style={{ color: '#6b7280' }}>You're currently offline</h6>
                <p style={{ color: '#4b5563', fontSize: '0.82rem' }}>Toggle the switch to go online and start earning.</p>
              </div>
            )}

            {/* Weekly Chart */}
            <div style={{ background: '#111', border: '1px solid #1f2937', borderRadius: 16, padding: 16, marginTop: 16 }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>This Week</span>
                <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>Deliveries per day</span>
              </div>
              <WeekChart data={weekData} />
            </div>

            {/* Achievements */}
            <div style={{ background: '#111', border: '1px solid #1f2937', borderRadius: 16, padding: 16, marginTop: 12 }}>
              <h6 className="fw-bold mb-3">🏅 Achievements</h6>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {achievements.map((a, i) => <Badge key={i} {...a} />)}
              </div>
            </div>

            {/* Daily Challenge */}
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: '1px solid #4f46e5', borderRadius: 16, padding: 16, marginTop: 12 }}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div style={{ color: '#a78bfa', fontSize: '0.72rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>⚡ Daily Challenge</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Complete 5 deliveries today</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: 2 }}>Reward: ₹150 bonus 🎁</div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 20, height: 6, width: 180, marginTop: 10 }}>
                    <div style={{ background: '#7c3aed', height: 6, borderRadius: 20, width: `${Math.min(100, (deliveries % 5) / 5 * 100)}%`, transition: 'width 0.6s' }} />
                  </div>
                  <div style={{ color: '#a78bfa', fontSize: '0.72rem', marginTop: 5 }}>{deliveries % 5}/5 completed today</div>
                </div>
                <span style={{ fontSize: '2rem' }}>🎯</span>
              </div>
            </div>

            {/* Leaderboard */}
            <div style={{ background: '#111', border: '1px solid #1f2937', borderRadius: 16, padding: 16, marginTop: 12 }}>
              <h6 className="fw-bold mb-3">🏆 City Leaderboard</h6>
              {[
                { rank: 1, name: 'Raj Kumar', d: 48, medal: '🥇' },
                { rank: 2, name: 'Suresh B.', d: 41, medal: '🥈' },
                { rank: 3, name: 'Aman Singh', d: 37, medal: '🥉' },
                { rank: null, name: driver?.name || 'You', d: deliveries, medal: '👤', isYou: true },
              ].map((p, i) => (
                <div key={i} className="d-flex align-items-center gap-3" style={{ borderBottom: i < 3 ? '1px solid #1f2937' : 'none', background: p.isYou ? 'rgba(245,158,11,0.07)' : 'none', borderRadius: p.isYou ? 10 : 0, padding: p.isYou ? '10px 8px' : '10px 0' }}>
                  <span style={{ fontSize: '1.3rem', width: 28, textAlign: 'center' }}>{p.medal}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: p.isYou ? 700 : 500, color: p.isYou ? '#f59e0b' : 'white', fontSize: '0.88rem' }}>{p.name}{p.isYou ? ' (You)' : ''}</div>
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{p.d} deliveries</div>
                </div>
              ))}
            </div>

            {/* Weather & Tips */}
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <div style={{ flex: 1, background: '#111', border: '1px solid #1f2937', borderRadius: 14, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem' }}>☀️</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>32°C</div>
                <div style={{ color: '#9ca3af', fontSize: '0.72rem' }}>Clear Sky</div>
                <div style={{ color: '#6b7280', fontSize: '0.7rem', marginTop: 4 }}>Good day to deliver!</div>
              </div>
              <div style={{ flex: 1, background: 'linear-gradient(135deg, #0f2a1e, #1a3d2b)', border: '1px solid #16a34a33', borderRadius: 14, padding: 14 }}>
                <div style={{ color: '#4ade80', fontSize: '0.7rem', fontWeight: 700, marginBottom: 6 }}>💡 Today's Tip</div>
                <div style={{ fontSize: '0.78rem', color: '#d1fae5', lineHeight: 1.5 }}>Peak hours are 12–2 PM & 7–9 PM. Go online then to earn 2x!</div>
              </div>
            </div>

            {/* Refer & Earn */}
            <div style={{ background: 'linear-gradient(135deg, #1c0a2e, #2d1254)', border: '1px solid #7c3aed44', borderRadius: 16, padding: 16, marginTop: 12 }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div style={{ color: '#c084fc', fontSize: '0.72rem', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>🎁 REFER & EARN</div>
                  <div style={{ fontWeight: 700 }}>Invite a Friend</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: 2 }}>Earn ₹200 per referral!</div>
                  <div style={{ background: '#1f1035', border: '1px solid #7c3aed', borderRadius: 8, padding: '6px 12px', marginTop: 10, fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, letterSpacing: 2, color: '#c084fc', display: 'inline-block' }}>
                    {driver?.deliveryId?.replace('FE-', 'REF-') || 'REF-XXXXXX'}
                  </div>
                </div>
                <span style={{ fontSize: '2.2rem' }}>🤝</span>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div style={{ display: 'flex', gap: 10, margin: '0 16px 16px' }}>
              {[
                { icon: '⛽', label: 'Find Petrol', href: 'https://maps.google.com/?q=petrol+pump+near+me' },
                { icon: '🆘', label: 'SOS Help', href: 'tel:100' },
                { icon: '🛠️', label: 'Support', href: null, tab: 'support' },
              ].map(a => (
                a.href
                  ? <a key={a.label} href={a.href} target="_blank" rel="noreferrer" style={{ flex: 1, background: '#111', border: '1px solid #1f2937', borderRadius: 12, padding: '10px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none', color: 'white' }}>
                    <span style={{ fontSize: '1.5rem' }}>{a.icon}</span>
                    <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>{a.label}</span>
                  </a>
                  : <button key={a.label} onClick={() => setActiveTab('support')} style={{ flex: 1, background: '#111', border: '1px solid #1f2937', borderRadius: 12, padding: '10px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'white', cursor: 'pointer' }}>
                    <span style={{ fontSize: '1.5rem' }}>{a.icon}</span>
                    <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>{a.label}</span>
                  </button>
              ))}
            </div>
          </div>
        )}

            {/* ── EARNINGS TAB ── */}
            {activeTab === 'earnings' && (
              <div style={{ padding: 16 }}>
                <h6 className="fw-bold mb-3">💰 Earnings Breakdown</h6>
                {[['Today', earnings], ['This Week', earnings * 5], ['This Month', earnings * 18]].map(([label, val]) => (
                  <div key={label} style={{ background: '#111', border: '1px solid #1f2937', borderRadius: 14, padding: '14px 18px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{label}</div>
                      <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1.4rem' }}>₹{val.toLocaleString()}</div>
                    </div>
                    <span style={{ fontSize: '1.8rem' }}>💰</span>
                  </div>
                ))}
                <div style={{ background: '#111', border: '1px solid #1f2937', borderRadius: 14, padding: 16, marginTop: 4 }}>
                  <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginBottom: 10 }}>Pay Formula</p>
                  {[['Base Pay', `${hours}h × ₹50 = ₹${hours * 50}`], ['Delivery Bonus', `${deliveries} × ₹20 = ₹${deliveries * 20}`], ['Total', `₹${earnings}`]].map(([k, v]) => (
                    <div key={k} className="d-flex justify-content-between" style={{ fontSize: '0.85rem', marginBottom: 6, borderBottom: k === 'Total' ? 'none' : '1px solid #1f2937', paddingBottom: 6, fontWeight: k === 'Total' ? 700 : 400, color: k === 'Total' ? '#f59e0b' : 'white' }}>
                      <span>{k}</span><span>{v}</span>
                    </div>
                  ))}
                  {/* UPI Withdrawal Card */}
                  <div style={{ background: 'linear-gradient(135deg, #0c1a0c, #122212)', border: '1px solid #16a34a', borderRadius: 16, padding: 16, marginTop: 16 }}>
                    <div style={{ color: '#4ade80', fontSize: '0.72rem', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>💳 UPI PAYOUT</div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#4ade80' }}>₹{earnings}</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Available to withdraw</div>
                      </div>
                      <button onClick={() => toast.info('💳 UPI transfer initiated! Arrives in 2 hrs.')} style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', border: 'none', color: 'white', borderRadius: 10, padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                        Withdraw Now
                      </button>
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.7rem', marginTop: 10 }}>✅ Instant transfer to linked UPI account</div>
                  </div>

                  {/* Safety Checklist */}
                  <div style={{ background: '#111', border: '1px solid #1f2937', borderRadius: 16, padding: 16, marginTop: 12 }}>
                    <h6 className="fw-bold mb-3">🪖 Pre-Shift Safety Check</h6>
                    {['Helmet on ✅', 'Phone charged ✅', 'Vehicle fueled ✅', 'Delivery bag ready ✅'].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 3 ? '1px solid #1f2937' : 'none' }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>✓</div>
                        <span style={{ fontSize: '0.85rem' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
        )}

                {/* ── ALERTS TAB ── */}
                {activeTab === 'alerts' && (
                  <div style={{ padding: 16 }}>
                    <h6 className="fw-bold mb-3">🔔 Notifications</h6>
                    {notifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '50px 20px', color: '#6b7280' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 10, opacity: 0.3 }}>🔔</div>
                        <p className="small">No notifications yet. Go online to receive alerts!</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={{ background: '#111', border: '1px solid #1f2937', borderRadius: 12, padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem' }}>{n.msg}</span>
                          <span style={{ color: '#6b7280', fontSize: '0.7rem', flexShrink: 0, marginLeft: 8 }}>{n.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ── SUPPORT TAB ── */}
                {activeTab === 'support' && (
                  <div style={{ padding: 16 }}>
                    <h6 className="fw-bold mb-3">🛠️ Help & Support</h6>

                    {/* Emergency */}
                    <a href="tel:100" style={{ display: 'block', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef444444', borderRadius: 14, padding: 14, marginBottom: 12, textDecoration: 'none' }}>
                      <div className="d-flex align-items-center gap-3">
                        <span style={{ fontSize: '1.6rem' }}>🆘</span>
                        <div>
                          <div style={{ color: '#ef4444', fontWeight: 700 }}>Emergency / SOS</div>
                          <div style={{ color: '#9ca3af', fontSize: '0.78rem' }}>Call Police: 100</div>
                        </div>
                      </div>
                    </a>

                    {/* FAQs */}
                    <h6 className="fw-bold mt-3 mb-2" style={{ fontSize: '0.85rem', color: '#9ca3af' }}>FREQUENTLY ASKED</h6>
                    {[
                      { q: 'How is my salary calculated?', a: '₹50 per hour on duty + ₹20 per successful delivery.' },
                      { q: 'When do I get paid?', a: 'Daily payouts are processed at midnight to your UPI ID.' },
                      { q: 'What if a customer cancels?', a: 'If cancelled after pickup, you still earn ₹10 compensation.' },
                      { q: 'How to improve my rating?', a: 'Deliver on time, be polite, keep the bag clean.' },
                    ].map((faq, i) => (
                      <details key={i} style={{ background: '#111', border: '1px solid #1f2937', borderRadius: 12, padding: '12px 14px', marginBottom: 8, cursor: 'pointer' }}>
                        <summary style={{ fontWeight: 600, fontSize: '0.85rem', listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
                          {faq.q} <span style={{ color: '#f59e0b' }}>▾</span>
                        </summary>
                        <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: 8, lineHeight: 1.6 }}>{faq.a}</div>
                      </details>
                    ))}

                    {/* Contact */}
                    <div style={{ background: '#111', border: '1px solid #1f2937', borderRadius: 14, padding: 14, marginTop: 4 }}>
                      <div style={{ fontWeight: 600, marginBottom: 10 }}>📞 Contact Support</div>
                      {[
                        { icon: '📞', label: 'Call Helpline', href: 'tel:18001234567', color: '#38bdf8' },
                        { icon: '📧', label: 'Email Us', href: 'mailto:support@foodexpress.in', color: '#4ade80' },
                      ].map(c => (
                        <a key={c.label} href={c.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: c.label.includes('Call') ? '1px solid #1f2937' : 'none', textDecoration: 'none' }}>
                          <span style={{ fontSize: '1.2rem' }}>{c.icon}</span>
                          <span style={{ color: c.color, fontWeight: 600, fontSize: '0.88rem' }}>{c.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── PROFILE TAB ── */}
                {activeTab === 'profile' && (
                  <div style={{ padding: 16 }}>
                    {/* Profile Card */}
                    <div style={{ background: 'linear-gradient(135deg, #1c1407, #2d1f04)', border: '1px solid #f59e0b33', borderRadius: 20, padding: 24, marginBottom: 16, textAlign: 'center' }}>
                      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '2rem', margin: '0 auto 12px' }}>
                        {driver?.name?.[0]?.toUpperCase()}
                      </div>
                      <h4 className="fw-bold mb-1">{driver?.name}</h4>
                      <div style={{ color: '#f59e0b', fontFamily: 'monospace', letterSpacing: 2, fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>
                        {driver?.deliveryId || 'FE-XXXXXX'}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: '0.82rem' }}>{driver?.vehicleType} • {driver?.city}</div>
                      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px', marginTop: 16, display: 'flex', justifyContent: 'space-around' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b' }}>{deliveries}</div>
                          <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Deliveries</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4ade80' }}>₹{earnings}</div>
                          <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Earned</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8' }}>{hours}h {mins}m</div>
                          <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>On Duty</div>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    {[
                      { icon: '📞', label: 'Phone', value: driver?.phone },
                      { icon: '📧', label: 'Email', value: driver?.email || 'Not provided' },
                      { icon: '🏙️', label: 'City', value: driver?.city },
                      { icon: '🏍️', label: 'Vehicle', value: driver?.vehicleType },
                      { icon: '🪪', label: 'License', value: driver?.licenseNo || 'Not provided' },
                      { icon: '📅', label: 'Member Since', value: driver?.registeredAt ? new Date(driver.registeredAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—' },
                    ].map(item => (
                      <div key={item.label} style={{ background: '#111', border: '1px solid #1f2937', borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                        <div>
                          <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>{item.label}</div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.value}</div>
                        </div>
                      </div>
                    ))}

                    {/* Logout */}
                    <button
                      onClick={() => { localStorage.removeItem('driverToken'); navigate('/delivery/login'); }}
                      style={{ width: '100%', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef444433', color: '#ef4444', borderRadius: 12, padding: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

      {/* ── Bottom Navigation Bar ── */}
            <div style={{
              position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: '100%', maxWidth: '480px',
              background: '#111', borderTop: '1px solid #1f2937',
              display: 'flex', justifyContent: 'space-around', padding: '10px 0 14px', zIndex: 200
            }}>
              {[
                { id: 'home', icon: '🏠', label: 'Home' },
                { id: 'earnings', icon: '💰', label: 'Earn' },
                { id: 'alerts', icon: '🔔', label: 'Alerts' },
                { id: 'support', icon: '🛠️', label: 'Help' },
                { id: 'profile', icon: '👤', label: 'Profile' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 2, color: activeTab === tab.id ? '#f59e0b' : '#6b7280',
                    transition: 'color 0.2s', padding: '0 8px', position: 'relative'
                  }}
                >
                  {tab.id === 'alerts' && notifications.length > 0 && (
                    <span style={{ position: 'absolute', top: 0, right: 4, width: 7, height: 7, borderRadius: '50%', background: '#ef4444', border: '1px solid #0a0a0a' }} />
                  )}
                  <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
                  <span style={{ fontSize: '0.58rem', fontWeight: activeTab === tab.id ? 700 : 400 }}>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
}
