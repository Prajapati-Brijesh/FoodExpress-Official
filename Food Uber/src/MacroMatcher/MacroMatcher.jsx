import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../Navbar/Navbar';
import Footer from '../footer';
import { CartContext } from '../context/CartContext';
import { MenuContext } from '../context/MenuContext';
import './MacroMatcher.css';

// Simulated nutrition data per item (since we don't have a real DB)
const NUTRITION_MAP = {
  "Poha": { protein: 5, carbs: 42, fats: 3, calories: 210 },
  "Idli Sambhar": { protein: 8, carbs: 38, fats: 2, calories: 200 },
  "Masala Dosa": { protein: 7, carbs: 55, fats: 8, calories: 320 },
  "Aloo Paratha": { protein: 9, carbs: 62, fats: 12, calories: 390 },
  "Veg Thali": { protein: 18, carbs: 80, fats: 15, calories: 520 },
  "Paneer Butter Masala": { protein: 22, carbs: 20, fats: 25, calories: 390 },
  "Dal Fry": { protein: 15, carbs: 35, fats: 8, calories: 270 },
  "Jeera Rice": { protein: 6, carbs: 58, fats: 5, calories: 300 },
  "Veg Biryani": { protein: 12, carbs: 70, fats: 10, calories: 420 },
  "Chana Masala": { protein: 20, carbs: 45, fats: 8, calories: 330 },
  "Dal Makhani": { protein: 18, carbs: 40, fats: 12, calories: 340 },
  "Veg Burger": { protein: 10, carbs: 45, fats: 12, calories: 320 },
  "Cheese Pizza": { protein: 14, carbs: 60, fats: 16, calories: 440 },
  "French Fries": { protein: 4, carbs: 48, fats: 15, calories: 340 },
  "Veg Noodles": { protein: 8, carbs: 55, fats: 6, calories: 310 },
  "Chilli Paneer": { protein: 24, carbs: 18, fats: 20, calories: 350 },
  "Paneer Tikka": { protein: 28, carbs: 10, fats: 18, calories: 320 },
  "Mix Veg": { protein: 10, carbs: 30, fats: 8, calories: 240 },
  "Shahi Paneer": { protein: 20, carbs: 22, fats: 22, calories: 380 },
  "Spring Roll": { protein: 6, carbs: 35, fats: 8, calories: 240 },
};

export default function MacroMatcher() {
  const { addToCart } = useContext(CartContext);
  const { allProducts } = useContext(MenuContext);
  const [minProtein, setMinProtein] = useState('');
  const [maxCalories, setMaxCalories] = useState('');
  const [maxCarbs, setMaxCarbs] = useState('');
  const [results, setResults] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleMatch = () => {
    setSearched(true);
    const filtered = allProducts
      .filter(p => p.img && p.img.startsWith('http'))
      .filter(p => {
        const nutrition = NUTRITION_MAP[p.displayName || p.name];
        if (!nutrition) return false;

        const passProtein = minProtein ? nutrition.protein >= parseInt(minProtein) : true;
        const passCalories = maxCalories ? nutrition.calories <= parseInt(maxCalories) : true;
        const passCarbs = maxCarbs ? nutrition.carbs <= parseInt(maxCarbs) : true;

        return passProtein && passCalories && passCarbs;
      })
      .map(p => ({
        ...p,
        nutrition: NUTRITION_MAP[p.displayName || p.name]
      }));

    setResults(filtered);
    if (filtered.length === 0) {
      toast.info("No exact matches! Try adjusting your macros.");
    } else {
      toast.success(`Found ${filtered.length} matching meals!`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="macro-page">
        <div className="container pt-5">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-5"
              >
                <h1 className="macro-title">
                  <i className="fa-solid fa-dumbbell me-2"></i> Macro Matcher
                </h1>
                <p className="macro-subtitle">
                  Tell us your fitness goals. We'll find the exact meals from our menu that match your macros — something no other food app does.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="macro-filter-card"
              >
                <h5 className="fw-bold mb-4 text-white"><i className="fa-solid fa-sliders me-2" style={{ color: '#00ff88' }}></i>Set Your Targets</h5>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="macro-label">Min Protein (g)</label>
                    <div className="macro-input-group">
                      <span className="macro-icon">💪</span>
                      <input
                        type="number"
                        className="macro-input"
                        placeholder="e.g. 20"
                        value={minProtein}
                        onChange={e => setMinProtein(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="macro-label">Max Calories (kcal)</label>
                    <div className="macro-input-group">
                      <span className="macro-icon">🔥</span>
                      <input
                        type="number"
                        className="macro-input"
                        placeholder="e.g. 400"
                        value={maxCalories}
                        onChange={e => setMaxCalories(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="macro-label">Max Carbs (g)</label>
                    <div className="macro-input-group">
                      <span className="macro-icon">🌾</span>
                      <input
                        type="number"
                        className="macro-input"
                        placeholder="e.g. 50"
                        value={maxCarbs}
                        onChange={e => setMaxCarbs(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <button className="macro-btn mt-4" onClick={handleMatch}>
                  <i className="fa-solid fa-magnifying-glass me-2"></i> Find My Meals
                </button>
              </motion.div>

              {searched && results !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5"
                >
                  <h4 className="fw-bold text-white mb-4">
                    {results.length > 0 ? `✅ ${results.length} Meals Match Your Goals` : '😕 No Matches Found'}
                  </h4>
                  <div className="row g-4">
                    {results.map((item, i) => (
                      <div key={i} className="col-md-4">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="macro-result-card"
                        >
                          <img src={item.img} alt={item.name} className="macro-result-img" />
                          <div className="macro-result-info">
                            <h6 className="macro-result-name">{item.displayName || item.name}</h6>
                            <p className="macro-result-price">₹{item.discountedPrice || item.price}</p>
                            <div className="macro-pills">
                              <span className="mpill protein">💪 {item.nutrition.protein}g P</span>
                              <span className="mpill calories">🔥 {item.nutrition.calories} Cal</span>
                              <span className="mpill carbs">🌾 {item.nutrition.carbs}g C</span>
                              <span className="mpill fats">🥑 {item.nutrition.fats}g F</span>
                            </div>
                            <button
                              className="macro-add-btn"
                              onClick={() => { addToCart(item); toast.success(`${item.name} added!`); }}
                            >
                              <i className="fa-solid fa-plus me-1"></i> Add to Cart
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
