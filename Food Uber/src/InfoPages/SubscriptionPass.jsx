import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer';

export default function SubscriptionPass() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success('Welcome to FoodExpress Pro! 🎉 Your benefits are now active.');
      setLoading(false);
    }, 2000);
  };

  return (
    <>
      <Navbar />
      <div className="pass-page">
        <div className="pass-hero">
          <h1>FoodExpress <span>PRO</span></h1>
          <p>Unlimited Free Delivery. Extra Discounts. Priority Support.</p>
        </div>

        <div className="pass-container">
          <div className="pass-card-grid">
            <div className="pass-card gold" data-aos="flip-left">
              <div className="pass-badge">MOST POPULAR</div>
              <h2>Monthly Pro</h2>
              <div className="pass-price">₹149 <span>/ month</span></div>
              <ul className="pass-features">
                <li><i className="fa-solid fa-circle-check"></i> Unlimited Free Delivery</li>
                <li><i className="fa-solid fa-circle-check"></i> 20% Extra Off on 500+ Restaurants</li>
                <li><i className="fa-solid fa-circle-check"></i> Priority Order Processing</li>
                <li><i className="fa-solid fa-circle-check"></i> No Surge Pricing</li>
              </ul>
              <button className="pass-btn" onClick={handleSubscribe} disabled={loading}>
                {loading ? 'Processing...' : 'Get Pro Now'}
              </button>
            </div>

            <div className="pass-card silver" data-aos="flip-right">
              <h2>Annual Pro</h2>
              <div className="pass-price">₹999 <span>/ year</span></div>
              <p className="small text-secondary mb-4">Save ₹789 compared to monthly plan!</p>
              <ul className="pass-features">
                <li><i className="fa-solid fa-circle-check"></i> All Monthly Benefits</li>
                <li><i className="fa-solid fa-circle-check"></i> Exclusive Chef's Specials</li>
                <li><i className="fa-solid fa-circle-check"></i> Birthday Surprise Gifts</li>
                <li><i className="fa-solid fa-circle-check"></i> VIP Customer Support</li>
              </ul>
              <button className="pass-btn outline" onClick={handleSubscribe} disabled={loading}>
                 Choose Annual
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      <style>{`
        .pass-page { min-height: 100vh; background: #080808; padding-bottom: 80px; }
        .pass-hero { 
          background: linear-gradient(135deg, #1a1a2e, #000); 
          padding: 80px 20px; 
          text-align: center; 
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .pass-hero h1 { font-size: 3rem; font-weight: 900; margin-bottom: 10px; }
        .pass-hero h1 span { color: #ff6f00; text-shadow: 0 0 20px rgba(255,111,0,0.5); }
        .pass-hero p { color: rgba(255,255,255,0.6); font-size: 1.1rem; }

        .pass-container { max-width: 1000px; margin: -50px auto 0; padding: 0 20px; }
        .pass-card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; }
        
        .pass-card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 30px;
          padding: 40px;
          text-align: center;
          position: relative;
          transition: transform 0.3s;
        }
        .pass-card:hover { transform: translateY(-10px); border-color: #ff6f00; }
        .pass-card.gold { border: 2px solid rgba(255,111,0,0.3); background: rgba(255,111,0,0.05); }
        
        .pass-badge {
          position: absolute; top: -15px; left: 50%; transform: translateX(-50%);
          background: #ff6f00; color: #fff; padding: 6px 15px; border-radius: 20px;
          font-size: 0.7rem; font-weight: 800; letter-spacing: 1px;
        }

        .pass-price { font-size: 3rem; font-weight: 800; margin: 20px 0; }
        .pass-price span { font-size: 1rem; color: rgba(255,255,255,0.4); font-weight: 400; }

        .pass-features { list-style: none; padding: 0; margin: 30px 0; text-align: left; }
        .pass-features li { margin-bottom: 15px; color: rgba(255,255,255,0.8); display: flex; align-items: center; gap: 12px; }
        .pass-features li i { color: #ff6f00; font-size: 1.1rem; }

        .pass-btn {
          width: 100%; padding: 15px; border-radius: 15px; border: none;
          background: #ff6f00; color: #fff; font-weight: 800; font-size: 1rem;
          cursor: pointer; transition: 0.3s;
        }
        .pass-btn:hover { background: #ff8f00; box-shadow: 0 10px 20px rgba(255,111,0,0.3); }
        .pass-btn.outline { background: transparent; border: 2px solid rgba(255,255,255,0.2); }
        .pass-btn.outline:hover { border-color: #fff; background: rgba(255,255,255,0.05); }
      `}</style>
    </>
  );
}
