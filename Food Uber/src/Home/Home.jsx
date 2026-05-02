import React from "react";
import Navbar from "../Navbar/Navbar";
import "./Home.css";
import Footer from "../Footer";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { MenuContext } from "../context/MenuContext";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from 'qrcode.react';

function Home() {
  const { addToCart } = useContext(CartContext);
  const { allProducts } = useContext(MenuContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="hero-content" data-aos="fade-up">
          <h1>
            {t('welcome')}<br />
            <span>{t('flavor_meets_excellence')}</span>
          </h1>
          <Link to="/menu">
            <button className="btn-brand mt-4">{t('explore_menu')}</button>
          </Link>
        </div>
      </section>

      {/* MIDDLE PROMO */}
      <section className="middle-banner section-padding">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} data-aos="fade-right">
              <h2>{t('healthier_way')}</h2>
              <p className="lead-text">
                {t('exclusive_deals')}
              </p>

              <div className="mid-feature">
                <i className="fa-solid fa-utensils"></i>
                <h5>{t('whatever_taste')}</h5>
              </div>

              <div className="mid-feature">
                <i className="fa-solid fa-truck-fast"></i>
                <h5>{t('fast_secure')}</h5>
              </div>

              <div className="mid-feature">
                <i className="fa-solid fa-tag"></i>
                <h5>{t('save_more')}</h5>
              </div>

              <Link to="/menu" className="mt-4 d-inline-block">
                <button className="btn-brand">{t('order_now')}</button>
              </Link>
            </Col>

            <Col lg={6} className="mt-5 mt-lg-0" data-aos="fade-left">
              <div className="banner-img-container">
                <img src="/food_collage_no_yellow.png" alt="Healthy Food Collage" className="banner-img img-fluid" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600&q=80' }} />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CATEGORIES */}
      <section className="section-padding">
        <Container>
          <h2 className="text-center mb-5 fw-bold" data-aos="fade-up">{t('explore_categories')}</h2>
          <Row className="g-4">
            {[
              { title: t('breakfasts'), img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop" },
              { title: t('lunch_blast'), img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop" },
              { title: t('chinese'), img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop" },
              { title: t('fast_food'), img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" },
              { title: t('pizza'), img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop" },
              { title: t('drinks'), img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop" }
            ].map((cat, i) => (
              <Col xs={12} sm={6} lg={4} key={i}>
                <div className="category-card" data-aos="fade-up" data-aos-delay={(i + 1) * 100}>
                  <img src={cat.img} alt={cat.title} />
                  <h3>{cat.title}</h3>
                  <Link to="/menu">
                    <button className="btn btn-outline-light rounded-pill px-4">{t('view') || 'View'}</button>
                  </Link>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* OFFERS */}
      <section className="section-padding offers-section">
        <Container>
          <h2 className="text-center mb-5 fw-bold" data-aos="fade-up">{t('todays_specials')}</h2>
          <Row className="g-4 justify-content-center">

            <Col xs={12} md={6} lg={4}>
              <div className="offer-card text-center" data-aos="zoom-in" data-aos-delay="100">
                <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop" alt={t('cheese_pizza')} />
                <h3>{t('cheese_pizza')}</h3>
                <span className="offer-badge">{t('flat_40_off')}</span>
                <div className="mt-auto">
                  <Link to="/menu"><button className="btn-brand w-100">{t('claim_offer')}</button></Link>
                </div>
              </div>
            </Col>

            <Col xs={12} md={6} lg={4}>
              <div className="offer-card text-center" data-aos="zoom-in" data-aos-delay="200">
                <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" alt={t('veg_burger')} />
                <h3>{t('veg_burger')}</h3>
                <span className="offer-badge">{t('buy_1_get_1')}</span>
                <div className="mt-auto">
                  <Link to="/menu"><button className="btn-brand w-100">{t('claim_offer')}</button></Link>
                </div>
              </div>
            </Col>

            <Col xs={12} md={6} lg={4}>
              <div className="offer-card text-center" data-aos="zoom-in" data-aos-delay="300">
                <img src="https://images.unsplash.com/photo-1516100882582-96c3a05fe590?w=400&h=300&fit=crop" alt={t('italian_pasta')} />
                <h3>{t('italian_pasta')}</h3>
                <span className="offer-badge">{t('only_99')}</span>
                <div className="mt-auto">
                  <Link to="/menu"><button className="btn-brand w-100">{t('claim_offer')}</button></Link>
                </div>
              </div>
            </Col>

          </Row>
        </Container>
      </section>

      {/* ===== PROMO TEXT SECTION ===== */}
      <section className="promo section-padding">
        <Container>
          <div className="promo-content mx-auto" data-aos="zoom-in">
            <h2>{t('delivered_faster')}</h2>
            <p>
              {t('experience_freshness')}
            </p>
            <Link to="/menu">
              <button className="btn-brand btn-lg">{t('order_now')}</button>
            </Link>
          </div>
        </Container>
      </section>

      {/* ── PARTNER BANNER ── */}
      <section style={{
        background: 'linear-gradient(135deg, #111 0%, #1a0d00 50%, #111 100%)',
        borderTop: '1px solid rgba(255,100,0,0.15)',
        borderBottom: '1px solid rgba(255,100,0,0.15)',
        padding: '60px 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#ff6400', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{t('join_foodexpress') || 'Join FoodExpress'}</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: 10 }}>
            {t('grow_with_us')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
            {t('grow_with_us_desc') || 'Whether you own a restaurant or want to earn by delivering — FoodExpress has a place for you.'}
          </p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>

            {/* Restaurant Card */}
            <Link to="/partner" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,100,0,0.25)',
                borderRadius: 20, padding: '32px 36px', minWidth: 260, cursor: 'pointer',
                transition: 'all 0.25s', textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ fontSize: '2.5rem', marginBottom: 14 }}>🏪</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>{t('register_restaurant')}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginBottom: 18, lineHeight: 1.6 }}>
                  {t('register_restaurant_desc')}
                </div>
                <span style={{
                  display: 'inline-block', background: 'linear-gradient(135deg, #ff6400, #ff8c00)',
                  color: '#fff', padding: '8px 20px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700,
                }}>{t('partner_with_us_btn')}</span>
              </div>
            </Link>

            {/* Delivery Card */}
            <Link to="/delivery-join" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20, padding: '32px 36px', minWidth: 260, cursor: 'pointer',
                transition: 'all 0.25s', textAlign: 'left',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(255,100,0,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 14 }}>🛵</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>{t('deliver_with_us')}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginBottom: 18, lineHeight: 1.6 }}>
                  {t('become_rider_desc')}
                </div>
                <span style={{
                  display: 'inline-block', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
                  color: '#fff', padding: '8px 20px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700,
                }}>{t('become_rider_btn')}</span>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ── QR CODE SECTION ── */}
      <section className="section-padding" style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={7} data-aos="fade-right">
              <h2 className="fw-bold mb-3" style={{ fontSize: '2.5rem', color: '#fff' }}>
                {t('scan_to_order') || 'Scan to Order on the Go!'} 📱
              </h2>
              <p className="lead-text text-secondary mb-4">
                {t('qr_desc') || 'Take FoodExpress with you. Scan the QR code to open our website on your smartphone and enjoy seamless ordering from anywhere.'}
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <div className="bg-dark p-3 rounded-4 border border-secondary d-flex align-items-center gap-3">
                  <div className="bg-white p-2 rounded-3">
                    <QRCodeSVG value="https://foodexpress-official.onrender.com/" size={120} level="H" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1 text-white">{t('scan_me') || 'Scan Me'}</h6>
                    <small className="text-secondary">{t('open_instantly') || 'Opens instantly on your phone'}</small>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={5} className="text-center" data-aos="fade-left">
              <div className="position-relative d-inline-block">
                <img 
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80" 
                  alt="Mobile App" 
                  className="rounded-5 shadow-lg img-fluid" 
                  style={{ maxWidth: '280px', border: '8px solid #1a1a1a' }} 
                />
                <div className="position-absolute top-50 start-50 translate-middle" style={{ zIndex: 1 }}>
                   <div className="bg-brand rounded-circle p-3 shadow-lg" style={{ animation: 'pulse 2s infinite' }}>
                      <i className="fa-solid fa-qrcode fs-2 text-white"></i>
                   </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
