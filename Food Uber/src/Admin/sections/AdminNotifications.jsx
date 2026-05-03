import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { API_BASE_URL as API } from '../../config';

export default function AdminNotifications({ token }) {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ title:'', message:'', target:'all' });
  const [sending, setSending] = useState(false);

  const fetchNotifs = async () => {
    try {
      const res  = await fetch(`${API}/api/admin/notifications/`, { headers: { Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.status === 'success') setNotifs(data.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const handleSend = async () => {
    if (!form.title || !form.message) { toast.error('Title and message required'); return; }
    setSending(true);
    try {
      const res  = await fetch(`${API}/api/admin/notifications/send/`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success('Notification sent!');
        setForm({ title:'', message:'', target:'all' });
        fetchNotifs();
      } else { toast.error(data.message); }
    } catch { toast.error('Server error'); }
    finally { setSending(false); }
  };

  const targetIcon  = (t) => ({ all:'🌐', users:'👤', vendors:'🏪' }[t] || '🌐');
  const targetLabel = (t) => ({ all:'All Users', users:'Customers', vendors:'Vendors' }[t] || t);

  const timeAgo = (iso) => {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff/60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m/60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  };

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1.3fr', gap:24, alignItems:'start'}}>

      {/* Send Notification Panel */}
      <div className="ap-card" style={{position:'sticky', top:0}}>
        <div className="ap-card-header">
          <span className="ap-card-title">📣 Send Notification</span>
        </div>
        <div className="ap-card-body">
          <div style={{display:'flex', flexDirection:'column', gap:14}}>

            <div className="ap-form-group">
              <label className="ap-label">Target Audience</label>
              <div style={{display:'flex', gap:8}}>
                {[['all','🌐 All'],['users','👤 Customers'],['vendors','🏪 Vendors']].map(([val,label])=>(
                  <button
                    key={val}
                    className={`ap-filter-tab ${form.target===val?'active':''}`}
                    style={{flex:1, padding:'8px 4px'}}
                    onClick={()=>setForm(f=>({...f,target:val}))}
                  >{label}</button>
                ))}
              </div>
            </div>

            <div className="ap-form-group">
              <label className="ap-label">Notification Title *</label>
              <input className="ap-input" placeholder="e.g. Weekend Special Offer!" value={form.title}
                onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
            </div>

            <div className="ap-form-group">
              <label className="ap-label">Message *</label>
              <textarea
                className="ap-input" rows={4}
                placeholder="Write your notification message here…"
                value={form.message}
                onChange={e=>setForm(f=>({...f,message:e.target.value}))}
                style={{resize:'vertical', minHeight:100}}
              />
            </div>

            {/* Preview */}
            {(form.title || form.message) && (
              <div style={{
                background:'rgba(33,150,243,0.08)', border:'1px solid rgba(33,150,243,0.2)',
                borderRadius:12, padding:14,
              }}>
                <div style={{fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:8, fontWeight:600}}>
                  PREVIEW
                </div>
                <div style={{display:'flex', gap:10, alignItems:'flex-start'}}>
                  <span style={{fontSize:'1.4rem'}}>🔔</span>
                  <div>
                    <div style={{fontWeight:700, fontSize:'0.88rem'}}>{form.title||'Title'}</div>
                    <div style={{fontSize:'0.8rem', color:'var(--text-muted)', marginTop:3}}>{form.message||'Message'}</div>
                    <div style={{fontSize:'0.7rem', color:'var(--text-muted)', marginTop:4}}>
                      → {targetLabel(form.target)} · Now
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button className="ap-btn ap-btn-primary" onClick={handleSend} disabled={sending} style={{width:'100%', justifyContent:'center', padding:'12px'}}>
              {sending ? 'Sending…' : <><i className="fa-solid fa-paper-plane"></i> Send Notification</>}
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="ap-card">
        <div className="ap-card-header">
          <span className="ap-card-title">🕐 Notification History</span>
          <span style={{fontSize:'0.78rem', color:'var(--text-muted)'}}>{notifs.length} sent</span>
        </div>
        <div className="ap-card-body" style={{padding:'8px 20px'}}>
          {loading ? (
            <div className="ap-loading"><div className="ap-spinner"></div></div>
          ) : notifs.length===0 ? (
            <div className="ap-empty"><i className="fa-solid fa-bell-slash"></i><span>No notifications sent yet</span></div>
          ) : notifs.map((n,i)=>(
            <div key={i} className="ap-notif-item">
              <div className="ap-notif-icon">🔔</div>
              <div style={{flex:1}}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <div className="ap-notif-title">{n.title}</div>
                  <span style={{fontSize:'0.68rem', background:'rgba(33,150,243,0.15)', color:'#90caf9', padding:'2px 6px', borderRadius:10}}>
                    {targetIcon(n.target)} {targetLabel(n.target)}
                  </span>
                </div>
                <div className="ap-notif-msg">{n.message}</div>
                <div className="ap-notif-time">{timeAgo(n.sentAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
