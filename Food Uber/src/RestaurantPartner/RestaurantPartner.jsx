import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify';
import { API_BASE_URL } from "../config";
import './RestaurantPartner.css';
import ImageUpload from '../components/ImageUpload';

const API = API_BASE_URL;
const CUISINES = ['North Indian','South Indian','Chinese','Fast Food','Pizza','Continental','Mughlai','Street Food','Multi-cuisine','Bakery','Beverages'];

const EMPTY = {
  name:'', ownerName:'', email:'', phone:'', password: '',
  address:'', city:'', cuisine:'Multi-cuisine',
  timing:'9 AM - 10 PM', fssaiNo:'', gstNo:''
};

export default function RestaurantPartner() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState(EMPTY);
  const [step,    setStep]    = useState(1);
  const [saving,  setSaving]  = useState(false);
  const [count,   setCount]   = useState({ orders:0, restaurants:0, cities:0 });

  // Animated counters
  useEffect(() => {
    const targets = { orders:10000, restaurants:500, cities:50 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const progress = frame / steps;
      setCount({
        orders:       Math.floor(targets.orders       * progress),
        restaurants:  Math.floor(targets.restaurants  * progress),
        cities:       Math.floor(targets.cities       * progress),
      });
      if (frame >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.ownerName || !form.city) {
      toast.error('Please fill all required fields'); return;
    }
    if (form.phone.length !== 10) { toast.error('Enter valid 10-digit phone'); return; }
    setSaving(true);
    try {
      const res  = await fetch(`${API}/api/partner/register/`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === 'success') { setStep(2); toast.success('Application submitted!'); }
      else toast.error(data.message || 'Submission failed');
    } catch { toast.error('Server error. Try again.'); }
    finally { setSaving(false); }
  };

  /* ── SUCCESS ── */
  if (step === 2) return (
    <div className="rp-page">
      <div className="rp-success-wrapper">
        <div className="rp-success-box">
          <div className="rp-success-check">✓</div>
          <h2>You're all set, {form.ownerName}!</h2>
          <p>We've received your application for <strong>{form.name}</strong>. Our onboarding team will call you at <strong>{form.phone}</strong> within 24 hours.</p>
          <div className="rp-timeline">
            {[
              {icon:'📝', label:'Application Submitted',  sub:'Just now',           done:true},
              {icon:'📞', label:'Onboarding Call',        sub:'Within 24 hours',    done:false},
              {icon:'✅', label:'Account Verified',       sub:'Within 48 hours',    done:false},
              {icon:'🚀', label:'Go Live & Start Earning',sub:'Day 3 onwards',      done:false},
            ].map((s, i) => (
              <div key={i} className={`rp-tl-item ${s.done ? 'done' : ''}`}>
                <div className="rp-tl-dot">{s.done ? '✓' : i+1}</div>
                <div className="rp-tl-line"></div>
                <div className="rp-tl-content">
                  <span className="rp-tl-icon">{s.icon}</span>
                  <div>
                    <div className="rp-tl-label">{s.label}</div>
                    <div className="rp-tl-sub">{s.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rp-success-actions">
            <Link to="/" className="rp-btn-solid">Back to Home</Link>
            <button className="rp-btn-outline" onClick={() => { setStep(1); setForm(EMPTY); }}>
              Register Another Restaurant
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── MAIN ── */
  return (
    <div className="rp-page">

      {/* ── HERO SPLIT ── */}
      <section className="rp-hero">
        <div className="rp-hero-left">
          <div className="rp-tag">🤝 Partner with FoodExpress</div>
          <h1>
            Grow your restaurant<br/>
            <span className="rp-orange">10x faster</span> with us
          </h1>
          <p>Join over 500 restaurants already earning more. Get access to thousands of hungry customers in your city.</p>

          <div className="rp-stats-row">
            <div className="rp-stat-pill">
              <span className="rp-stat-num">{count.orders.toLocaleString()}+</span>
              <span className="rp-stat-lbl">Daily Orders</span>
            </div>
            <div className="rp-stat-pill">
              <span className="rp-stat-num">{count.restaurants}+</span>
              <span className="rp-stat-lbl">Partners</span>
            </div>
            <div className="rp-stat-pill">
              <span className="rp-stat-num">{count.cities}+</span>
              <span className="rp-stat-lbl">Cities</span>
            </div>
          </div>

          <div className="rp-perks-list">
            {[
              ['📈','Reach more customers','Get discovered by thousands of users daily'],
              ['💰','Zero commission first month','Start earning with 0% commission'],
              ['📊','Real-time dashboard','Track orders, revenue & feedback live'],
              ['🛵','We handle delivery','You cook, we deliver — it\'s that simple'],
            ].map(([ic,title,desc]) => (
              <div key={title} className="rp-perk-row">
                <div className="rp-perk-ico">{ic}</div>
                <div>
                  <div className="rp-perk-title">{title}</div>
                  <div className="rp-perk-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FORM ── */}
        <div className="rp-hero-right">
          <div className="rp-form-panel">
            <div className="rp-form-badge">Free Registration</div>
            <h2 className="rp-form-heading">Register your restaurant</h2>
            <p className="rp-form-sub">Takes less than 5 minutes · No credit card needed</p>
            <div className="rp-login-link-box">
              Already have an account? <Link to="/partner/login" className="rp-orange">Partner Login</Link>
            </div>

            <form onSubmit={handleSubmit} className="rp-form">
              <div className="rp-form-row">
                <div className="rp-input-group rp-span2">
                  <label>Restaurant Name *</label>
                  <input placeholder="e.g. Sharma Dhaba, Pizza Hub" value={form.name} onChange={e=>set('name',e.target.value)} required />
                </div>
              </div>
              <div className="rp-form-row">
                <div className="rp-input-group">
                  <label>Owner / Manager Name *</label>
                  <input placeholder="Your full name" value={form.ownerName} onChange={e=>set('ownerName',e.target.value)} required />
                </div>
                <div className="rp-input-group">
                  <label>Mobile Number *</label>
                  <div className="rp-phone-wrap">
                    <span className="rp-phone-prefix">+91</span>
                    <input placeholder="10-digit number" maxLength={10} value={form.phone} onChange={e=>set('phone',e.target.value.replace(/\D/,''))} required />
                  </div>
                </div>
              </div>
              <div className="rp-form-row">
                <div className="rp-input-group">
                  <label>Email Address *</label>
                  <input type="email" placeholder="owner@restaurant.com" value={form.email} onChange={e=>set('email',e.target.value)} required />
                </div>
                <div className="rp-input-group">
                  <label>City *</label>
                  <input placeholder="e.g. Mumbai, Delhi" value={form.city} onChange={e=>set('city',e.target.value)} required />
                </div>
              </div>
              <div className="rp-form-row">
                <div className="rp-input-group rp-span2">
                  <label>Create Password *</label>
                  <input type="password" placeholder="Minimum 6 characters" value={form.password} onChange={e=>set('password',e.target.value)} required />
                </div>
              </div>
              <div className="rp-form-row">
                <div className="rp-input-group rp-span2">
                  <label>Restaurant Address *</label>
                  <input placeholder="Shop no, Building, Street, Area, City" value={form.address} onChange={e=>set('address',e.target.value)} required />
                </div>
              </div>

              <div className="rp-form-row">
                <div className="rp-input-group">
                  <ImageUpload label="Restaurant Logo" previewUrl={form.logo} onUpload={url => set('logo', url)} />
                </div>
                <div className="rp-input-group">
                  <ImageUpload label="Banner Image" previewUrl={form.banner} onUpload={url => set('banner', url)} />
                </div>
              </div>
              <div className="rp-form-row">
                <div className="rp-input-group">
                  <label>Cuisine Type</label>
                  <select value={form.cuisine} onChange={e=>set('cuisine',e.target.value)}>
                    {CUISINES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="rp-input-group">
                  <label>Operating Hours</label>
                  <input placeholder="e.g. 9 AM – 11 PM" value={form.timing} onChange={e=>set('timing',e.target.value)} />
                </div>
              </div>
              <div className="rp-form-row">
                <div className="rp-input-group">
                  <label>FSSAI License <span className="rp-optional">(optional)</span></label>
                  <input placeholder="14-digit license number" value={form.fssaiNo} onChange={e=>set('fssaiNo',e.target.value)} />
                </div>
                <div className="rp-input-group">
                  <label>GST Number <span className="rp-optional">(optional)</span></label>
                  <input placeholder="15-digit GSTIN" value={form.gstNo} onChange={e=>set('gstNo',e.target.value)} />
                </div>
              </div>

              <p className="rp-terms">
                By registering you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
              </p>

              <button type="submit" className="rp-submit" disabled={saving}>
                {saving
                  ? <><span className="rp-btn-spinner"></span> Submitting…</>
                  : <>Get Started — It's Free <span className="rp-arrow">→</span></>
                }
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="rp-how">
        <div className="rp-section-inner">
          <p className="rp-section-tag">Simple Process</p>
          <h2 className="rp-section-h2">Start in 4 easy steps</h2>
          <div className="rp-steps-track">
            {[
              {n:'01', icon:'📝', title:'Register Online',   desc:'Fill your restaurant details in under 5 minutes — completely free', action: () => window.scrollTo({top:0, behavior:'smooth'})},
              {n:'02', icon:'📞', title:'Onboarding Call',   desc:'Our team calls you within 24 hours to verify and guide you', action: () => toast.info('Register your restaurant first to get an onboarding call!')},
              {n:'03', icon:'🍽️', title:'Upload Your Menu',  desc:'Add dishes, photos and prices through your partner dashboard', action: () => navigate('/partner/login')},
              {n:'04', icon:'🚀', title:'Go Live & Earn',    desc:'Start receiving orders the same day you go live!', action: () => navigate('/partner/login')},
            ].map((s, i) => (
              <div key={i} className="rp-step" style={{cursor: 'pointer'}} onClick={s.action}>
                <div className="rp-step-num">{s.n}</div>
                <div className="rp-step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < 3 && <div className="rp-step-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS GRID ── */}
      <section className="rp-benefits-section">
        <div className="rp-section-inner">
          <p className="rp-section-tag">Why FoodExpress?</p>
          <h2 className="rp-section-h2">Everything your restaurant needs</h2>
          <div className="rp-benefits-grid">
            {[
              {icon:'📈',title:'Grow Revenue',          desc:'Average partner sees 40% revenue growth in first 3 months'},
              {icon:'🎯',title:'Targeted Marketing',    desc:'Featured in promotions and discount campaigns at no cost'},
              {icon:'📊',title:'Live Analytics',        desc:'Real-time order tracking, revenue charts and customer insights'},
              {icon:'🛵',title:'Delivery Fleet',         desc:'We manage delivery — you focus on making great food'},
              {icon:'💬',title:'Customer Reviews',       desc:'Build your reputation with verified customer ratings'},
              {icon:'📞',title:'24/7 Partner Support',  desc:'Dedicated support team available around the clock'},
            ].map((b, i) => (
              <div key={i} className="rp-benefit">
                <div className="rp-benefit-icon">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="rp-bottom-cta">
        <h2>Ready to grow? <span className="rp-orange">Register today — it's free!</span></h2>
        <p>Join 500+ restaurants already on FoodExpress</p>
        <button className="rp-btn-solid" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
          Register Your Restaurant →
        </button>
        <p style={{marginTop:20, fontSize:'0.85rem', color:'rgba(255,255,255,0.45)'}}>
          Are you a delivery rider?{' '}
          <Link to="/delivery-join" style={{color:'#ff6f00', textDecoration:'none'}}>Join as a Rider →</Link>
        </p>
      </section>
    </div>
  );
}
