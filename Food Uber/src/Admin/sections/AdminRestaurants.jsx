import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ImageUpload from '../../components/ImageUpload';

const API = 'http://localhost:8000';
const CUISINES = ['North Indian','South Indian','Chinese','Fast Food','Pizza','Continental','Mughlai','Street Food','Multi-cuisine'];

const EMPTY_R = { name:'', address:'', phone:'', logo:'', banner:'', cuisine:'Multi-cuisine', rating:4.0, deliveryTime:30, minOrder:100, timing:'9 AM - 10 PM' };
const EMPTY_ITEM = { name:'', price:'', img:'', category:'Main Course' };

export default function AdminRestaurants({ token }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editData,    setEditData]    = useState(null);
  const [form,        setForm]        = useState(EMPTY_R);
  const [saving,      setSaving]      = useState(false);
  const [selected,    setSelected]    = useState(null);
  const [itemForm,    setItemForm]    = useState(EMPTY_ITEM);
  const [addingItem,  setAddingItem]  = useState(false);
  const [tab,         setTab]         = useState('active');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchRestaurants = async () => {
    try {
      const res  = await fetch(`${API}/api/admin/restaurants/`, { headers });
      const data = await res.json();
      if (data.status === 'success') setRestaurants(data.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRestaurants(); }, []);

  const openAdd  = () => { setEditData(null); setForm(EMPTY_R); setShowModal(true); };
  const openEdit = (r) => { setEditData(r); setForm({ ...r }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.address) { toast.error('Name and address required'); return; }
    setSaving(true);
    const url  = editData ? `${API}/api/admin/restaurants/update/` : `${API}/api/admin/restaurants/add/`;
    const body = editData ? { ...form, _id: editData._id } : form;
    try {
      const res  = await fetch(url, { method:'POST', headers:{ ...headers,'Content-Type':'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.status === 'success') { toast.success(editData ? 'Restaurant updated!' : 'Restaurant added!'); setShowModal(false); fetchRestaurants(); }
      else toast.error(data.message);
    } catch { toast.error('Server error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (rid) => {
    if (!window.confirm('Delete this restaurant?')) return;
    try {
      await fetch(`${API}/api/admin/restaurants/delete/`, { method:'POST', headers:{ ...headers,'Content-Type':'application/json' }, body: JSON.stringify({ _id: rid }) });
      toast.success('Deleted!'); fetchRestaurants();
      if (selected?._id === rid) setSelected(null);
    } catch { toast.error('Error'); }
  };

  const handleToggle = async (r) => {
    try {
      await fetch(`${API}/api/admin/restaurants/update/`, { method:'POST', headers:{ ...headers,'Content-Type':'application/json' }, body: JSON.stringify({ _id: r._id, isActive: !r.isActive }) });
      fetchRestaurants();
    } catch { toast.error('Error'); }
  };

  const handleApprove = async (r) => {
    try {
      await fetch(`${API}/api/admin/restaurants/update/`, {
        method:'POST', headers:{ ...headers,'Content-Type':'application/json' },
        body: JSON.stringify({ _id: r._id, status:'Approved', isActive:true }),
      });
      toast.success(`${r.name} approved and activated!`); fetchRestaurants();
    } catch { toast.error('Error'); }
  };

  const handleRejectPartner = async (rid) => {
    try {
      await fetch(`${API}/api/admin/restaurants/update/`, {
        method:'POST', headers:{ ...headers,'Content-Type':'application/json' },
        body: JSON.stringify({ _id: rid, status:'Rejected', isActive:false }),
      });
      toast.success('Application rejected'); fetchRestaurants();
    } catch { toast.error('Error'); }
  };

  const handleAddItem = async () => {
    if (!itemForm.name || !itemForm.price) { toast.error('Name and price required'); return; }
    setAddingItem(true);
    try {
      const res  = await fetch(`${API}/api/admin/restaurants/menu/add/`, {
        method:'POST', headers:{ ...headers,'Content-Type':'application/json' },
        body: JSON.stringify({ restaurantId: selected._id, ...itemForm, price: parseInt(itemForm.price) }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success('Item added!');
        setItemForm(EMPTY_ITEM);
        fetchRestaurants().then(() => {
          // re-select updated restaurant
          setSelected(prev => prev ? { ...prev, menu: [...(prev.menu||[]), data.data] } : prev);
        });
      }
    } catch { toast.error('Error'); }
    finally { setAddingItem(false); }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await fetch(`${API}/api/admin/restaurants/menu/delete/`, {
        method:'POST', headers:{ ...headers,'Content-Type':'application/json' },
        body: JSON.stringify({ restaurantId: selected._id, itemId }),
      });
      toast.success('Item removed!');
      fetchRestaurants();
      setSelected(prev => prev ? { ...prev, menu: prev.menu.filter(i => i.id !== itemId) } : prev);
    } catch { toast.error('Error'); }
  };

  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (loading) return <div className="ap-loading"><div className="ap-spinner"></div></div>;

  const pending = restaurants.filter(r => r.status === 'Pending');
  const active  = restaurants.filter(r => r.status !== 'Pending');

  // ── Menu management view ──
  if (selected) {
    const rest = restaurants.find(r => r._id === selected._id) || selected;
    return (
      <div>
        <button className="ap-btn ap-btn-ghost ap-btn-sm" style={{marginBottom:20}} onClick={() => setSelected(null)}>
          <i className="fa-solid fa-arrow-left"></i> Back to Restaurants
        </button>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start'}}>
          {/* Add Item Form */}
          <div className="ap-card" style={{position:'sticky', top:0}}>
            <div className="ap-card-header"><span className="ap-card-title">➕ Add Menu Item — {rest.name}</span></div>
            <div className="ap-card-body">
              <div style={{display:'flex', flexDirection:'column', gap:12}}>
                {[['name','Item Name *','e.g. Butter Chicken'],['price','Price (₹) *','e.g. 180'],['category','Category','e.g. Starter']].map(([k,l,p])=>(
                  <div key={k} className="ap-form-group">
                    <label className="ap-label">{l}</label>
                    <input className="ap-input" placeholder={p} value={itemForm[k]} onChange={e=>setItemForm(f=>({...f,[k]:e.target.value}))} />
                  </div>
                ))}
                <ImageUpload label="Item Photo" previewUrl={itemForm.img} onUpload={url => setItemForm(f=>({...f, img:url}))} />
                <button className="ap-btn ap-btn-primary" onClick={handleAddItem} disabled={addingItem} style={{justifyContent:'center'}}>
                  {addingItem ? 'Adding…' : <><i className="fa-solid fa-plus"></i> Add Item</>}
                </button>
              </div>
            </div>
          </div>
          {/* Menu List */}
          <div className="ap-card">
            <div className="ap-card-header">
              <span className="ap-card-title">🍽️ Menu ({(rest.menu||[]).length} items)</span>
            </div>
            <div className="ap-card-body" style={{padding:'8px 18px'}}>
              {(rest.menu||[]).length === 0
                ? <div className="ap-empty"><i className="fa-solid fa-plate-wheat"></i><span>No items yet</span></div>
                : (rest.menu||[]).map(item => (
                  <div key={item.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                    <img src={item.img||'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=60&h=60&fit=crop'} alt={item.name}
                      style={{width:50,height:50,borderRadius:8,objectFit:'cover'}} onError={e=>{e.target.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=60&h=60&fit=crop'}} />
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:'0.85rem'}}>{item.name}</div>
                      <div style={{fontSize:'0.75rem',color:'var(--accent)'}}> ₹{item.price} · {item.category}</div>
                    </div>
                    <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={()=>handleDeleteItem(item.id)}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',gap:8}}>
          <button className={`ap-filter-tab ${tab==='active'?'active':''}`} onClick={()=>setTab('active')}>
            🏪 Restaurants ({active.length})
          </button>
          <button className={`ap-filter-tab ${tab==='pending'?'active':''}`} onClick={()=>setTab('pending')}>
            ⏳ Pending Applications
            {pending.length > 0 && <span style={{background:'#ff9800',color:'#fff',borderRadius:10,padding:'1px 7px',fontSize:'0.65rem',marginLeft:6}}>{pending.length}</span>}
          </button>
        </div>
        {tab==='active' && (
          <button className="ap-btn ap-btn-primary" onClick={openAdd}>
            <i className="fa-solid fa-plus"></i> Add Restaurant
          </button>
        )}
      </div>

      {/* Pending Applications View */}
      {tab === 'pending' && (
        pending.length === 0
          ? <div className="ap-empty"><i className="fa-solid fa-check-circle"></i><span>No pending applications!</span></div>
          : <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {pending.map(r => (
                <div key={r._id} className="ap-card">
                  <div className="ap-card-body">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,flexWrap:'wrap'}}>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                          <span style={{fontSize:'1.4rem'}}>🏪</span>
                          <div>
                            <div style={{fontWeight:700,fontSize:'1rem'}}>{r.name}</div>
                            <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{r.cuisine} · {r.city}</div>
                          </div>
                          <span style={{background:'rgba(255,152,0,0.15)',color:'#ff9800',fontSize:'0.7rem',padding:'3px 10px',borderRadius:20,fontWeight:600,marginLeft:'auto'}}>⏳ Pending</span>
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 20px',fontSize:'0.78rem',color:'var(--text-muted)'}}>
                          {[['👤',r.ownerName],['📞',r.phone],['📧',r.email],['📍',r.address],['🕐',r.timing],['🪪',r.fssaiNo||'—']].map(([ic,v])=>(
                            v ? <span key={ic}>{ic} {v}</span> : null
                          ))}
                        </div>
                      </div>
                      <div style={{display:'flex',gap:8,flexShrink:0}}>
                        <button className="ap-btn ap-btn-sm" style={{background:'rgba(76,175,80,0.15)',color:'#4caf50'}} onClick={()=>handleApprove(r)}>✅ Approve</button>
                        <button className="ap-btn ap-btn-sm" style={{background:'rgba(244,67,54,0.15)',color:'#f44336'}} onClick={()=>handleRejectPartner(r._id)}>❌ Reject</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
      )}

      {/* Active Restaurants Grid */}
      {tab === 'active' && (
        active.length === 0
          ? <div className="ap-empty"><i className="fa-solid fa-store-slash"></i><span>No restaurants yet. Add your first one!</span></div>
          : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:20}}>
              {active.map(r => (
              <div key={r._id} className="ap-card" style={{opacity: r.isActive ? 1 : 0.6}}>
                {/* Banner */}
                <div style={{height:110,background:'linear-gradient(135deg,#1a1a2e,#16213e)',borderRadius:'12px 12px 0 0',overflow:'hidden',position:'relative'}}>
                  {r.banner && <img src={r.banner} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />}
                  <div style={{position:'absolute',bottom:8,left:12,display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:44,height:44,borderRadius:10,background:'rgba(255,255,255,0.15)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                      {r.logo ? <img src={r.logo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontSize:'1.4rem'}}>🏪</span>}
                    </div>
                    <div>
                      <div style={{fontWeight:700,color:'#fff',textShadow:'0 1px 3px rgba(0,0,0,0.5)'}}>{r.name}</div>
                      <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.8)'}}>{r.cuisine}</div>
                    </div>
                  </div>
                  <div style={{position:'absolute',top:8,right:8}}>
                    <span style={{background: r.isActive ? 'rgba(76,175,80,0.9)' : 'rgba(244,67,54,0.9)', color:'#fff', fontSize:'0.7rem', padding:'3px 8px', borderRadius:10, fontWeight:600}}>
                      {r.isActive ? '● Open' : '● Closed'}
                    </span>
                  </div>
                </div>
                {/* Body */}
                <div className="ap-card-body">
                  <div style={{display:'flex',gap:12,marginBottom:12,flexWrap:'wrap'}}>
                    {[['⭐',r.rating],['⏱',`${r.deliveryTime} min`],['🛒',`₹${r.minOrder} min`]].map(([ic,v])=>(
                      <span key={v} style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{ic} {v}</span>
                    ))}
                  </div>
                  <div style={{fontSize:'0.78rem',color:'var(--text-muted)',marginBottom:4}}>📍 {r.address}</div>
                  {r.phone && <div style={{fontSize:'0.78rem',color:'var(--text-muted)',marginBottom:12}}>📞 {r.phone}</div>}
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    <button className="ap-btn ap-btn-primary ap-btn-sm" style={{flex:1}} onClick={() => setSelected(r)}>
                      <i className="fa-solid fa-utensils"></i> Menu ({(r.menu||[]).length})
                    </button>
                    <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={() => openEdit(r)}>
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button className="ap-btn ap-btn-sm" style={{background: r.isActive ? 'rgba(255,152,0,0.15)' : 'rgba(76,175,80,0.15)', color: r.isActive ? '#ff9800' : '#4caf50'}} onClick={() => handleToggle(r)}>
                      {r.isActive ? '⏸' : '▶'}
                    </button>
                    <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => handleDelete(r._id)}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="ap-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ap-modal" onClick={e => e.stopPropagation()} style={{maxWidth:560}}>
            <div className="ap-modal-header">
              <h3>{editData ? 'Edit Restaurant' : 'Add New Restaurant'}</h3>
              <button className="ap-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="ap-modal-body" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              {[['name','Restaurant Name *','e.g. Sharma Dhaba'],['address','Address *','Full address'],['phone','Phone','10-digit number'],['timing','Timing','e.g. 9 AM - 11 PM']].map(([k,l,p])=>(
                <div key={k} className="ap-form-group" style={k==='address' ? {gridColumn:'1/-1'} : {}}>
                  <label className="ap-label">{l}</label>
                  <input className="ap-input" placeholder={p} value={form[k]||''} onChange={e=>sf(k,e.target.value)} />
                </div>
              ))}
              <div style={{gridColumn:'1/-1', display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
                <ImageUpload label="Logo" previewUrl={form.logo} onUpload={url => sf('logo', url)} />
                <ImageUpload label="Banner" previewUrl={form.banner} onUpload={url => sf('banner', url)} />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Cuisine Type</label>
                <select className="ap-input" value={form.cuisine} onChange={e=>sf('cuisine',e.target.value)}>
                  {CUISINES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Rating (1–5)</label>
                <input className="ap-input" type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e=>sf('rating',e.target.value)} />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Delivery Time (min)</label>
                <input className="ap-input" type="number" value={form.deliveryTime} onChange={e=>sf('deliveryTime',e.target.value)} />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Min Order (₹)</label>
                <input className="ap-input" type="number" value={form.minOrder} onChange={e=>sf('minOrder',e.target.value)} />
              </div>
            </div>
            <div className="ap-modal-footer">
              <button className="ap-btn ap-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="ap-btn ap-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editData ? 'Update Restaurant' : 'Add Restaurant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
