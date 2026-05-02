import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API = 'http://localhost:8000';

export default function AdminUsers({ token }) {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [updating,setUpdating]= useState(null);

  const fetchUsers = async () => {
    try {
      const res  = await fetch(`${API}/api/admin/users/`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.status === 'success') setUsers(data.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleBan = async (user, ban) => {
    const uid = user._id?.$oid || '';
    setUpdating(uid);
    try {
      const res  = await fetch(`${API}/api/admin/users/ban/`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: uid, banned: ban }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success(`User ${ban ? 'banned' : 'unbanned'}`);
        setUsers(prev => prev.map(u => (u._id?.$oid===uid ? {...u, banned: ban} : u)));
      } else { toast.error(data.message); }
    } catch { toast.error('Server error'); }
    finally { setUpdating(null); }
  };

  const visible = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="ap-loading"><div className="ap-spinner"></div></div>;

  return (
    <div>
      {/* Stats */}
      <div style={{display:'flex', gap:16, marginBottom:20}}>
        {[
          { label:'Total Users',  value: users.length,                           color:'#2196f3' },
          { label:'Active Users', value: users.filter(u=>!u.banned).length,      color:'#4caf50' },
          { label:'Banned Users', value: users.filter(u=>u.banned).length,       color:'#f44336' },
        ].map((s,i) => (
          <div key={i} style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 20px'}}>
            <div style={{fontSize:'1.4rem', fontWeight:800, color:s.color}}>{s.value}</div>
            <div style={{fontSize:'0.72rem', color:'var(--text-muted)'}}>{s.label}</div>
          </div>
        ))}
        <div style={{marginLeft:'auto', alignSelf:'center'}}>
          <div className="ap-search-wrap" style={{width:240}}>
            <i className="fa-solid fa-search"></i>
            <input className="ap-input" placeholder="Search name or email…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="ap-card">
        <div className="ap-card-header">
          <span className="ap-card-title">👤 Registered Users</span>
          <span style={{fontSize:'0.78rem', color:'var(--text-muted)'}}>{visible.length} results</span>
        </div>
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead><tr>
              {['#','Name','Email','Contact','Orders','Status','Actions'].map(h=>(
                <th key={h}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {visible.length===0 ? (
                <tr><td colSpan="7">
                  <div className="ap-empty"><i className="fa-solid fa-users"></i>No users found</div>
                </td></tr>
              ) : visible.map((u, i) => {
                const uid = u._id?.$oid||'';
                return (
                  <tr key={i}>
                    <td style={{color:'var(--text-muted)', fontSize:'0.78rem'}}>{i+1}</td>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:10}}>
                        <div style={{
                          width:34, height:34, borderRadius:'50%',
                          background:`hsl(${(u.name||'').charCodeAt(0)*5},60%,40%)`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontWeight:700, fontSize:'0.88rem', flexShrink:0,
                        }}>
                          {(u.name||'?')[0].toUpperCase()}
                        </div>
                        <span style={{fontWeight:600}}>{u.name||'—'}</span>
                      </div>
                    </td>
                    <td style={{fontSize:'0.83rem', color:'rgba(255,255,255,0.7)'}}>{u.email||'—'}</td>
                    <td style={{fontSize:'0.83rem', color:'var(--text-muted)'}}>{u.contact||'—'}</td>
                    <td>
                      <span style={{fontWeight:700, color:'var(--accent2)'}}>{u.orderCount||0}</span>
                    </td>
                    <td>
                      <span className={`ap-badge ${u.banned?'badge-banned':'badge-active'}`}>
                        {u.banned ? '🚫 Banned' : '✅ Active'}
                      </span>
                    </td>
                    <td>
                      {u.banned ? (
                        <button
                          className="ap-btn ap-btn-sm ap-btn-success"
                          disabled={updating===uid}
                          onClick={() => handleBan(u, false)}
                        >
                          {updating===uid ? '…' : '✅ Unban'}
                        </button>
                      ) : (
                        <button
                          className="ap-btn ap-btn-sm ap-btn-danger"
                          disabled={updating===uid}
                          onClick={() => handleBan(u, true)}
                        >
                          {updating===uid ? '…' : '🚫 Ban'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
