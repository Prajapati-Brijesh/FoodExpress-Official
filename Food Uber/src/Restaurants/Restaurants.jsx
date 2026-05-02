import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer';
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../config";
import './Restaurants.css';

const API = API_BASE_URL;
const CUISINES = ['All','North Indian','South Indian','Chinese','Fast Food','Pizza','Continental','Mughlai','Street Food'];

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState('All');
  const [search,      setSearch]      = useState('');
  const [selectedCity,setSelectedCity] = useState('All');
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetch(`${API}/api/restaurants/`)
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setRestaurants(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cities = ['All', ...new Set(restaurants.map(r => r.city).filter(Boolean))];

  const filtered = restaurants.filter(r => {
    const matchCuisine = filter === 'All' || r.cuisine === filter;
    const matchCity    = selectedCity === 'All' || r.city === selectedCity;
    const matchSearch  = !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.cuisine?.toLowerCase().includes(search.toLowerCase());
    return matchCuisine && matchCity && matchSearch;
  });

  return (
    <>
      <Navbar />
      <div className="rest-page">
      <div className="rest-hero">
        <div className="rest-hero-content">
          <h1>🏪 {t('restaurants_near_you')}</h1>
          <p>{t('best_places')}</p>
          <div className="rest-search-bar">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input placeholder={t('search_placeholder')} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="rest-container">
        {/* City Filter */}
        <div style={{marginBottom:24}}>
          <div style={{fontSize:'0.75rem', fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:1, marginBottom:12}}>
            <i className="fa-solid fa-location-dot me-2"></i>{t('city')}
          </div>
          <div className="rest-filters" style={{marginBottom:0}}>
            {cities.map(c => (
              <button key={c} className={`rest-filter-chip ${selectedCity === c ? 'active' : ''}`} onClick={() => setSelectedCity(c)}>
                {c === 'All' ? t('all') || 'All' : c}
              </button>
            ))}
          </div>
        </div>

        <div style={{fontSize:'0.75rem', fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:1, marginBottom:12}}>
          <i className="fa-solid fa-utensils me-2"></i>{t('cuisine_type') || 'Cuisine Type'}
        </div>
        <div className="rest-filters">
          {CUISINES.map(c => (
            <button key={c} className={`rest-filter-chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
              {c === 'All' ? t('all') || 'All' : c}
            </button>
          ))}
        </div>

        <div className="rest-count">{filtered.length} {t('items_found')}</div>

        {loading ? (
          <div className="rest-loading">
            {[1,2,3,4,5,6].map(i => <div key={i} className="rest-skeleton"></div>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rest-empty">
            <span style={{fontSize:'3rem'}}>🍽️</span>
            <p>{t('no_dishes_found')}</p>
          </div>
        ) : (
          <div className="rest-grid">
            {filtered.map(r => (
              <div key={r._id} className="rest-card" onClick={() => navigate(`/restaurants/${r._id}`)}>
                <div className="rest-card-banner">
                  {r.banner
                    ? <img src={r.banner} alt={r.name} onError={e => { e.target.style.display='none'; }} />
                    : <div className="rest-card-banner-placeholder">🏪</div>
                  }
                  <div className="rest-card-time">⏱ {r.deliveryTime || 30} {t('minutes')}</div>
                </div>
                <div className="rest-card-body">
                  <div className="rest-card-header-row">
                    <div className="rest-card-logo">
                      {r.logo ? <img src={r.logo} alt={r.name} onError={e=>{e.target.style.display='none'}} /> : <span>🏪</span>}
                    </div>
                    <div className="rest-card-rating">⭐ {r.rating || '4.0'}</div>
                  </div>
                  <h3 className="rest-card-name">{r.name}</h3>
                  <p className="rest-card-name-sub">{r.cuisine} · {r.timing || '9 AM - 10 PM'}</p>
                  <p className="rest-card-address">📍 {r.address}</p>
                  <div className="rest-eco-badge" title="Environment Friendly Packaging & Sourcing">
                    <i className="fa-solid fa-leaf"></i> Eco-Score: {r.ecoScore || Math.floor(Math.random() * 15) + 85}%
                  </div>
                  <div className="rest-card-footer">
                    <span>Min ₹{r.minOrder || 100}</span>
                    <button className="rest-card-btn">{t('view_menu')} →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    <Footer />
    </>
  );
}
