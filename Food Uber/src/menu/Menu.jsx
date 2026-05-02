import React, { useState, useContext } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import "./Menu.css";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { MenuContext } from "../context/MenuContext";
import { useTranslation } from "react-i18next";

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useContext(CartContext);
  const { categories, offers, allProducts } = useContext(MenuContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const filteredProducts = searchTerm
    ? allProducts.filter(item => {
      const itemName = item.displayName || item.name;
      return itemName.toLowerCase().includes(searchTerm.toLowerCase());
    })
    : [];

  return (
    <>
      <Navbar />

      {/* MENU HEADER / HERO BACKGROUND */}
      <div className="menu-hero pb-4">
        <Container>
          <div className="menu-hero-content text-center pb-4" data-aos="fade-down" style={{ marginTop: '80px' }}>
            <h1 className="fw-bold display-4 text-white text-shadow mb-3">{t('delicious_menu')}</h1>
            <p className="text-light lead mx-auto text-shadow mb-4" style={{ maxWidth: "600px" }}>
              {t('menu_desc')}
            </p>

            {/* SEARCH BAR (GLOBAL) */}
            <div className="mx-auto position-relative" style={{ maxWidth: '600px' }}>
              <input
                type="text"
                className="form-control form-control-lg rounded-pill ps-4 pe-5 shadow border-0"
                placeholder={t('menu_search_placeholder')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (selectedCategory) setSelectedCategory(null);
                }}
              />
              <i className="fa-solid fa-magnifying-glass position-absolute top-50 end-0 translate-middle-y me-4 text-muted fs-5"></i>
            </div>
          </div>
        </Container>
      </div>

      <div className="menu-page-container" style={{ minHeight: '60vh' }}>
        <Container className="py-5">

          {/* SEARCH RESULTS VIEW */}
          {searchTerm && (
            <>
              <div className="d-flex align-items-center mb-4 border-bottom pb-3">
                <h3 className="fw-bold mb-0">{t('search_results_for')} "{searchTerm}"</h3>
                <Badge bg="dark" className="ms-3 fs-6 rounded-pill" style={{ backgroundColor: 'var(--brand-primary)' }}>
                  {filteredProducts.length} {t('items_found')}
                </Badge>
              </div>

              {filteredProducts.length > 0 ? (
                <Row className="g-4">
                  {filteredProducts.map((item, i) => {
                    const imgSrc = item.img.startsWith("http") ? item.img : `/${item.img}`;
                    return (
                      <Col xs={12} sm={6} md={4} lg={3} key={`search-${i}`}>
                        <Card
                          className="h-100 shadow-sm border-0 item-card-hover"
                          onClick={() => navigate(`/product/${encodeURIComponent(item.name)}`)}
                          style={{ cursor: "pointer", borderRadius: "16px", overflow: "hidden" }}
                        >
                          <div className="position-relative">
                            <Card.Img variant="top" src={imgSrc} style={{ height: "200px", objectFit: "cover" }} />
                            {item.offer && (
                              <Badge bg="danger" className="position-absolute top-0 start-0 m-2 px-3 py-2">
                                {item.offer}
                              </Badge>
                            )}
                          </div>
                          <Card.Body className="d-flex flex-column px-3 py-3">
                            <Card.Title
                              className="fw-bold fs-6 mb-1 text-truncate"
                              title={item.displayName || item.name}
                            >
                              {item.displayName || item.name}
                            </Card.Title>

                            <div className="mb-3 mt-auto">
                              {item.discountedPrice ? (
                                <div>
                                  <span className="fw-bold fs-5 text-success">₹{item.discountedPrice}</span>
                                  <del className="text-muted fs-6 ms-2">₹{item.price}</del>
                                </div>
                              ) : (
                                <span className="fw-bold fs-5 text-success">₹{item.price}</span>
                              )}
                            </div>

                            <button
                              className="btn-brand btn-sm w-100 fw-bold rounded-pill shadow-sm"
                              style={{ padding: "8px 0" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(item);
                              }}
                            >
                              <i className="fa-solid fa-cart-plus me-2"></i> {t('add_to_cart')}
                            </button>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              ) : (
                <div className="text-center py-5 text-secondary">
                  <i className="fa-solid fa-pizza-slice fa-3x mb-3 text-light"></i>
                  <h4>{t('no_dishes_found')}</h4>
                  <Button variant="outline-light" className="mt-3 rounded-pill" onClick={() => setSearchTerm('')}>{t('clear_search')}</Button>
                </div>
              )}
            </>
          )}

          {/* CATEGORY + OFFER CARDS VIEW */}
          {!selectedCategory && !searchTerm && (
            <>

              {/* ── UNIQUE FEATURES STRIP ── */}
              <div className="mb-5">
                <h3 className="fw-bold mb-1">✨ {t('try_something_different')}</h3>
                <p className="text-secondary mb-3" style={{ fontSize: '14px' }}>Features exclusive to FoodExpress — not on Zomato, not on Swiggy.</p>
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}>
                  {[
                    { emoji: '🎁', title: t('mystery_box'), desc: t('mystery_box_desc'), link: '/mystery-box', gradient: 'linear-gradient(135deg,#ff00cc,#3333ff)' },
                    { emoji: '🔥', title: t('food_tinder'), desc: t('food_tinder_desc'), link: '/food-tinder', gradient: 'linear-gradient(135deg,#ff416c,#ff4b2b)' },
                    { emoji: '💪', title: t('macro_matcher'), desc: t('macro_matcher_desc'), link: '/macro-matcher', gradient: 'linear-gradient(135deg,#00ff88,#00ccff)' },
                    { emoji: '👥', title: t('group_order'), desc: t('group_order_desc'), link: '/group-cart', gradient: 'linear-gradient(135deg,#00aaff,#aa00ff)' },
                  ].map((f, i) => (
                    <a
                      key={i}
                      href={f.link}
                      style={{
                        minWidth: '180px', borderRadius: '20px', padding: '20px 16px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        textDecoration: 'none', color: 'white', display: 'flex',
                        flexDirection: 'column', gap: '8px', transition: 'transform 0.2s, box-shadow 0.2s',
                        flexShrink: 0,
                      }}
                      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4)'; }}
                      onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <span style={{ fontSize: '2rem' }}>{f.emoji}</span>
                      <span style={{ fontWeight: 800, fontSize: '1rem' }}>{f.title}</span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{f.desc}</span>
                      <span style={{
                        marginTop: '4px', display: 'inline-block', padding: '5px 14px',
                        borderRadius: '50px', background: f.gradient, fontSize: '12px',
                        fontWeight: 700, color: 'white', alignSelf: 'flex-start'
                      }}>{t('try_now')} →</span>
                    </a>
                  ))}
                </div>
              </div>

              <h3 className="fw-bold mb-4 border-bottom pb-2">{t('categories')}</h3>
              <Row className="g-4 mb-5">
                {Object.keys(categories).map((cat, i) => {
                  const categoryImage = categories[cat][0]?.img || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop`;
                  const categoryImgSrc = categoryImage.startsWith("http") ? categoryImage : `/${categoryImage}`;
                  return (
                    <Col xs={12} sm={6} md={4} lg={3} key={`cat-${i}`}>
                      <Card
                        className="h-100 shadow-sm border-0 category-card-hover"
                        data-aos="zoom-in"
                        data-aos-delay={`${i * 50}`}
                        onClick={() => setSelectedCategory(cat)}
                        style={{ cursor: "pointer", borderRadius: "16px", overflow: "hidden" }}
                      >
                        <Card.Img variant="top" src={categoryImgSrc} style={{ height: "180px", objectFit: "cover" }} />
                        <Card.Body className="text-center">
                          <Card.Title className="fw-bold">{cat}</Card.Title>
                          <Button variant="outline-light" className="mt-2 rounded-pill px-4 fw-bold w-100">{t('view_menu')}</Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>

              <h3 className="fw-bold mb-4 border-bottom pb-2"><i className="fa-solid fa-fire text-danger me-2"></i>{t('special_offers')}</h3>
              <Row className="g-4">
                {Object.keys(offers).map((offer, i) => {
                  const offerImage = offers[offer][0]?.img || `https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop`;
                  const offerImgSrc = offerImage.startsWith("http") ? offerImage : `/${offerImage}`;
                  return (
                    <Col xs={12} sm={6} md={4} lg={3} key={`offer-${i}`}>
                      <Card
                        className="h-100 shadow-sm border-0 offer-card-hover"
                        data-aos="zoom-in"
                        data-aos-delay={`${i * 50}`}
                        onClick={() => setSelectedCategory(offer)}
                        style={{ cursor: "pointer", borderRadius: "16px", overflow: "hidden" }}
                      >
                        <div className="position-relative">
                          <Card.Img variant="top" src={offerImgSrc} style={{ height: "180px", objectFit: "cover" }} />
                          <Badge bg="danger" className="position-absolute top-0 start-0 m-2 px-3 py-2 fs-6 shadow-sm">
                            {offer}
                          </Badge>
                        </div>
                        <Card.Body className="text-center">
                          <Card.Title className="fw-bold text-danger">{offer}</Card.Title>
                          <Button variant="outline-danger" className="mt-2 rounded-pill px-4 fw-bold w-100">{t('view_offers')}</Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </>
          )}

          {/* INDIVIDUAL ITEMS VIEW */}
          {selectedCategory && !searchTerm && (
            <>
              <Button
                variant="light"
                className="mb-4 rounded-pill px-4 shadow-sm"
                onClick={() => setSelectedCategory(null)}
              >
                <i className="fa-solid fa-arrow-left me-2"></i>{t('back_to_categories')}
              </Button>

              <div className="d-flex align-items-center mb-5 border-bottom border-secondary pb-3" data-aos="fade-down">
                <h2 className="fw-bold mb-0" style={{ color: "var(--brand-primary)" }}>
                  {selectedCategory}
                </h2>
                <Badge bg="warning" text="dark" className="ms-3 px-3 py-2 fs-6 rounded-pill">
                  {offers[selectedCategory] ? t('special_offers') : t('top_picks')}
                </Badge>
              </div>

              <Row className="g-4">
                {(categories[selectedCategory] || offers[selectedCategory]).map((item, i) => {
                  const isOffer = !!offers[selectedCategory];
                  const imgSrc = item.img.startsWith("http") ? item.img : `/${item.img}`;
                  return (
                    <Col xs={12} sm={6} md={4} lg={3} key={i}>
                      <Card
                        className="h-100 shadow-sm border-0 item-card-hover"
                        data-aos="fade-up"
                        data-aos-delay={`${(i % 3) * 50}`}
                        onClick={() => navigate(`/product/${encodeURIComponent(item.name)}`)}
                        style={{ cursor: "pointer", borderRadius: "16px", overflow: "hidden" }}
                      >
                        <div className="position-relative">
                          <Card.Img variant="top" src={imgSrc} style={{ height: "200px", objectFit: "cover" }} />
                          {isOffer && (
                            <Badge bg="danger" className="position-absolute top-0 start-0 m-2 px-3 py-2">
                              {item.offer || selectedCategory}
                            </Badge>
                          )}
                        </div>
                        <Card.Body className="d-flex flex-column px-3 py-3">
                          <Card.Title
                            className="fw-bold fs-6 mb-1 text-truncate"
                            title={item.displayName || item.name}
                          >
                            {item.displayName || item.name}
                          </Card.Title>

                          <div className="mb-3 mt-auto">
                            {isOffer && item.discountedPrice ? (
                              <div>
                                <span className="fw-bold fs-5 text-success">₹{item.discountedPrice}</span>
                                <del className="text-secondary fs-6 ms-2">₹{item.price}</del>
                              </div>
                            ) : (
                              <span className="fw-bold fs-5 text-success">₹{item.price}</span>
                            )}
                          </div>

                          <button
                            className="btn-brand btn-sm w-100 fw-bold rounded-pill shadow-sm"
                            style={{ padding: "8px 0" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item, isOffer ? selectedCategory : null);
                            }}
                          >
                            <i className="fa-solid fa-cart-plus me-2"></i> {t('add_to_cart')}
                          </button>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </>
          )}

        </Container>
      </div>
      <Footer />
    </>
  );
}
