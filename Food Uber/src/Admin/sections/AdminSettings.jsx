import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { API_BASE_URL as API } from '../../config';

const DEFAULT_SETTINGS = {
  platformFee: 5,
  deliveryCharge: 30,
  commission: 10,
  maintenanceMode: false,
  minOrderAmount: 100,
  freeDeliveryAbove: 500,
};

export default function AdminSettings({ token }) {
  const [cfg,     setCfg]     = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  const fetchSettings = async () => {
    try {
      const res  = await fetch(`${API}/api/admin/settings/`, { headers: { Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.status === 'success') setCfg({ ...DEFAULT_SETTINGS, ...data.data });
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res  = await fetch(`${API}/api/admin/settings/save/`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify(cfg),
      });
      const data = await res.json();
      if (data.status === 'success') toast.success('Settings saved successfully!');
      else toast.error(data.message);
    } catch { toast.error('Server error'); }
    finally { setSaving(false); }
  };

  const set = (key, val) => setCfg(prev => ({ ...prev, [key]: val }));

  if (loading) return <div className="ap-loading"><div className="ap-spinner"></div></div>;

  return (
    <div style={{ maxWidth: 680 }}>

      {/* Maintenance Mode Warning */}
      {cfg.maintenanceMode && (
        <div style={{
          background:'rgba(255,87,34,0.12)', border:'1px solid rgba(255,87,34,0.4)',
          borderRadius:12, padding:'14px 18px', marginBottom:20,
          display:'flex', alignItems:'center', gap:12, fontSize:'0.88rem',
        }}>
          <span style={{fontSize:'1.4rem'}}>⚠️</span>
          <div>
            <strong style={{color:'var(--accent2)'}}>Maintenance Mode is ON</strong>
            <div style={{color:'var(--text-muted)', fontSize:'0.8rem', marginTop:2}}>
              The app is currently showing a maintenance page to all customers.
            </div>
          </div>
        </div>
      )}

      {/* Pricing Settings */}
      <div className="ap-card" style={{marginBottom:20}}>
        <div className="ap-card-header">
          <span className="ap-card-title">💰 Pricing & Charges</span>
        </div>
        <div className="ap-card-body">
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18}}>
            {[
              { key:'deliveryCharge',   label:'Delivery Charge (₹)',    desc:'Charged per order',           icon:'🛵' },
              { key:'platformFee',      label:'Platform Fee (%)',        desc:'Added to order total',        icon:'🏷️' },
              { key:'commission',       label:'Restaurant Commission (%)', desc:'Taken from restaurant payout', icon:'📊' },
              { key:'minOrderAmount',   label:'Min Order Amount (₹)',   desc:'Orders below this are blocked', icon:'🛒' },
              { key:'freeDeliveryAbove',label:'Free Delivery Above (₹)',desc:'0 = disabled',               icon:'🎁' },
            ].map(({ key, label, desc, icon }) => (
              <div key={key} className="ap-form-group">
                <label className="ap-label">
                  {icon} {label}
                </label>
                <input
                  className="ap-input"
                  type="number"
                  min="0"
                  value={cfg[key]}
                  onChange={e => set(key, parseFloat(e.target.value)||0)}
                />
                <span style={{fontSize:'0.7rem', color:'var(--text-muted)', marginTop:3}}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toggle Settings */}
      <div className="ap-card" style={{marginBottom:20}}>
        <div className="ap-card-header">
          <span className="ap-card-title">⚙️ App Controls</span>
        </div>
        <div className="ap-card-body" style={{padding:'8px 22px'}}>
          {[
            {
              key: 'maintenanceMode',
              label: 'Maintenance Mode',
              desc: 'Puts the app in maintenance — customers see an "under maintenance" page.',
              danger: true,
            },
          ].map(({ key, label, desc, danger }) => (
            <div key={key} className="ap-toggle-row">
              <div>
                <div className="ap-toggle-label" style={danger && cfg[key] ? {color:'#f44336'} : {}}>
                  {label}
                </div>
                <div className="ap-toggle-desc">{desc}</div>
              </div>
              <label className="ap-toggle">
                <input
                  type="checkbox"
                  checked={!!cfg[key]}
                  onChange={e => set(key, e.target.checked)}
                />
                <span className="ap-toggle-slider" style={danger && cfg[key] ? {background:'#f44336'} : {}}></span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Credentials Info */}
      <div className="ap-card" style={{marginBottom:20}}>
        <div className="ap-card-header">
          <span className="ap-card-title">🔐 Admin Credentials</span>
          <span style={{fontSize:'0.72rem', color:'var(--text-muted)'}}>Stored in backend code</span>
        </div>
        <div className="ap-card-body">
          <div style={{display:'flex', gap:20}}>
            <div style={{flex:1}}>
              <div className="ap-label">Username</div>
              <div style={{
                background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)',
                borderRadius:8, padding:'10px 14px', fontFamily:'monospace', letterSpacing:'0.05em',
              }}>admin</div>
            </div>
            <div style={{flex:1}}>
              <div className="ap-label">Password</div>
              <div style={{
                background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)',
                borderRadius:8, padding:'10px 14px', fontFamily:'monospace',
              }}>food123</div>
            </div>
          </div>
          <div style={{marginTop:12, fontSize:'0.75rem', color:'var(--text-muted)', background:'rgba(255,152,0,0.08)', border:'1px solid rgba(255,152,0,0.2)', borderRadius:8, padding:'10px 14px'}}>
            ⚠️ Change these in <code style={{color:'var(--accent2)'}}>api/views.py → admin_login()</code> before going to production.
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        className="ap-btn ap-btn-primary"
        onClick={handleSave}
        disabled={saving}
        style={{width:'100%', justifyContent:'center', padding:'14px', fontSize:'0.95rem'}}
      >
        {saving
          ? <><div style={{width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.8s linear infinite',marginRight:8}}></div>Saving…</>
          : <><i className="fa-solid fa-floppy-disk"></i> Save All Settings</>
        }
      </button>
    </div>
  );
}
