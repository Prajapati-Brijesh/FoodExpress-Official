import React, { useState, useEffect } from 'react';

const API = 'http://localhost:8000';

// ── Smooth SVG Line Chart ──
const LineChart = ({ data = [] }) => {
  const width = 400, height = 100, pad = 10;
  if (data.length < 2) return null;
  const maxV = Math.max(...data.map(d => d.revenue), 1);
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((d.revenue / maxV) * (height - pad * 2));
    return [x, y];
  });
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const areaD = `${pathD} L${pts[pts.length - 1][0]},${height - pad} L${pts[0][0]},${height - pad} Z`;

  return (
    <div style={{ position: 'relative', padding: '8px 0' }}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#lineGrad)" />
        <path d={pathD} fill="none" stroke="#ff6b35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={4} fill="#ff6b35" />
            <text x={x} y={height - 1} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle">
              {data[i].day?.slice(5)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// ── Donut chart ──
const DonutChart = ({ cod = 0, online = 0 }) => {
  const total = cod + online || 1;
  const codPct = (cod / total) * 100;
  const radius = 36, circ = 2 * Math.PI * radius;
  const codDash = (codPct / 100) * circ;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        <circle cx="45" cy="45" r={radius} fill="none" stroke="#ff6b35" strokeWidth="12"
          strokeDasharray={`${codDash} ${circ}`} strokeDashoffset={circ / 4} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
        <circle cx="45" cy="45" r={radius} fill="none" stroke="#3b82f6" strokeWidth="12"
          strokeDasharray={`${circ - codDash} ${circ}`}
          strokeDashoffset={-(codDash - circ / 4)}
          strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x="45" y="49" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="800">{Math.round(codPct)}%</text>
      </svg>
      <div style={{ fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff6b35', display: 'inline-block' }} />
          <span style={{ color: '#ccc' }}>Cash ({cod})</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
          <span style={{ color: '#ccc' }}>Online ({online})</span>
        </div>
      </div>
    </div>
  );
};

export default function AdminOverview({ token }) {
  const [stats, setStats]   = useState(null);
  const [daily, setDaily]   = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res  = await fetch(`${API}/api/admin/stats/`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.status === 'success') {
        setStats(data.stats);
        setDaily(data.dailyRevenue || []);
        setRecent(data.recentOrders || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); const iv = setInterval(fetchStats, 30000); return () => clearInterval(iv); }, []);

  // Compute derived metrics
  const totalRevenue = daily.reduce((s, d) => s + d.revenue, 0);
  const totalOrdersWeek = daily.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue = totalOrdersWeek > 0 ? Math.round(totalRevenue / totalOrdersWeek) : 0;
  const codCount    = recent.filter(o => o.customer?.paymentMethod === 'cod').length;
  const onlineCount = recent.filter(o => o.customer?.paymentMethod !== 'cod').length;

  // Top selling items derived from recent orders
  const itemCounts = {};
  recent.forEach(o => (o.items || []).forEach(i => { itemCounts[i.name] = (itemCounts[i.name] || 0) + (i.qty || 1); }));
  const topItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCount = topItems[0]?.[1] || 1;

  const statCards = stats ? [
    { label: "Today's Revenue",  value: `₹${stats.todayRevenue}`,  icon: '💰', color: '#4caf50' },
    { label: "Today's Orders",   value: stats.todayOrders,         icon: '📦', color: '#ff5722' },
    { label: 'Active Orders',    value: stats.activeOrders,        icon: '🔥', color: '#ff9800' },
    { label: 'Total Orders',     value: stats.totalOrders,         icon: '🗂️', color: '#2196f3' },
    { label: 'Registered Users', value: stats.totalUsers,          icon: '👤', color: '#9c27b0' },
    { label: 'Avg. Order Value', value: `₹${avgOrderValue}`,       icon: '📊', color: '#e91e63' },
  ] : [];

  const statusBadge = (s) => {
    const map = { New:'badge-new', Preparing:'badge-preparing', Ready:'badge-ready', Delivered:'badge-delivered', Cancelled:'badge-cancelled' };
    return <span className={`ap-badge ${map[s]||'badge-new'}`}>{s}</span>;
  };

  if (loading) return (
    <div className="ap-loading">
      <div className="ap-spinner"></div>
      <span style={{color:'var(--text-muted)'}}>Loading stats...</span>
    </div>
  );

  return (
    <div>
      {/* Stat Cards */}
      <div className="ap-stats-grid">
        {statCards.map((c, i) => (
          <div key={i} className="ap-stat-card" style={{'--card-accent': c.color}}>
            <div className="ap-stat-icon">{c.icon}</div>
            <div className="ap-stat-value" style={{color: c.color}}>{c.value}</div>
            <div className="ap-stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:20}}>

        {/* Revenue Line Chart */}
        <div className="ap-card">
          <div className="ap-card-header">
            <span className="ap-card-title">📈 Revenue Trend (7 Days)</span>
            <span style={{fontSize:'0.78rem', color:'var(--text-muted)'}}>₹{totalRevenue.toLocaleString()} total</span>
          </div>
          <div className="ap-card-body">
            {daily.length > 1 ? <LineChart data={daily} /> : (
              <div style={{textAlign:'center',padding:'30px',color:'var(--text-muted)',fontSize:'0.85rem'}}>No data yet</div>
            )}
          </div>
        </div>

        {/* Payment Breakdown Donut */}
        <div className="ap-card">
          <div className="ap-card-header">
            <span className="ap-card-title">💳 Payment Breakdown</span>
          </div>
          <div className="ap-card-body" style={{display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}>
            <DonutChart cod={codCount} online={onlineCount} />
          </div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>

        {/* Top Selling Items */}
        <div className="ap-card">
          <div className="ap-card-header">
            <span className="ap-card-title">🏆 Top Selling Items</span>
            <span style={{fontSize:'0.78rem', color:'var(--text-muted)'}}>This week</span>
          </div>
          <div className="ap-card-body" style={{padding:'12px 16px'}}>
            {topItems.length === 0 ? (
              <div style={{textAlign:'center',padding:'20px',color:'var(--text-muted)',fontSize:'0.85rem'}}>No data yet</div>
            ) : topItems.map(([name, count], i) => (
              <div key={name} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:'0.82rem',fontWeight:600,color:'#ddd'}}>{i + 1}. {name}</span>
                  <span style={{fontSize:'0.78rem',color:'#ff6b35',fontWeight:700}}>{count}x</span>
                </div>
                <div style={{background:'rgba(255,255,255,0.06)',borderRadius:50,height:5,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${(count/maxCount)*100}%`,background:'linear-gradient(90deg,#ff6b35,#ff9f1c)',borderRadius:50,transition:'width 1s ease'}} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="ap-card">
          <div className="ap-card-header">
            <span className="ap-card-title">⚡ Recent Orders</span>
            <span style={{fontSize:'0.78rem', color:'var(--text-muted)'}}>Last 5</span>
          </div>
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead><tr>
                <th>Customer</th><th>Amount</th><th>Status</th>
              </tr></thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr><td colSpan="3" style={{textAlign:'center', color:'var(--text-muted)', padding:'30px'}}>No orders yet</td></tr>
                ) : recent.map((o, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{fontWeight:600, fontSize:'0.85rem'}}>{o.customer?.name || '—'}</div>
                      <div style={{fontSize:'0.72rem', color:'var(--text-muted)'}}>{o.customer?.phone}</div>
                    </td>
                    <td style={{fontWeight:700, color:'var(--green)'}}>₹{o.totalAmount}</td>
                    <td>{statusBadge(o.status || 'New')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
