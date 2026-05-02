import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API = 'http://localhost:8000';
const EMPTY = { code:'', discount:'', type:'percent', minOrder:'', expiry:'' };

export default function AdminCoupons({ token }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [deleting,setDeleting]= useState(null);

  const fetchCoupons = async () => {
    try {
      const res  = await fetch(`${API}/api/admin/coupons/`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.status === 'success') setCoupons(data.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleAdd = async () => {
    if (!form.code || !form.discount) { toast.error('Code and discount required'); return; }
    setSaving(true);
    try {
      const res  = await fetch(`${API}/api/admin/coupons/add/`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success('Coupon created!');
        setModal(false); setForm(EMPTY); fetchCoupons();
      } else { toast.error(data.message); }
    } catch { toast.error('Server error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete coupon "${c.code}"?`)) return;
    const cid = c._id?.$oid || '';
    setDeleting(cid);
    try {
      const res  = await fetch(`${API}/api/admin/coupons/delete/`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ _id: cid }),
      });
      const data = await res.json();
      if (data.status === 'success') { toast.success('Coupon deleted'); fetchCoupons(); }
      else toast.error(data.message);
    } catch { toast.error('Server error'); }
    finally { setDeleting(null); }
  };

  const isExpired = (expiry) => expiry && new Date(expiry) < new Date();

  if (loading) return <div className="ap-loading"><div className="ap-spinner"></div></div>;

  return (
    <div>
      {/* Stats + Add Button */}
      <div style={{display:'flex', gap:16, marginBottom:20, alignItems:'center'}}>
        {[
          { label:'Total Coupons', value: coupons.length,                               color:'#9c27b0' },
          { label:'Active',        value: coupons.filter(c=>!isExpired(c.expiry)).length, color:'#4caf50' },
          { label:'Expired',       value: coupons.filter(c=>isExpired(c.expiry)).length,  color:'#9e9e9e' },
        ].map((s,i)=>(
          <div key={i} style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 20px'}}>
            <div style={{fontSize:'1.4rem', fontWeight:800, color:s.color}}>{s.value}</div>
            <div style={{fontSize:'0.72rem', color:'var(--text-muted)'}}>{s.label}</div>
          </div>
        ))}
        <button className="ap-btn ap-btn-primary" style={{marginLeft:'auto'}} onClick={()=>setModal(true)}>
          <i className="fa-solid fa-plus"></i> New Coupon
        </button>
      </div>

      {/* Coupons Grid */}
      {coupons.length===0 ? (
        <div className="ap-empty"><i className="fa-solid fa-ticket"></i><span>No coupons yet</span></div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16}}>
          {coupons.map((c,i)=>{
            const expired = isExpired(c.expiry);
            const cid = c._id?.$oid||'';
            return (
              <div key={i} style={{
                background:'var(--bg-card)', borderRadius:14,
                border:`1px solid ${expired ? 'rgba(158,158,158,0.2)' : 'rgba(156,39,176,0.3)'}`,
                padding:'20px', position:'relative', overflow:'hidden',
                opacity: expired ? 0.6 : 1,
              }}>
                {/* Dashed left strip */}
                <div style={{position:'absolute', left:0, top:0, bottom:0, width:4, background: expired?'#9e9e9e':'linear-gradient(180deg,#9c27b0,#e91e63)'}}></div>
                <div style={{paddingLeft:10}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
                    <span style={{
                      fontSize:'1.2rem', fontWeight:800, letterSpacing:'0.05em',
                      color: expired ? 'var(--text-muted)' : '#ce93d8', fontFamily:'monospace',
                    }}>{c.code}</span>
                    {expired && <span className="ap-badge badge-cancelled" style={{fontSize:'0.65rem'}}>Expired</span>}
                  </div>
                  <div style={{fontSize:'1.5rem', fontWeight:900, color: c.type==='percent'?'#ff9800':'#4caf50', marginBottom:6}}>
                    {c.type==='percent' ? `${c.discount}% OFF` : `₹${c.discount} OFF`}
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:4, fontSize:'0.78rem', color:'var(--text-muted)'}}>
                    {c.minOrder>0 && <span>Min order: ₹{c.minOrder}</span>}
                    {c.expiry && <span>Expires: {new Date(c.expiry).toLocaleDateString()}</span>}
                    <span className={`ap-badge ${c.type==='percent'?'badge-percent':'badge-flat'}`} style={{width:'fit-content',marginTop:4}}>
                      {c.type==='percent' ? 'Percentage' : 'Flat Discount'}
                    </span>
                  </div>
                  <button
                    className="ap-btn ap-btn-sm ap-btn-danger"
                    style={{marginTop:14, width:'100%'}}
                    disabled={deleting===cid}
                    onClick={()=>handleDelete(c)}
                  >
                    {deleting===cid ? 'Deleting…' : <><i className="fa-solid fa-trash"></i> Delete Coupon</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Coupon Modal */}
      {modal && (
        <div className="ap-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setModal(false);}}>
          <div className="ap-modal">
            <div className="ap-modal-title">🎟️ Create New Coupon</div>
            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              <div className="ap-form-row">
                <div className="ap-form-group">
                  <label className="ap-label">Coupon Code *</label>
                  <input className="ap-input" placeholder="SAVE20" value={form.code}
                    onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">Discount Type</label>
                  <select className="ap-select" style={{width:'100%'}} value={form.type}
                    onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
              </div>
              <div className="ap-form-row">
                <div className="ap-form-group">
                  <label className="ap-label">Discount Value *</label>
                  <input className="ap-input" type="number" placeholder={form.type==='percent'?'20':'50'}
                    value={form.discount} onChange={e=>setForm(f=>({...f,discount:e.target.value}))} />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">Min Order (₹)</label>
                  <input className="ap-input" type="number" placeholder="0 = no minimum"
                    value={form.minOrder} onChange={e=>setForm(f=>({...f,minOrder:e.target.value}))} />
                </div>
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Expiry Date (optional)</label>
                <input className="ap-input" type="date" value={form.expiry}
                  onChange={e=>setForm(f=>({...f,expiry:e.target.value}))} />
              </div>
            </div>
            <div className="ap-modal-footer">
              <button className="ap-btn ap-btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
              <button className="ap-btn ap-btn-primary" onClick={handleAdd} disabled={saving}>
                {saving ? 'Creating…' : '🎟️ Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
