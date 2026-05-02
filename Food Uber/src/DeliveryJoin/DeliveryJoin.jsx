import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './DeliveryJoin.css';

const API = 'http://localhost:8000';
const VEHICLES = [
  { type:'Bike',   icon:'🏍️', desc:'Fastest deliveries' },
  { type:'Scooter',icon:'🛵', desc:'Most popular' },
  { type:'Cycle',  icon:'🚲', desc:'Eco-friendly' },
  { type:'Car',    icon:'🚗', desc:'Large orders' },
];

const EMPTY = { name:'', phone:'', email:'', city:'', vehicleType:'Scooter', licenseNo:'', aadharNo:'', password:'' };

export default function DeliveryJoin() {
  const navigate = useNavigate();
  const [form,       setForm]     = useState(EMPTY);
  const [step,       setStep]     = useState(1);
  const [saving,     setSaving]   = useState(false);
  const [earnings,   setEarnings] = useState(0);
  const [submitData, setSubmitData] = useState(null); // stores { deliveryId, name, phone }

  // Animated earnings counter
  useEffect(() => {
    let val = 0;
    const target = 25000;
    const timer = setInterval(() => {
      val += 600;
      if (val >= target) { setEarnings(target); clearInterval(timer); }
      else setEarnings(val);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.city) { toast.error('Please fill all required fields'); return; }
    if (form.phone.length !== 10) { toast.error('Enter valid 10-digit number'); return; }
    if (!form.password || form.password.length < 4) { toast.error('Set a PIN of at least 4 digits'); return; }
    setSaving(true);
    try {
      const res  = await fetch(`${API}/api/delivery/register/`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSubmitData({ deliveryId: data.deliveryId, name: form.name, phone: form.phone });
        setStep(2);
        toast.success('Application submitted!');
      } else toast.error(data.message || 'Failed');
    } catch { toast.error('Server error. Try again.'); }
    finally { setSaving(false); }
  };

  /* ── SUCCESS ── */
  if (step === 2) return (
    <div className="dj-page">
      <div className="dj-success-wrapper">
        <div className="dj-success-box">
          <div className="dj-success-icon">🎉</div>
          <h2>Welcome to the fleet, {submitData?.name || form.name}!</h2>
          <p>Your application has been received. Our team will verify and activate your account within 24 hours.</p>

          {/* Delivery ID Card - like Zomato/Swiggy */}
          <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', border: '1px solid rgba(255,165,0,0.4)', borderRadius: 16, padding: '20px 24px', margin: '20px 0', textAlign: 'left' }}>
            <p style={{ fontSize: '0.75rem', color: '#f59e0b', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>Your Delivery Partner ID</p>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: 4, color: 'white', fontFamily: 'monospace' }}>
              {submitData?.deliveryId || 'FE-PENDING'}
            </div>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 8, marginBottom: 0 }}>Use this ID + your PIN to login at <strong style={{color:'#f59e0b'}}>/delivery/login</strong></p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>📱 Login with: <strong>Phone: {submitData?.phone || form.phone}</strong> + <strong>Your PIN</strong></p>
          </div>

          <div className="dj-steps-progress">
            {[
              {label:'Application Received', done:true},
              {label:'Background Check',     done:false},
              {label:'Document Verification',done:false},
              {label:'Start Delivering!',    done:false},
            ].map((s, i) => (
              <div key={i} className={`dj-prog-step ${s.done?'done':''}`}>
                <div className="dj-prog-dot">{s.done ? '✓' : i+1}</div>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <div className="dj-success-btns">
            <Link to="/delivery/login" className="dj-btn-main">Go to Login →</Link>
            <button className="dj-btn-sec" onClick={() => { setStep(1); setForm(EMPTY); }}>
              Apply Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dj-page">
      {/* ── HERO ── */}
      <section className="dj-hero">
        <div className="dj-hero-inner">
          <div className="dj-hero-left">
            <div className="dj-hero-tag">🛵 Now Hiring in Your City</div>
            <h1>
              Deliver with<br/>
              <span className="dj-brand">FoodExpress</span>
            </h1>
            <p>Be your own boss. Earn on your schedule. Join 5,000+ delivery partners already earning with us.</p>

            {/* Earnings card */}
            <div className="dj-earn-card">
              <div className="dj-earn-label">Average Monthly Earnings</div>
              <div className="dj-earn-amount">₹{earnings.toLocaleString()}</div>
              <div className="dj-earn-sub">Based on 8 hrs/day · 25 days a month</div>
            </div>

            <div className="dj-quick-facts">
              {[
                ['⚡','Daily Payouts',    'Get paid every single day'],
                ['📍','Work Anywhere',    'Deliver in your city'],
                ['🎁','Joining Bonus',    '₹500 on first 10 deliveries'],
                ['🏥','Insurance Cover',  'Accident cover included'],
              ].map(([ic,t,d]) => (
                <div key={t} className="dj-fact">
                  <span className="dj-fact-icon">{ic}</span>
                  <div>
                    <div className="dj-fact-title">{t}</div>
                    <div className="dj-fact-desc">{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FORM ── */}
          <div className="dj-hero-right">
            <div className="dj-form-card">
              <h2 className="dj-form-title">Start Earning Today</h2>
              <p className="dj-form-sub">Complete the form — takes under 3 minutes</p>

              <form onSubmit={handleSubmit} className="dj-form">
                <div className="dj-field-row">
                  <div className="dj-field">
                    <label>Full Name *</label>
                    <input placeholder="e.g. Rahul Sharma" value={form.name} onChange={e=>set('name',e.target.value)} required />
                  </div>
                  <div className="dj-field">
                    <label>Mobile Number *</label>
                    <div className="dj-phone">
                      <span>+91</span>
                      <input placeholder="10-digit" maxLength={10} value={form.phone} onChange={e=>set('phone',e.target.value.replace(/\D/,''))} required />
                    </div>
                  </div>
                </div>
                <div className="dj-field-row">
                  <div className="dj-field">
                    <label>Email <span className="dj-opt">(optional)</span></label>
                    <input type="email" placeholder="you@email.com" value={form.email} onChange={e=>set('email',e.target.value)} />
                  </div>
                  <div className="dj-field">
                    <label>City *</label>
                    <input placeholder="e.g. Mumbai" value={form.city} onChange={e=>set('city',e.target.value)} required />
                  </div>
                </div>

                {/* Vehicle Selector */}
                <div className="dj-field dj-field-full">
                  <label>Your Vehicle *</label>
                  <div className="dj-vehicle-grid">
                    {VEHICLES.map(v => (
                      <button type="button" key={v.type}
                        className={`dj-vehicle-btn ${form.vehicleType===v.type?'active':''}`}
                        onClick={() => set('vehicleType', v.type)}>
                        <span className="dj-v-icon">{v.icon}</span>
                        <span className="dj-v-type">{v.type}</span>
                        <span className="dj-v-desc">{v.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="dj-field-row">
                  <div className="dj-field">
                    <label>Driving License <span className="dj-opt">(optional)</span></label>
                    <input placeholder="License number" value={form.licenseNo} onChange={e=>set('licenseNo',e.target.value)} />
                  </div>
                  <div className="dj-field">
                    <label>Aadhar Number <span className="dj-opt">(optional)</span></label>
                    <input placeholder="12-digit" maxLength={12} value={form.aadharNo} onChange={e=>set('aadharNo',e.target.value.replace(/\D/,''))} />
                  </div>
                </div>

                <div className="dj-field dj-field-full">
                  <label>Set Your Login PIN *</label>
                  <input
                    type="password"
                    placeholder="Set a 4+ digit PIN for login"
                    value={form.password}
                    onChange={e => set('password', e.target.value.replace(/\D/, ''))}
                    maxLength={8}
                    required
                  />
                  <small style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>This PIN + phone number will be your login credentials</small>
                </div>

                <p className="dj-terms">
                  By applying you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>
                </p>

                <button type="submit" className="dj-submit" disabled={saving}>
                  {saving
                    ? <><span className="dj-spinner"></span> Submitting…</>
                    : <>Apply Now — It's Free <span className="dj-arr">→</span></>
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="dj-how">
        <div className="dj-section-inner">
          <p className="dj-section-tag">Simple Onboarding</p>
          <h2 className="dj-section-h2">Ready to earn in 3 steps</h2>
          <div className="dj-steps">
            {[
              {n:'01', icon:'📝', title:'Apply Online',       desc:'Fill in the form above with your basic details — takes 3 minutes', action: () => window.scrollTo({top:0, behavior:'smooth'})},
              {n:'02', icon:'✅', title:'Quick Verification',  desc:'Our team verifies your documents within 24 hours', action: () => toast.info('Submit your application first to start verification!')},
              {n:'03', icon:'💰', title:'Start Delivering',    desc:'Accept orders, deliver food, earn daily payouts directly to bank', action: () => navigate('/delivery/login')},
            ].map((s, i) => (
              <div key={i} className="dj-step-card" style={{cursor: 'pointer'}} onClick={s.action}>
                <div className="dj-step-n">{s.n}</div>
                <div className="dj-step-ico">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY JOIN ── */}
      <section className="dj-why">
        <div className="dj-section-inner">
          <p className="dj-section-tag">Benefits</p>
          <h2 className="dj-section-h2">Why deliver with FoodExpress?</h2>
          <div className="dj-why-grid">
            {[
              {icon:'💰',title:'Earn More',              desc:'Top earners make ₹30,000+ per month — your effort, your income'},
              {icon:'⏰',title:'Flexible Hours',          desc:'Work when you want. Morning, evening or night — you choose'},
              {icon:'🏍️',title:'Use Your Vehicle',        desc:'Ride your own bike, scooter or cycle — no vehicle purchase required'},
              {icon:'⚡',title:'Instant Payouts',         desc:'Money transferred to your bank account every day'},
              {icon:'🎁',title:'Bonuses & Incentives',   desc:'Extra earnings for peak hours, weekends and special events'},
              {icon:'🏥',title:'Insurance Cover',         desc:'Free accident and health insurance while on delivery'},
            ].map((b, i) => (
              <div key={i} className="dj-why-card">
                <div className="dj-why-icon">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="dj-cta">
        <h2>Start delivering today. <span className="dj-brand">Earn daily.</span></h2>
        <p>Join 5,000+ delivery partners across India</p>
        <button className="dj-btn-main" onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>
          Apply Now — It's Free →
        </button>
        <p style={{marginTop:20,fontSize:'0.85rem',color:'rgba(255,255,255,0.4)'}}>
          Own a restaurant? <Link to="/partner" style={{color:'#ff6400',textDecoration:'none'}}>Register as a Restaurant Partner →</Link>
        </p>
      </section>
    </div>
  );
}
