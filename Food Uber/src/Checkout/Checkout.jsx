import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Checkout.css";
import { toast } from 'react-toastify';
import { CartContext } from "../context/CartContext";
import { useNotifications } from "../context/NotificationContext";
import Navbar from "../Navbar/Navbar";
import Footer from "../footer";
import { useTranslation } from "react-i18next";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, total, clearCart, removeItem } = useContext(CartContext);
  const { addNotification } = useNotifications();
  const { t } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLabel, setCouponLabel] = useState("");

  // ── Form fields state ──
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [errors, setErrors] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading,    setPaymentLoading]    = useState(false);

  // ── Card fields state ──
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "", name: "" });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    if (value.trim()) setErrors((prev) => ({ ...prev, [id]: false }));
  };

  const groupedCart = cart.reduce((acc, item) => {
    const existing = acc.find(i => i.name === item.name);
    if (existing) {
      existing.qty += 1;
      existing.totalPrice += item.price;
      if (item.isFree) existing.freeCount = (existing.freeCount || 0) + 1;
    } else {
      acc.push({ ...item, qty: 1, totalPrice: item.price, freeCount: item.isFree ? 1 : 0 });
    }
    return acc;
  }, []);

  const handleApplyCoupon = () => {
    const COUPONS = {
      'WELCOME50': { pct: 0.5,  label: '50% OFF' },
      'OFFER20':   { pct: 0.2,  label: '20% OFF' },
      'FIRST30':   { pct: 0.3,  label: '30% OFF' },
      'SAVE15':    { pct: 0.15, label: '15% OFF' },
      'FLAT100':   { flat: 100, label: '₹100 OFF' },
      'NEWUSER':   { pct: 0.25, label: '25% OFF' },
      'FESTIVE25': { pct: 0.25, label: '25% FESTIVE OFF' },
    };
    const code = coupon.toUpperCase();
    const found = COUPONS[code];
    if (found) {
      const d = found.flat ? Math.min(found.flat, total) : total * found.pct;
      setDiscount(d);
      setCouponApplied(true);
      setCouponLabel(found.label);
      toast.success(`🎉 Coupon Applied! ${found.label}`);
    } else {
      setDiscount(0);
      setCouponApplied(false);
      setCouponLabel("");
      toast.error("Invalid Coupon Code.");
    }
  };

  const finalTotal = total - discount;

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.warning("Empty Cart! Add some items first.");
      return;
    }

    // ── Validation ──
    const newErrors = {};
    if (!form.name.trim())    newErrors.name    = true;
    if (!form.phone.trim())   newErrors.phone   = true;
    if (!form.address.trim()) newErrors.address = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("⚠️ Please fill Name, Phone & Address!");
      return;
    }

    if (paymentMethod !== "cod") {
      setShowPaymentModal(true);
    } else {
      finalizeOrder();
    }
  };

  const finalizeOrder = async () => {
    
    // Extract restaurantId from first item in cart
    const restaurantId = cart[0]?.restaurantId || null;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const orderData = {
        userId: user._id || null,
        restaurantId: restaurantId,
        customer: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            paymentMethod: paymentMethod
        },
        items: cart,
        totalAmount: finalTotal,
        discountApplied: discount,
        status: "New",
        date: new Date().toISOString()
    };

    let createdOrderId = null;

    try {
        const response = await fetch("http://localhost:8000/api/save-order/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData)
        });
        const data = await response.json();
        if (data.status === "success") {
            createdOrderId = data.orderId;
            toast.success("🎉 Order Placed & Saved! Tracking delivery...");
            addNotification({ title: 'Order Placed! 🛵', message: `Your order of ₹${finalTotal} is confirmed. Estimated delivery in 30 mins.`, type: 'order' });
            
            // Send notification to restaurant
            if (restaurantId) {
                fetch("http://localhost:8000/api/notifications/send/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        targetId: restaurantId,
                        role: 'partner',
                        title: 'New Order Received!',
                        message: `Order #${(data.orderId || '').slice(-6).toUpperCase()} received from ${form.name.trim()}.`,
                        type: 'order'
                    })
                }).catch(console.error);
            }
        } else {
            toast.error("⚠️ Order placed but failed to save in Database.");
        }
    } catch (error) {
        console.error("DB Error:", error);
        toast.warning("🎉 Order Placed! (Offline mode, couldn't connect to DB)");
    }
    
    // Save delivery details for tracking page
    localStorage.setItem("delivery_info", JSON.stringify({
      orderId: createdOrderId,
      name:    form.name.trim(),
      phone:   form.phone.trim(),
      address: form.address.trim(),
    }));

    // ── Update Order History ──
    const pastOrders = JSON.parse(localStorage.getItem("past_orders") || "[]");
    pastOrders.push({
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        total: finalTotal,
        items: cart
    });
    localStorage.setItem("past_orders", JSON.stringify(pastOrders));

    clearCart();
    navigate("/tracking");
  };

  const cancelOrder = () => {
    if (cart.length > 0) {
      clearCart();
      toast.error("❌ Entire Order Cancelled!");
    }
    navigate("/");
  };

  const handleMockPayment = () => {
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setShowPaymentModal(false);
      toast.success("💳 Payment Successful!");
      finalizeOrder();
    }, 2000);
  };


  return (
    <>
      <Navbar />
      <div className="checkout-page container py-5">

        {/* Order Progress Bar */}
        <div className="checkout-progress mb-5">
          {['Cart', 'Details', 'Payment', 'Confirm'].map((step, i) => (
            <div key={step} className={`progress-step ${i < 2 ? 'done' : i === 2 ? 'active' : ''}`}>
              <div className="progress-step-circle">{i < 2 ? '✓' : i + 1}</div>
              <span>{step}</span>
              {i < 3 && <div className="progress-step-line" />}
            </div>
          ))}
        </div>

        <h2 className="text-center mb-4 fw-bold">{t('checkout_title')}</h2>

      <div className="row g-4">

        {/* ===== Order Summary ===== */}
        <div className="col-lg-7">
          <div className="checkout-card p-4 h-100 border-0" data-aos="fade-right" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)" }}>
            <h4 className="mb-4 fw-bold pb-2 border-bottom border-secondary text-white"><i className="fa-solid fa-bag-shopping me-2" style={{ color: "var(--brand-primary)" }}></i>{t('order_summary')}</h4>

            {groupedCart.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <i className="fa-solid fa-cart-arrow-down fa-3x mb-3"></i>
                <p className="fs-5">Your cart feels a little empty.</p>
              </div>
            ) : (
              <div className="custom-scrollbar" style={{ maxHeight: '430px', overflowY: 'auto', paddingRight: '10px' }}>
                {groupedCart.map((item, i) => {
                  const imgSrc = item.img && item.img.startsWith("http") ? item.img : `/${item.img}`;
                  return (
                    <div key={i} className="d-flex align-items-center justify-content-between mb-3 bg-dark p-3 rounded-4 shadow-sm border-0 transition-hover" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="d-flex align-items-center gap-3">
                        {item.img && (
                          <img src={imgSrc} alt={item.name} className="rounded-3 object-fit-cover shadow-sm" style={{ width: '60px', height: '60px' }} />
                        )}
                        <div>
                          <h6 className="fw-bold mb-1 text-white">{item.name}</h6>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-secondary rounded-pill shadow-sm text-light">Qty: {item.qty}</span>
                            {item.freeCount > 0 && <span className="badge bg-success rounded-pill shadow-sm"><i className="fa-solid fa-gift me-1"></i>{item.freeCount} Free</span>}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex flex-column align-items-end">
                        <span className="fw-bold fs-5 text-success mb-2">₹{item.totalPrice}</span>
                        <button 
                          className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold" 
                          onClick={() => removeItem(item.name)}
                          title="Remove item"
                        >
                          <i className="fa-solid fa-trash me-1"></i> {t('remove') || 'Remove'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <hr className="my-4 border-secondary" />

            {/* Promo Code Section */}
            <div className="mb-4">
              <div className="input-group shadow-sm">
                <input 
                  type="text" 
                  className="form-control bg-dark text-white border-secondary" 
                  placeholder={t('promo_code_placeholder') || "Enter Promo Code"}
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                <button className="btn btn-outline-primary fw-bold" onClick={handleApplyCoupon}>{t('apply') || 'Apply'}</button>
              </div>
              <small className="text-secondary mt-1 d-block">Try: WELCOME50, OFFER20, FIRST30, SAVE15, FLAT100, NEWUSER, FESTIVE25</small>

              {/* Coupon success badge */}
              {couponApplied && (
                <div className="coupon-success-badge mt-2">
                  <span>✅ <strong>{couponLabel}</strong> Applied!</span>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-between mb-2 text-secondary">
              <span>{t('subtotal')}</span>
              <span>₹{total}</span>
            </div>
            {discount > 0 && (
              <div className="d-flex justify-content-between mb-2 text-success">
                <span>{t('discount') || 'Discount'}</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <h5 className="d-flex justify-content-between total-text mt-3 fw-bold text-white">
              <span>{t('total')}</span>
              <span>₹{finalTotal}</span>
            </h5>
            {discount > 0 && (
              <div className="savings-banner mt-3">
                <i className="fa-solid fa-piggy-bank me-2"></i>
                You saved <strong>₹{discount.toFixed(0)}</strong> on this order! 🎉
              </div>
            )}
          </div>
        </div>

        {/* ===== Address + Payment ===== */}
        <div className="col-lg-5">
          <div className="checkout-card p-4 h-100 d-flex flex-column border-0" data-aos="fade-left" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)" }}>

            {/* Address */}
            <h4 className="mb-4 fw-bold pb-2 border-bottom border-secondary text-white"><i className="fa-solid fa-map-location-dot me-2" style={{ color: "var(--brand-primary)" }}></i>{t('billing_details')}</h4>
            
            <div className="mb-3">
              <div className="form-floating">
                <input
                  type="text"
                  className={`form-control bg-dark text-white shadow-sm rounded-3 ${errors.name ? 'border-danger' : 'border-secondary'}`}
                  id="name"
                  placeholder={t('full_name')}
                  value={form.name}
                  onChange={handleChange}
                />
                <label htmlFor="name" className="text-secondary">{t('full_name')} <span className="text-danger">*</span></label>
              </div>
              {errors.name && <small className="text-danger ms-1">⚠️ {t('name_required') || 'Name is required'}</small>}
            </div>
            
            <div className="mb-3">
              <div className="form-floating">
                <input
                  type="tel"
                  className={`form-control bg-dark text-white shadow-sm rounded-3 ${errors.phone ? 'border-danger' : 'border-secondary'}`}
                  id="phone"
                  placeholder={t('phone')}
                  value={form.phone}
                  onChange={handleChange}
                />
                <label htmlFor="phone" className="text-secondary">{t('phone')} <span className="text-danger">*</span></label>
              </div>
              {errors.phone && <small className="text-danger ms-1">⚠️ {t('phone_required') || 'Phone number is required'}</small>}
            </div>
            
            <div className="mb-4">
              <div className="form-floating">
                <textarea
                  className={`form-control bg-dark text-white shadow-sm rounded-3 ${errors.address ? 'border-danger' : 'border-secondary'}`}
                  id="address"
                  placeholder={t('address')}
                  style={{ height: '100px' }}
                  value={form.address}
                  onChange={handleChange}
                />
                <label htmlFor="address" className="text-secondary">{t('address')} <span className="text-danger">*</span></label>
              </div>
              {errors.address && <small className="text-danger ms-1">⚠️ {t('address_required') || 'Address is required'}</small>}
            </div>

            {/* Payment */}
            <h4 className="mb-3 fw-bold pb-2 border-bottom border-secondary text-white"><i className="fa-solid fa-wallet me-2" style={{ color: "var(--brand-primary)" }}></i>{t('payment_method')}</h4>

            <div className="payment-options-grid mb-4 d-flex flex-column gap-2">
              {[
                { id: 'upi', icon: 'fa-brands fa-google-pay', title: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
                { id: 'card', icon: 'fa-regular fa-credit-card', title: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
                { id: 'wallet', icon: 'fa-solid fa-wallet', title: 'Wallets', desc: 'Amazon Pay, Mobikwik' },
                { id: 'netbanking', icon: 'fa-solid fa-building-columns', title: 'Netbanking', desc: 'All Indian Banks' },
                { id: 'cod', icon: 'fa-solid fa-money-bill-wave', title: 'Pay on Delivery', desc: 'Cash or UPI at doorstep' },
              ].map(method => (
                <div 
                  key={method.id}
                  className={`p-3 rounded-3 shadow-sm transition-hover d-flex align-items-center gap-3 ${paymentMethod === method.id ? 'active-method' : 'bg-dark text-white'}`}
                  onClick={() => setPaymentMethod(method.id)}
                  style={{ 
                    cursor: "pointer", 
                    border: paymentMethod === method.id ? '1px solid var(--brand-primary)' : '1px solid #444',
                    background: paymentMethod === method.id ? 'rgba(255,107,53,0.1)' : 'transparent'
                  }}
                >
                  <div className="payment-icon-wrapper" style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', 
                    background: paymentMethod === method.id ? 'var(--brand-primary)' : '#333',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                    color: paymentMethod === method.id ? '#fff' : '#aaa'
                  }}>
                    <i className={method.icon}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-0 fw-bold" style={{ color: paymentMethod === method.id ? 'var(--brand-primary)' : '#fff' }}>{method.title}</h6>
                    <small className="text-secondary" style={{ fontSize: '12px' }}>{method.desc}</small>
                  </div>
                  <div className="payment-radio">
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${paymentMethod === method.id ? 'var(--brand-primary)' : '#555'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {paymentMethod === method.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--brand-primary)' }}></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Payment Details */}
            {paymentMethod === 'upi' && (
              <div className="payment-details-box p-3 mb-4 rounded-3 border border-secondary bg-dark animate-fade-in" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <h6 className="fw-bold text-white mb-3"><img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" style={{height:'18px', marginRight: '8px'}}/>Pay via UPI</h6>
                <div className="input-group shadow-sm">
                  <input type="text" className="form-control bg-dark text-white border-secondary" placeholder="Enter your UPI ID (e.g. name@okhdfcbank)" />
                  <span className="input-group-text bg-secondary text-white border-secondary border-start-0 fw-bold">@upi</span>
                </div>
                <button className="btn btn-outline-success btn-sm mt-3 w-100 rounded-pill fw-bold">Verify & Pay</button>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="payment-details-box p-3 mb-4 rounded-3 border border-secondary bg-dark animate-fade-in" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                 <h6 className="fw-bold text-white mb-3">Link Your Wallet</h6>
                 <div className="d-flex gap-2 justify-content-between">
                   <button className="btn btn-outline-light w-100 py-2 d-flex align-items-center justify-content-center gap-2"><img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" style={{height:'12px'}}/> Paytm</button>
                   <button className="btn btn-outline-light w-100 py-2 d-flex align-items-center justify-content-center gap-2"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Amazon_Pay_logo.svg/2560px-Amazon_Pay_logo.svg.png" alt="Amazon Pay" style={{height:'16px'}}/> Amazon Pay</button>
                 </div>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="payment-details-box p-3 mb-4 rounded-3 border border-secondary bg-dark animate-fade-in" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                 <h6 className="fw-bold text-white mb-3">Select Your Bank</h6>
                 <select className="form-select bg-dark text-white border-secondary shadow-sm">
                   <option value="">Select Bank</option>
                   <option value="hdfc">HDFC Bank</option>
                   <option value="icici">ICICI Bank</option>
                   <option value="sbi">State Bank of India</option>
                   <option value="axis">Axis Bank</option>
                 </select>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="payment-details-box p-3 mb-4 rounded-3 border border-secondary bg-dark animate-fade-in" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-secondary p-2 rounded-circle" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-hand-holding-dollar fs-5 text-warning"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold text-white mb-1">Pay on Delivery</h6>
                    <small className="text-secondary" style={{ fontSize: '12px' }}>Please keep exact change or have your UPI app ready when our delivery partner arrives.</small>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="card-payment-form p-4 mb-4 rounded-4 shadow-sm animate-fade-in" data-aos="fade-down" style={{ background: "rgba(0,0,0,0.4)", animation: 'fadeIn 0.3s ease-in-out' }}>
                <h6 className="mb-4 fw-bold text-white"><i className="fa-solid fa-lock me-2 text-success"></i>Secure Payment Details</h6>
                
                {/* Visual Credit Card */}
                <div className="credit-card-visual mb-4 p-3 rounded-4 shadow-lg text-white position-relative overflow-hidden" 
                     style={{ 
                       background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                       height: "180px", border: "1px solid rgba(255,255,255,0.1)" 
                     }}>
                  <div className="position-absolute top-0 end-0 p-3 opacity-50"><i className="fa-brands fa-cc-visa fs-1"></i></div>
                  <div className="mt-2 mb-4"><i className="fa-solid fa-microchip fs-3 text-warning"></i></div>
                  <h4 className="font-monospace mb-3 letter-spacing-2" style={{ letterSpacing: '2px' }}>
                    {cardDetails.number || "#### #### #### ####"}
                  </h4>
                  <div className="d-flex justify-content-between align-items-end mt-4">
                    <div>
                      <small className="text-uppercase" style={{ fontSize: '10px', opacity: 0.8 }}>Cardholder</small>
                      <div className="fw-bold text-truncate" style={{ maxWidth: '150px' }}>{cardDetails.name || "YOUR NAME"}</div>
                    </div>
                    <div className="text-end">
                      <small className="text-uppercase" style={{ fontSize: '10px', opacity: 0.8 }}>Expires</small>
                      <div className="fw-bold">{cardDetails.expiry || "MM/YY"}</div>
                    </div>
                  </div>
                </div>

                {/* Card Inputs */}
                <input 
                  type="text" 
                  maxLength="19"
                  className="form-control mb-3 bg-dark border-secondary text-white shadow-sm rounded-3 py-2 font-monospace" 
                  placeholder="Card Number" 
                  value={cardDetails.number}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                    setCardDetails({...cardDetails, number: val});
                  }}
                />
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <input 
                      type="text" 
                      maxLength="5"
                      className="form-control bg-dark border-secondary text-white shadow-sm rounded-3 py-2" 
                      placeholder="MM/YY" 
                      value={cardDetails.expiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if(val.length >= 2) val = val.substring(0,2) + '/' + val.substring(2,4);
                        setCardDetails({...cardDetails, expiry: val});
                      }}
                    />
                  </div>
                  <div className="col-6">
                    <input 
                      type="password" 
                      maxLength="3"
                      className="form-control bg-dark border-secondary text-white shadow-sm rounded-3 py-2" 
                      placeholder="CVV" 
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})}
                    />
                  </div>
                </div>
                <input 
                  type="text" 
                  className="form-control bg-dark border-secondary text-white shadow-sm rounded-3 py-2 text-uppercase" 
                  placeholder="Cardholder Name" 
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                />
              </div>
            )}

            <div className="mt-auto">
              <button 
                className="btn-brand w-100 place-btn py-3 fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2 fs-5" 
                onClick={placeOrder}
              >
                {t('place_order')} <i className="fa-solid fa-arrow-right-long mt-1"></i>
              </button>
              <button 
                className="btn btn-outline-danger w-100 mt-3 py-2 fw-bold rounded-pill" 
                onClick={cancelOrder}
              >
                {t('cancel_order') || 'Cancel Order'}
              </button>

            </div>
          </div>
        </div>

      </div>
    </div>
    <Footer />

    {/* ── Razorpay Mock Modal ── */}
    {showPaymentModal && (
      <div className="payment-overlay">
        <div className="payment-modal">
          <div className="pmodal-header">
            <div className="pmodal-logo">
              <span className="pmodal-text">Razorpay</span>
            </div>
            <button className="pmodal-close" onClick={() => setShowPaymentModal(false)}>✕</button>
          </div>
          <div className="pmodal-body">
            <div className="pmodal-amount-box">
               <span className="pmodal-label">PAYMENT TO</span>
               <div className="pmodal-vendor">FoodExpress Portal</div>
               <div className="pmodal-amount">₹{finalTotal.toLocaleString()}</div>
            </div>
            
            <div className="pmodal-method">
              <div className="pmodal-method-item active">
                <i className="fa-solid fa-credit-card"></i>
                <span>Card / UPI / NetBanking</span>
                <i className="fa-solid fa-chevron-right ms-auto"></i>
              </div>
            </div>

            <div className="pmodal-info">
              <i className="fa-solid fa-shield-halved"></i>
              Secure payments by Razorpay. Trusted by 10M+ businesses.
            </div>
          </div>
          <div className="pmodal-footer">
            <button className="pmodal-pay-btn" onClick={handleMockPayment} disabled={paymentLoading}>
              {paymentLoading ? (
                <><span className="pmodal-spinner"></span> Processing...</>
              ) : (
                `PAY ₹${finalTotal.toLocaleString()}`
              )}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
