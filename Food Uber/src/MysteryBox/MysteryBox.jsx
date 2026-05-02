import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../Navbar/Navbar';
import Footer from '../footer';
import { CartContext } from '../context/CartContext';
import { MenuContext } from '../context/MenuContext';

export default function MysteryBox() {
  const { addToCart } = useContext(CartContext);
  const { allProducts } = useContext(MenuContext);
  const [budget, setBudget] = useState(150);
  const [preference, setPreference] = useState('Any');
  const [isOpening, setIsOpening] = useState(false);

  const budgets = [150, 250, 400];
  const preferences = ['Any', 'Veg', 'Spicy', 'Sweet'];

  const handleOrder = () => {
    setIsOpening(true);
    setTimeout(() => {
      const affordable = allProducts.filter(p => p.price <= budget && p.img && p.img.startsWith('http'));
      const selectedItem = affordable.length > 0
        ? affordable[Math.floor(Math.random() * affordable.length)]
        : allProducts[0];

      addToCart({
        name: `Mystery Box (${preference})`,
        price: budget,
        img: '/mystery-box.png',
        isMystery: true,
        realName: selectedItem.name
      });
      toast.success('🎉 Mystery Box added to cart!');
      setIsOpening(false);
    }, 2000);
  };

  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at center, #1a0b2e 0%, #000000 100%)',
          color: 'white',
          paddingTop: '100px',
          paddingBottom: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-6">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: '2.5rem', fontWeight: 900, marginBottom: '12px',
                  background: 'linear-gradient(45deg, #ff00cc, #3333ff)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}
              >
                The Mystery Box
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '40px' }}
              >
                Can't decide what to eat? Set a budget — let fate decide your meal! It's a surprise until it arrives.
              </motion.p>

              <div style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '28px',
                padding: '40px'
              }}>
                <motion.div
                  animate={isOpening
                    ? { rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }
                    : { y: [0, -10, 0] }
                  }
                  transition={isOpening
                    ? { duration: 0.5, repeat: Infinity }
                    : { duration: 2, repeat: Infinity }
                  }
                  style={{ marginBottom: '32px' }}
                >
                  <img
                    src="/mystery-box.png"
                    alt="Mystery Box"
                    style={{ width: '220px', filter: 'drop-shadow(0 0 30px rgba(255,0,204,0.6))', borderRadius: '20px' }}
                  />
                </motion.div>

                {/* Budget Selection */}
                <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                  <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', display: 'block' }}>
                    1. Choose Your Budget
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {budgets.map(b => (
                      <button
                        key={b}
                        onClick={() => setBudget(b)}
                        disabled={isOpening}
                        style={{
                          flex: 1, padding: '14px',
                          borderRadius: '12px',
                          border: budget === b ? '2px solid #ff00cc' : '1px solid rgba(255,255,255,0.15)',
                          background: budget === b ? 'rgba(255,0,204,0.15)' : 'rgba(255,255,255,0.04)',
                          color: budget === b ? '#ff00cc' : 'rgba(255,255,255,0.7)',
                          fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        ₹{b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preference Selection */}
                <div style={{ marginBottom: '32px', textAlign: 'left' }}>
                  <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', display: 'block' }}>
                    2. Any Preferences?
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {preferences.map(p => (
                      <button
                        key={p}
                        onClick={() => setPreference(p)}
                        disabled={isOpening}
                        style={{
                          padding: '8px 20px', borderRadius: '50px', cursor: 'pointer',
                          border: preference === p ? '2px solid #fff' : '1px solid rgba(255,255,255,0.15)',
                          background: preference === p ? 'white' : 'rgba(255,255,255,0.05)',
                          color: preference === p ? '#000' : 'rgba(255,255,255,0.7)',
                          fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s'
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleOrder}
                  disabled={isOpening}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '50px', border: 'none',
                    background: 'linear-gradient(45deg, #ff00cc, #3333ff)',
                    color: 'white', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer',
                    opacity: isOpening ? 0.75 : 1, transition: 'all 0.3s'
                  }}
                >
                  {isOpening ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Conjuring Meal...</>
                  ) : (
                    <><i className="fa-solid fa-wand-magic-sparkles me-2"></i>Lock in ₹{budget} Mystery Box</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
