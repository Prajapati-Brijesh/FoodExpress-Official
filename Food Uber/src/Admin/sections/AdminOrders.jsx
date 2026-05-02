import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const API = 'http://localhost:8000';
const STATUS_FLOW = {
  'New':       { next: 'Preparing', label: 'Accept',       color: '#4caf50' },
  'Preparing': { next: 'Ready',     label: 'Mark Ready',   color: '#ff9800' },
  'Ready':     { next: 'Delivered', label: 'Handed Over',  color: '#2196f3' },
};
const ALL_STATUSES = ['All', 'New', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

export default function AdminOrders({ token }) {
  const [orders,   setOrders]   = useState([]);
  const [filter,   setFilter]   = useState('All');
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/api/get-orders/`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.status === 'success') {
        setOrders(data.data.map(o => ({
          id:       o._id?.$oid || '',
          shortId:  (o._id?.$oid || '').slice(-8).toUpperCase(),
          customer: o.customer?.name  || 'Unknown',
          phone:    o.customer?.phone || '—',
          address:  o.customer?.address || '—',
          payment:  o.customer?.paymentMethod || 'cod',
          items:    (o.items || []).map(i => `${i.qty||1}x ${i.name}`).join(', '),
          total:    o.totalAmount || 0,
          status:   o.status     || 'New',
          time:     o.date ? new Date(o.date).toLocaleString() : '—',
        })));
      }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    fetchOrders();
    const iv = setInterval(fetchOrders, 10000);
    return () => clearInterval(iv);
  }, [fetchOrders]);

  const handleStatus = async (order, newStatus) => {
    setUpdating(order.id);
    try {
      const res  = await fetch(`${API}/api/update-order-status/`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ orderId: order.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success(`Order #${order.shortId} → ${newStatus}`);
        setOrders(prev => prev.map(o => o.id===order.id ? {...o, status: newStatus} : o));
      } else { toast.error(data.message); }
    } catch { toast.error('Server error'); }
    finally { setUpdating(null); }
  };

  const handleCancel = (order) => {
    if (window.confirm(`Cancel order #${order.shortId}?`)) handleStatus(order, 'Cancelled');
  };

  const statusBadge = (s) => {
    const map = { New:'badge-new', Preparing:'badge-preparing', Ready:'badge-ready', Delivered:'badge-delivered', Cancelled:'badge-cancelled' };
    const icons = { New:'🆕', Preparing:'🔥', Ready:'✅', Delivered:'📦', Cancelled:'❌' };
    return <span className={`ap-badge ${map[s]||''}`}>{icons[s]} {s}</span>;
  };

  const visible = orders
    .filter(o => filter === 'All' || o.status === filter)
    .filter(o => !search || o.customer.toLowerCase().includes(search.toLowerCase()) || o.shortId.includes(search.toUpperCase()));

  return (
    <div>
      {/* Controls */}
      <div style={{display:'flex', gap:14, alignItems:'center', marginBottom:20, flexWrap:'wrap'}}>
        <div className="ap-filter-tabs">
          {ALL_STATUSES.map(s => (
            <button key={s} className={`ap-filter-tab ${filter===s?'active':''}`} onClick={() => setFilter(s)}>
              {s} {s!=='All' && <span style={{opacity:0.6,fontSize:'0.7rem'}}>({orders.filter(o=>o.status===s).length})</span>}
            </button>
          ))}
        </div>
        <div className="ap-search-wrap" style={{marginLeft:'auto', width:220}}>
          <i className="fa-solid fa-search"></i>
          <input className="ap-input" placeholder="Search customer…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <button className="ap-btn ap-btn-ghost" onClick={fetchOrders}>
          <i className="fa-solid fa-rotate-right"></i> Refresh
        </button>
      </div>

      <div className="ap-card">
        <div className="ap-card-header">
          <span className="ap-card-title">⚡ Live Orders Stream</span>
          <span style={{fontSize:'0.78rem', color:'var(--accent)', fontWeight:600}}>
            {orders.filter(o=>o.status==='New').length} new · Auto-refresh 10s
            {loading && <span style={{marginLeft:8}}>🔄</span>}
          </span>
        </div>
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead><tr>
              {['Order ID','Customer','Items','Total','Payment','Status','Actions'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan="7">
                  <div className="ap-empty"><i className="fa-solid fa-inbox"></i>No orders found</div>
                </td></tr>
              ) : visible.map((order, i) => (
                <tr key={i}>
                  <td>
                    <span style={{fontWeight:700, color:'var(--accent2)', fontFamily:'monospace'}}>#{order.shortId}</span>
                    <div style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>{order.time}</div>
                  </td>
                  <td>
                    <div style={{fontWeight:600}}>{order.customer}</div>
                    <div style={{fontSize:'0.72rem', color:'var(--text-muted)'}}>{order.phone}</div>
                  </td>
                  <td style={{fontSize:'0.82rem', color:'rgba(255,255,255,0.7)', maxWidth:180}}>{order.items}</td>
                  <td style={{fontWeight:700, color:'var(--green)'}}>₹{order.total}</td>
                  <td>
                    <span className={`ap-badge ${order.payment==='card'?'badge-delivered':'badge-cancelled'}`}>
                      {order.payment==='card'?'💳 Card':'💵 COD'}
                    </span>
                  </td>
                  <td>{statusBadge(order.status)}</td>
                  <td>
                    <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                      {STATUS_FLOW[order.status] && (
                        <button
                          className="ap-btn ap-btn-sm ap-btn-success"
                          disabled={updating===order.id}
                          onClick={() => handleStatus(order, STATUS_FLOW[order.status].next)}
                        >
                          {updating===order.id ? '…' : STATUS_FLOW[order.status].label}
                        </button>
                      )}
                      {!['Delivered','Cancelled'].includes(order.status) && (
                        <button className="ap-btn ap-btn-sm ap-btn-danger" disabled={updating===order.id} onClick={()=>handleCancel(order)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
