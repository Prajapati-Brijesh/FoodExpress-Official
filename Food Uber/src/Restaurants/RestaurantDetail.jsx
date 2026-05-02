import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../config";
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer';
import './Restaurants.css';

const API = API_BASE_URL;

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [restaurant, setRestaurant] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [catFilter,  setCatFilter]  = useState('All');
  const [activeTab,  setActiveTab]  = useState('menu'); // menu | reviews
  const [reviews,    setReviews]    = useState([]);
  const [revForm,    setRevForm]    = useState({ rating: 5, comment: '' });
  const [revSaving,  setRevSaving]  = useState(false);
  const [selected3DItem, setSelected3DItem] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/restaurants/${id}/`)
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setRestaurant(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
    
    fetchReviews();
  }, [id]);

  const fetchReviews = () => {
    fetch(`${API}/api/reviews/${id}/`)
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setReviews(d.data); })
      .catch(console.error);
  };

  const menu = restaurant?.menu || [];
  const categories = ['All', ...new Set(menu.map(i => i.category).filter(Boolean))];
  const filteredMenu = catFilter === 'All' ? menu : menu.filter(i => i.category === catFilter);

  const handleAdd = (item) => {
    addToCart({ ...item, id: item.id || item._id, restaurantId: id, restaurantName: restaurant?.name });
    toast.success(`${item.name} added to cart!`, { autoClose: 1500 });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.name) { toast.error('Please login to review'); return; }
    
    setRevSaving(true);
    try {
      const res = await fetch(`${API}/api/reviews/add/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: id,
          userId: user._id,
          userName: user.name, // We'll store name for display
          ...revForm
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success('Review submitted!');
        setRevForm({ rating: 5, comment: '' });
        fetchReviews();
      }
    } catch { toast.error('Error submitting review'); }
    finally { setRevSaving(false); }
  };

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0f0f0f',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.5)'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:40,height:40,border:'3px solid rgba(255,111,0,0.3)',borderTopColor:'#ff6f00',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 16px'}}></div>
        Loading menu…
      </div>
    </div>
  );

  if (!restaurant) return (
    <div style={{minHeight:'100vh',background:'#0f0f0f',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'3rem',marginBottom:16}}>🍽️</div>
        <p>Restaurant not found</p>
        <button onClick={() => navigate('/restaurants')} style={{marginTop:16,background:'#ff6f00',color:'#fff',border:'none',padding:'10px 24px',borderRadius:8,cursor:'pointer'}}>
          ← Back
        </button>
      </div>
    </div>
  );

  return (
    <>
    <Navbar />
    <div className="rdet-page">
      <div className="rdet-banner">
        {restaurant.banner && <img src={restaurant.banner} alt={restaurant.name} />}
        <div className="rdet-banner-overlay"></div>
        <div className="rdet-info-row">
          <div className="rdet-logo">
            {restaurant.logo ? <img src={restaurant.logo} alt="" /> : '🏪'}
          </div>
          <div>
            <div className="rdet-name">{restaurant.name}</div>
            <div className="rdet-meta">
              <span>🍽️ {restaurant.cuisine}</span>
              <span>⭐ {restaurant.rating || '4.0'}</span>
              <span>⏱ {restaurant.deliveryTime || 30} {t('minutes')}</span>
              <span>🕐 {restaurant.timing || '9 AM - 10 PM'}</span>
            </div>
            <div className="rdet-eco-badge">
               <i className="fa-solid fa-leaf"></i> This restaurant is <strong>{(restaurant.ecoScore || 92)}% sustainable</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="rdet-container">
        <button className="rdet-back" onClick={() => navigate('/restaurants')}>
          <i className="fa-solid fa-arrow-left"></i> All Restaurants
        </button>

        <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:28}}>
          {[['📍',restaurant.address],['📞',restaurant.phone],['🛒',`Min ₹${restaurant.minOrder||100}`]].map(([ic,v]) =>
            v ? <span key={ic} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:20,padding:'6px 14px',fontSize:'0.8rem',color:'rgba(255,255,255,0.7)'}}>{ic} {v}</span> : null
          )}
        </div>

        <div className="rdet-tabs">
          <button className={`rdet-tab ${activeTab==='menu'?'active':''}`} onClick={()=>setActiveTab('menu')}>Menu</button>
          <button className={`rdet-tab ${activeTab==='reviews'?'active':''}`} onClick={()=>setActiveTab('reviews')}>Reviews ({reviews.length})</button>
        </div>

        {activeTab === 'menu' ? (
          <>
            <div className="rdet-section-title">🍽️ Menu ({menu.length} items)</div>

        {categories.length > 1 && (
          <div className="rest-filters" style={{marginBottom:20}}>
            {categories.map(c => (
              <button key={c} className={`rest-filter-chip ${catFilter===c?'active':''}`} onClick={() => setCatFilter(c)}>{c}</button>
            ))}
          </div>
        )}

        {filteredMenu.length === 0 ? (
          <div className="rest-empty"><span style={{fontSize:'3rem'}}>🍽️</span><p>No menu items yet!</p></div>
        ) : (
          <div className="rdet-menu-grid">
            {filteredMenu.map(item => (
              <div key={item.id} className="rdet-item">
                {item.img
                  ? <img src={item.img} alt={item.name} onError={e => { e.target.style.display='none'; }}/>
                  : <div className="rdet-item-no-img">🍽️</div>
                }
                <div className="rdet-item-body">
                  <div className="rdet-item-name">{item.name}</div>
                  <div className="rdet-item-cat">{item.category}</div>
                  <button className="rdet-3d-btn" onClick={() => setSelected3DItem(item)}>
                    <i className="fa-solid fa-cube"></i> View in 3D
                  </button>
                  <div className="rdet-item-footer">
                    <span className="rdet-item-price">₹{item.price}</span>
                    <button className="rdet-add-btn" onClick={() => handleAdd(item)}>+ Add</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    ) : (
          <div className="rdet-reviews-section">
            <div className="rdet-review-form-box">
              <h3>Rate your experience</h3>
              <form onSubmit={submitReview}>
                <div className="rdet-star-input">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} onClick={()=>setRevForm({...revForm, rating:s})} style={{cursor:'pointer', fontSize:'1.5rem', color: s <= revForm.rating ? '#ff6f00' : '#444'}}>
                      ★
                    </span>
                  ))}
                </div>
                <textarea 
                  placeholder="Share your thoughts about the food and service..." 
                  value={revForm.comment} 
                  onChange={e=>setRevForm({...revForm, comment:e.target.value})}
                  required
                />
                <button type="submit" disabled={revSaving}>
                  {revSaving ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            </div>

            <div className="rdet-reviews-list">
              {reviews.length === 0 ? (
                <div className="rest-empty" style={{padding:'40px 0'}}>No reviews yet. Be the first!</div>
              ) : (
                reviews.map(r => (
                  <div key={r._id} className="rdet-review-card">
                    <div className="rdet-rev-header">
                      <div className="rdet-rev-user">👤 {r.userName || 'Anonymous'}</div>
                      <div className="rdet-rev-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                    </div>
                    <div className="rdet-rev-comment">{r.comment}</div>
                    <div className="rdet-rev-date">{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    
    {/* 3D Preview Modal */}
    {selected3DItem && (
      <div className="rdet-3d-modal" onClick={() => setSelected3DItem(null)}>
        <div className="rdet-3d-content" onClick={e => e.stopPropagation()}>
          <button className="rdet-3d-close" onClick={() => setSelected3DItem(null)}>&times;</button>
          <div className="rdet-3d-scene">
             <div className="rdet-3d-plate">
                {selected3DItem.img ? <img src={selected3DItem.img} alt="" /> : <span>🍽️</span>}
                <div className="plate-shadow"></div>
             </div>
          </div>
          <div className="text-center mt-4">
            <h2 className="fw-bold">{selected3DItem.name}</h2>
            <p className="text-secondary">Interactive 3D Preview</p>
            <div className="d-flex justify-content-center gap-3 mt-3">
              <div className="badge bg-success">Hot & Fresh</div>
              <div className="badge bg-warning text-dark">Eco-Friendly</div>
            </div>
          </div>
        </div>
      </div>
    )}

    <Footer />
    </>
  );
}
