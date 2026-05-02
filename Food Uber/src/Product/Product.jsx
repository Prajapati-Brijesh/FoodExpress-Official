import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MenuContext } from "../context/MenuContext";
import { CartContext } from "../context/CartContext";
import Navbar from "../Navbar/Navbar";
import Footer from "../footer";
import { useTranslation } from "react-i18next";
import "./Product.css";

function Product() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [product, setProduct] = useState(null);
  const [suggestedItems, setSuggestedItems] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  const { addToCart } = useContext(CartContext);
  const { allProducts } = useContext(MenuContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const foundProduct = allProducts.find((p) => p.name === name);
    if (foundProduct) {
      setProduct(foundProduct);
      
      const others = allProducts.filter((p) => p.name !== name);
      const shuffled = [...others].sort(() => 0.5 - Math.random());
      setSuggestedItems(shuffled.slice(0, 4));

      const storedReviews = JSON.parse(localStorage.getItem(`reviews_${name}`) || "[]");
      if (storedReviews.length === 0) {
        setReviews([
          { user: "Priya S.", rating: 5, text: "Absolutely loved it! Very fresh and tasty.", date: new Date().toLocaleDateString() },
          { user: "Rahul K.", rating: 4, text: "Good portion size, arrived hot.", date: new Date().toLocaleDateString() }
        ]);
      } else {
        setReviews(storedReviews);
      }

    }
  }, [name]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;
    const newReviewObj = { user: "You", rating, text: newReview, date: new Date().toLocaleDateString() };
    const updatedReviews = [newReviewObj, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${name}`, JSON.stringify(updatedReviews));
    setNewReview("");
    setRating(5);
  };

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="container py-5 text-center" style={{ minHeight: "60vh" }}>
          <h2>{t('product_not_found')}</h2>
          <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>{t('go_home')}</button>
        </div>
        <Footer />
      </>
    );
  }

  const finalPrice = product.discountedPrice || product.price;

  return (
    <>
      <Navbar />
      <div className="product-page-wrapper">
        <div className="product-page-container container py-5">
          <button className="btn btn-dark mb-4" onClick={() => navigate(-1)}>← {t('back')}</button>
          <div className="row g-5">
            <div className="col-md-6" data-aos="fade-right">
              <img src={product.img} alt={product.displayName || product.name} className="product-detail-img img-fluid" />
            </div>
            <div className="col-md-6 d-flex flex-column justify-content-center" data-aos="fade-left">
              <h1 className="product-title">{product.displayName || product.name}</h1>
              {product.offer && <span className="product-offer-badge">{product.offer}</span>}
              
              <div className="product-price-section mt-3">
                {product.discountedPrice ? (
                  <>
                    <span className="current-price">₹{product.discountedPrice}</span>
                    <span className="original-price ms-2 text-muted text-decoration-line-through">₹{product.price}</span>
                  </>
                ) : (
                  <span className="current-price">₹{product.price}</span>
                )}
              </div>
              
              <p className="product-description mt-3">
                Enjoy our delicious freshly prepared {product.displayName || product.name}. 
                Made with the finest ingredients to give you the best taste experience.
              </p>

              <div className="d-flex align-items-center mt-4">
                <div className="quantity-selector me-4 d-flex align-items-center" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '5px 15px' }}>
                  <button 
                    className="btn btn-sm fs-4" 
                    style={{ border: 'none', background: 'transparent' }} 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >-</button>
                  <span className="mx-3 fs-5 fw-bold">{quantity}</span>
                  <button 
                    className="btn btn-sm fs-4" 
                    style={{ border: 'none', background: 'transparent' }} 
                    onClick={() => setQuantity(q => q + 1)}
                  >+</button>
                </div>

                <button 
                  className="btn-brand btn-lg flex-grow-1 add-to-cart-btn"
                  onClick={() => addToCart({ name: product.name, price: finalPrice, img: product.img }, product.offer || null, quantity)}
                >
                  {t('add_to_cart')} ({quantity})
                </button>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-5 pt-5 border-top border-secondary">
            <h3 className="mb-4 fw-bold">{t('customer_reviews')} <i className="fa-solid fa-star text-warning"></i></h3>
            <div className="row">
              <div className="col-md-7">
                {reviews.length > 0 ? (
                  reviews.map((r, i) => (
                    <div key={i} className="review-card p-3 mb-3 rounded-4 shadow-sm" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold mb-0 text-white">{r.user}</h6>
                        <span className="text-secondary small">{r.date}</span>
                      </div>
                      <div className="text-warning mb-2">
                        {[...Array(5)].map((_, idx) => (
                          <i key={idx} className={`fa-${idx < r.rating ? 'solid' : 'regular'} fa-star`}></i>
                        ))}
                      </div>
                      <p className="mb-0 text-light">{r.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary">{t('no_reviews')}</p>
                )}
              </div>
              <div className="col-md-5">
                <div className="p-4 rounded-4 shadow-sm mt-4 mt-md-0" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
                  <h5 className="fw-bold mb-3 text-white">{t('write_review')}</h5>
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-3">
                      <label className="text-secondary mb-1">{t('your_rating')}</label>
                      <div className="fs-4 text-warning" style={{ cursor: 'pointer' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <i 
                            key={star} 
                            className={`fa-${star <= rating ? 'solid' : 'regular'} fa-star`}
                            onClick={() => setRating(star)}
                          ></i>
                        ))}
                      </div>
                    </div>
                    <div className="mb-3">
                      <textarea 
                        className="form-control bg-dark border-secondary text-white" 
                        rows="3" 
                        placeholder={t('review_placeholder')}
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold rounded-pill">{t('submit_review')}</button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Suggested Items / Drinks */}
          <div className="mt-5 pt-5 border-top">
            <h3 className="mb-4 fw-bold text-center">{t('frequently_ordered')}</h3>
            <div className="row g-4">
              {suggestedItems.map((item, idx) => {
                const itemPrice = item.discountedPrice || item.price;
                return (
                  <div className="col-12 col-sm-6 col-md-3" key={idx}>
                    <div 
                      className="item-card text-center p-3 h-100 shadow-sm rounded-4" 
                      style={{ cursor: "pointer", transition: "0.3s", backgroundColor: "white" }} 
                      onClick={() => navigate(`/product/${encodeURIComponent(item.name)}`)}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      <img 
                        src={item.img} 
                        alt={item.displayName || item.name} 
                        className="item-img img-fluid" 
                        style={{ height: "160px", width: "100%", objectFit: "cover", borderRadius: "12px", marginBottom: "12px" }} 
                      />
                      <h6 className="fw-bold text-dark">{item.displayName || item.name}</h6>
                      <p className="price text-success fw-bold mb-3">₹{itemPrice}</p>
                      
                      <button 
                        className="btn-brand btn-sm w-100"
                        style={{ padding: "8px 0" }}
                        onClick={(e) => {
                          e.stopPropagation(); 
                          addToCart({ name: item.name, price: itemPrice });
                        }}
                      >
                        {t('quick_add')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}

export default Product;
