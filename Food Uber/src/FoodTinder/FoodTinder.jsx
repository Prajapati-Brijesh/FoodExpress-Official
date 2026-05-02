import React, { useState, useRef, useContext } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer';
import { CartContext } from '../context/CartContext';
import { MenuContext } from '../context/MenuContext';
import './FoodTinder.css';

const SWIPE_THRESHOLD = 100;

export default function FoodTinder() {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { allProducts } = useContext(MenuContext);

  const SWIPE_ITEMS = React.useMemo(() => {
    return allProducts
      .filter(p => p.img && p.img.startsWith('http'))
      .slice(0, 20);
  }, [allProducts]);

  const [cards, setCards] = useState([]);
  const [likedItems, setLikedItems] = useState([]);
  const [lastAction, setLastAction] = useState(null); // 'like' or 'dislike'
  const [gameOver, setGameOver] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  React.useEffect(() => {
    setCards(SWIPE_ITEMS);
  }, [SWIPE_ITEMS]);

  const handleSwipe = (direction, item) => {
    setLastAction(direction);
    const newCards = cards.filter(c => c.name !== item.name);
    setCards(newCards);

    if (direction === 'right') {
      const newLiked = [...likedItems, item];
      setLikedItems(newLiked);

      if (newLiked.length >= 3 || newCards.length === 0) {
        // Pick the highest priced liked item as the suggestion
        const suggested = newLiked.sort((a, b) => b.price - a.price)[0];
        setSuggestion(suggested);
        setGameOver(true);
      }
    } else {
      if (newCards.length === 0 && likedItems.length === 0) {
        // User disliked everything - suggest the cheapest one
        setSuggestion(SWIPE_ITEMS[Math.floor(Math.random() * SWIPE_ITEMS.length)]);
        setGameOver(true);
      }
    }

    if (newCards.length === 0 && !gameOver) {
      const suggested = likedItems.sort((a, b) => b.price - a.price)[0] || SWIPE_ITEMS[0];
      setSuggestion(suggested);
      setGameOver(true);
    }
  };

  const handleAddToCart = () => {
    if (suggestion) {
      addToCart(suggestion);
      toast.success(`🔥 ${suggestion.name} added to cart!`);
      navigate('/checkout');
    }
  };

  const restart = () => {
    setCards(SWIPE_ITEMS);
    setLikedItems([]);
    setLastAction(null);
    setGameOver(false);
    setSuggestion(null);
  };

  return (
    <>
      <Navbar />
      <div className="food-tinder-page">
        <div className="food-tinder-container">
          <div className="tinder-header">
            <h1 className="tinder-title">
              <i className="fa-solid fa-fire-flame-curved me-2"></i>
              Food Tinder
            </h1>
            <p className="tinder-subtitle">Swipe to discover what you're craving today</p>
            <div className="swipe-hints">
              <span className="hint-left"><i className="fa-solid fa-xmark"></i> Nope</span>
              <span className="hint-count">{Math.max(0, cards.length)} left</span>
              <span className="hint-right">Like <i className="fa-solid fa-heart"></i></span>
            </div>
          </div>

          {gameOver ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="suggestion-card"
            >
              <div className="suggestion-inner">
                <div className="confetti-emoji">🎉</div>
                <h3>We found your perfect match!</h3>
                {suggestion && (
                  <>
                    <motion.img
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      src={suggestion.img}
                      alt={suggestion.name}
                      className="suggestion-img"
                    />
                    <h4 className="suggestion-name">{suggestion.name}</h4>
                    <p className="suggestion-price">₹{suggestion.discountedPrice || suggestion.price}</p>
                    <div className="suggestion-actions">
                      <button className="btn-tinder-add" onClick={handleAddToCart}>
                        <i className="fa-solid fa-cart-plus me-2"></i> Add to Cart & Order
                      </button>
                      <button className="btn-tinder-retry" onClick={restart}>
                        <i className="fa-solid fa-rotate-right me-2"></i> Try Again
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="cards-stack">
              <AnimatePresence>
                {cards.slice(0, 3).reverse().map((item, index) => (
                  <SwipeCard
                    key={item.name}
                    item={item}
                    isTop={index === cards.slice(0, 3).length - 1}
                    onSwipe={handleSwipe}
                    stackIndex={cards.slice(0, 3).length - 1 - index}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {!gameOver && (
            <div className="tinder-actions">
              <button
                className="tinder-btn dislike"
                onClick={() => cards.length > 0 && handleSwipe('left', cards[0])}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
              <button
                className="tinder-btn like"
                onClick={() => cards.length > 0 && handleSwipe('right', cards[0])}
              >
                <i className="fa-solid fa-heart"></i>
              </button>
            </div>
          )}

          {lastAction && !gameOver && (
            <motion.div
              key={lastAction}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
              className={`action-indicator ${lastAction}`}
            >
              {lastAction === 'right' ? '❤️ LIKE!' : '❌ NOPE!'}
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

function SwipeCard({ item, isTop, onSwipe, stackIndex }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipe('right', item);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipe('left', item);
    }
  };

  return (
    <motion.div
      className="swipe-card"
      style={{
        x,
        rotate,
        opacity,
        scale: isTop ? 1 : 0.95 - stackIndex * 0.03,
        zIndex: isTop ? 10 : 10 - stackIndex,
        top: `${stackIndex * 8}px`,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: isTop ? 1 : 0.95 - stackIndex * 0.02, opacity: 1 }}
      exit={{ x: 300, opacity: 0, transition: { duration: 0.3 } }}
    >
      <motion.div className="like-label" style={{ opacity: likeOpacity }}>
        LIKE ❤️
      </motion.div>
      <motion.div className="nope-label" style={{ opacity: nopeOpacity }}>
        NOPE ❌
      </motion.div>
      <img src={item.img} alt={item.name} className="card-img" />
      <div className="card-info">
        <h3 className="card-name">{item.displayName || item.name}</h3>
        <p className="card-price">₹{item.discountedPrice || item.price}</p>
      </div>
    </motion.div>
  );
}
