import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { API_BASE_URL as API } from '../../config';
const TABS = ['All','Pending','Active','Inactive','Rejected'];
const STATUS_COLORS = { Pending:'#ff9800', Active:'#4caf50', Inactive:'#9e9e9e', Rejected:'#f44336' };

export default function AdminDelivery({ token }) {
  const [riders,  setRiders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('All');
  const [search,  setSearch]  = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchRiders = async () => {
    try {
      const res  = await fetch(`${API}/api/admin/delivery/`, { headers });
      const data = await res.json();
      if (data.status === 'success') setRiders(data.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRiders(); }, []);

  const updateStatus = async (rid, status) => {
    try {
      const res  = await fetch(`${API}/api/admin/delivery/update/`, {
        method:'POST', headers:{ ...headers,'Content-Type':'application/json' },
        body: JSON.stringify({ _id: rid, status }),
      });
      const data = await res.json();
      if (data.status === 'success') { toast.success(`Rider marked as ${status}`); fetchRiders(); }
    } catch { toast.error('Error'); }
  };

  const filtered = riders.filter(r => {
    const matchTab    = tab === 'All' || r.status === tab;
    const matchSearch = !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.phone?.includes(search) || r.city?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  // Stats
  const stats = {
    total:    riders.length,
    pending:  riders.filter(r => r.status === 'Pending').length,
    active:   riders.filter(r => r.status === 'Active').length,
    rejected: riders.filter(r => r.status === 'Rejected').length,
  };

  const vehicleIcon = (v) => ({ Bike:'🏍️', Scooter:'🛵', Cycle:'🚲', Car:'🚗' }[v] || '🛵');

  const timeAgo = (iso) => {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const d = Math.floor(diff/86400000);
    if (d < 1) return 'Today';
    if (d === 1) return 'Yesterday';
    return `${d} days ago`;
  };

  if (loading) return <div className="ap-loading"><div className="ap-spinner"></div></div>;

  return (
    <div>
      {/* Stats */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24}}>
        {[
          {label:'Total Riders', value:stats.total,    icon:'👥', color:'#2196F3'},
          {label:'Pending',      value:stats.pending,  icon:'⏳', color:'#FF9800'},
          {label:'Active',       value:stats.active,   icon:'✅', color:'#4CAF50'},
          {label:'Rejected',     value:stats.rejected, icon:'❌', color:'#F44336'},
        ].map(s => (
          <div key={s.label} className="ap-card" style={{padding:'16px 20px', borderTop:`3px solid ${s.color}`}}>
            <div style={{fontSize:'1.6rem'}}>{s.icon}</div>
            <div style={{fontSize:'1.5rem', fontWeight:700, color:s.color}}>{s.value}</div>
            <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center'}}>
        <div style={{display:'flex', gap:8}}>
          {TABS.map(t => (
            <button key={t} className={`ap-filter-tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
              {t} {t==='Pending' && stats.pending > 0 && <span style={{background:'#ff9800',color:'#fff',borderRadius:10,padding:'1px 6px',fontSize:'0.65rem',marginLeft:4}}>{stats.pending}</span>}
            </button>
          ))}
        </div>
        <input className="ap-input" style={{flex:1, maxWidth:280, marginLeft:'auto'}}
          placeholder="Search name, phone, city…" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      {/* Rider Cards */}
      {filtered.length === 0
        ? <div className="ap-empty"><i className="fa-solid fa-motorcycle"></i><span>No delivery partners found</span></div>
        : <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16}}>
            {filtered.map(r => (
              <div key={r._id} className="ap-card">
                <div className="ap-card-body">
                  {/* Header */}
                  <div style={{display:'flex', gap:14, alignItems:'center', marginBottom:14}}>
                    <div style={{
                      width:52, height:52, borderRadius:'50%', overflow:'hidden',
                      background:'linear-gradient(135deg,#667eea,#764ba2)',
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                    }}>
                      {r.photo
                        ? <img src={r.photo} alt={r.name} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.target.style.display='none'}} />
                        : <span style={{color:'#fff',fontWeight:700,fontSize:'1.2rem'}}>{r.name?.[0]?.toUpperCase()}</span>
                      }
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700, fontSize:'0.95rem'}}>{r.name}</div>
                      <div style={{fontSize:'0.78rem', color:'var(--text-muted)'}}>{vehicleIcon(r.vehicleType)} {r.vehicleType} · 📍 {r.city}</div>
                    </div>
                    <span style={{
                      fontSize:'0.68rem', fontWeight:700, padding:'4px 10px', borderRadius:20,
                      background: STATUS_COLORS[r.status] + '22', color: STATUS_COLORS[r.status],
                    }}>{r.status}</span>
                  </div>

                  {/* Details */}
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:14, fontSize:'0.78rem', color:'var(--text-muted)'}}>
                    <div>📞 {r.phone}</div>
                    {r.licenseNo && <div>🪪 {r.licenseNo}</div>}
                    <div>📅 Applied: {timeAgo(r.registeredAt)}</div>
                    <div>🚚 Deliveries: {r.deliveries || 0}</div>
                    
                    {r.status === 'Active' && (
                      <>
                        <div style={{ color: r.isOnline ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                          {r.isOnline ? '🟢 Online' : '🔴 Offline'}
                        </div>
                        <div>⏱️ Hrs: {Math.floor((r.totalMinutesWorked || 0) / 60)}h {(r.totalMinutesWorked || 0) % 60}m</div>
                        <div style={{ gridColumn: '1 / -1', marginTop: '8px', padding: '6px', background: 'rgba(255, 193, 7, 0.1)', color: '#ffc107', borderRadius: '4px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Est. Salary:</span>
                          <span>₹{(Math.floor((r.totalMinutesWorked || 0) / 60) * 50) + ((r.deliveries || 0) * 20)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{display:'flex', gap:8}}>
                    {r.status !== 'Active' && (
                      <button className="ap-btn ap-btn-sm" style={{flex:1, background:'rgba(76,175,80,0.15)', color:'#4caf50', justifyContent:'center'}}
                        onClick={() => updateStatus(r._id, 'Active')}>
                        ✅ Approve
                      </button>
                    )}
                    {r.status !== 'Rejected' && (
                      <button className="ap-btn ap-btn-sm" style={{flex:1, background:'rgba(244,67,54,0.15)', color:'#f44336', justifyContent:'center'}}
                        onClick={() => updateStatus(r._id, 'Rejected')}>
                        ❌ Reject
                      </button>
                    )}
                    {r.status === 'Active' && (
                      <button className="ap-btn ap-btn-sm" style={{background:'rgba(158,158,158,0.15)', color:'#9e9e9e'}}
                        onClick={() => updateStatus(r._id, 'Inactive')}>
                        ⏸
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  );
}
