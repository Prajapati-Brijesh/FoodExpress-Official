import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API = 'http://localhost:8000';
const CATEGORIES = ['Breakfasts','Lunch Blast','Chinese','Fast Food','Pizza','Drinks','Desserts','Other'];

const EMPTY_FORM = { name:'', price:'', category:'Breakfasts', img:'', available:true };

export default function AdminMenu({ token }) {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [catFilter,setCatFilter]= useState('All');
  const [modal,    setModal]    = useState(null); // null | 'add' | 'edit'
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);

  const fetchMenu = async () => {
    try {
      const res  = await fetch(`${API}/api/admin/menu/`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.status === 'success') setItems(data.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMenu(); }, []);

  const openAdd  = () => { setForm(EMPTY_FORM); setModal('add'); };
  const openEdit = (item) => {
    setForm({ name: item.name, price: item.price, category: item.category, img: item.img||'', available: item.available!==false, _id: item._id?.$oid||'' });
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) { toast.error('Name, price, category required'); return; }
    setSaving(true);
    try {
      const endpoint = modal === 'add' ? '/api/admin/menu/add/' : '/api/admin/menu/update/';
      const res  = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success(modal === 'add' ? 'Item added!' : 'Item updated!');
        setModal(null);
        fetchMenu();
      } else { toast.error(data.message); }
    } catch { toast.error('Server error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      const res  = await fetch(`${API}/api/admin/menu/delete/`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ _id: item._id?.$oid || '' }),
      });
      const data = await res.json();
      if (data.status === 'success') { toast.success('Item deleted'); fetchMenu(); }
      else toast.error(data.message);
    } catch { toast.error('Server error'); }
  };

  const visible = items
    .filter(i => catFilter === 'All' || i.category === catFilter)
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  const allCats = ['All', ...new Set(items.map(i => i.category))];

  if (loading) return <div className="ap-loading"><div className="ap-spinner"></div></div>;

  return (
    <div>
      {/* Controls */}
      <div style={{display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center'}}>
        <div className="ap-filter-tabs" style={{flexWrap:'wrap'}}>
          {allCats.map(c => (
            <button key={c} className={`ap-filter-tab ${catFilter===c?'active':''}`} onClick={()=>setCatFilter(c)}>
              {c} {c!=='All' && <span style={{opacity:0.5, fontSize:'0.7rem'}}>({items.filter(i=>i.category===c).length})</span>}
            </button>
          ))}
        </div>
        <div style={{marginLeft:'auto', display:'flex', gap:10}}>
          <div className="ap-search-wrap" style={{width:200}}>
            <i className="fa-solid fa-search"></i>
            <input className="ap-input" placeholder="Search item…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <button className="ap-btn ap-btn-primary" onClick={openAdd}>
            <i className="fa-solid fa-plus"></i> Add Item
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{display:'flex', gap:16, marginBottom:20}}>
        {[
          { label:'Total Items', value: items.length, color:'#ff5722' },
          { label:'Categories',  value: new Set(items.map(i=>i.category)).size, color:'#2196f3' },
          { label:'Available',   value: items.filter(i=>i.available!==false).length, color:'#4caf50' },
          { label:'Unavailable', value: items.filter(i=>i.available===false).length, color:'#9e9e9e' },
        ].map((s,i) => (
          <div key={i} style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 18px', display:'flex', flexDirection:'column', gap:4}}>
            <span style={{fontSize:'1.2rem', fontWeight:800, color:s.color}}>{s.value}</span>
            <span style={{fontSize:'0.72rem', color:'var(--text-muted)'}}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Menu Grid */}
      {visible.length === 0 ? (
        <div className="ap-empty"><i className="fa-solid fa-utensils"></i><span>No items found</span></div>
      ) : (
        <div className="ap-menu-grid">
          {visible.map((item, i) => (
            <div key={i} className="ap-menu-card">
              <img
                src={item.img || 'https://via.placeholder.com/200x130?text=No+Image'}
                alt={item.name}
                onError={e => { e.target.src='https://via.placeholder.com/200x130?text=No+Image'; }}
              />
              <div className="ap-menu-card-body">
                <div className="ap-menu-card-name">{item.name}</div>
                <div className="ap-menu-card-cat">
                  <span className="ap-badge badge-percent" style={{fontSize:'0.65rem', padding:'2px 7px'}}>{item.category}</span>
                  {item.available===false && <span className="ap-badge badge-banned" style={{fontSize:'0.65rem', padding:'2px 7px', marginLeft:4}}>Off</span>}
                </div>
                <div className="ap-menu-card-price">₹{item.price}</div>
                <div className="ap-menu-card-actions">
                  <button className="ap-btn ap-btn-sm ap-btn-ghost" style={{flex:1}} onClick={()=>openEdit(item)}>
                    <i className="fa-solid fa-pen"></i> Edit
                  </button>
                  <button className="ap-btn ap-btn-sm ap-btn-danger" onClick={()=>handleDelete(item)}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="ap-modal-overlay" onClick={e => { if(e.target===e.currentTarget) setModal(null); }}>
          <div className="ap-modal">
            <div className="ap-modal-title">
              <span>{modal==='add'?'➕':'✏️'}</span>
              {modal==='add' ? 'Add Menu Item' : 'Edit Menu Item'}
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              <div className="ap-form-group">
                <label className="ap-label">Item Name *</label>
                <input className="ap-input" placeholder="e.g. Paneer Tikka" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
              </div>
              <div className="ap-form-row">
                <div className="ap-form-group">
                  <label className="ap-label">Price (₹) *</label>
                  <input className="ap-input" type="number" placeholder="120" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} />
                </div>
                <div className="ap-form-group">
                  <label className="ap-label">Category *</label>
                  <select className="ap-select" style={{width:'100%'}} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Image URL</label>
                <input className="ap-input" placeholder="https://..." value={form.img} onChange={e=>setForm(f=>({...f,img:e.target.value}))} />
              </div>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <label className="ap-toggle">
                  <input type="checkbox" checked={form.available} onChange={e=>setForm(f=>({...f,available:e.target.checked}))} />
                  <span className="ap-toggle-slider"></span>
                </label>
                <span style={{fontSize:'0.88rem'}}>Available for order</span>
              </div>
            </div>
            <div className="ap-modal-footer">
              <button className="ap-btn ap-btn-ghost" onClick={()=>setModal(null)}>Cancel</button>
              <button className="ap-btn ap-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : (modal==='add'?'Add Item':'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
