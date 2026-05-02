import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer';
import './Discover.css';

const features = [
  {
    id: 1,
    emoji: '🎁',
    title: 'Mystery Box',
    tagline: 'Not on Zomato. Not on Swiggy.',
    description: 'Set your budget, pick a vibe, and let us surprise you with a top-rated meal. Your food will be a mystery until it arrives at your door!',
    link: '/mystery-box',
    gradient: 'linear-gradient(135deg, #ff00cc 0%, #3333ff 100%)',
    glowColor: 'rgba(255,0,204,0.3)',
    badge: '🔥 Trending'
  },
  {
    id: 2,
    emoji: '🔥',
    title: 'Food Tinder',
    tagline: 'Swipe right to eat.',
    description: 'Can\'t decide what to eat? Swipe left to skip, right to like. After a few swipes our algorithm figures out your mood and suggests the perfect dish.',
    link: '/food-tinder',
    gradient: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
    glowColor: 'rgba(255,65,108,0.3)',
    badge: '✨ Fan Favourite'
  },
  {
    id: 3,
    emoji: '💪',
    title: 'Macro Matcher',
    tagline: 'Your diet. Your rules.',
    description: 'Tell us your protein goal and calorie limit. We\'ll scan our entire menu and show you the exact meals that match your fitness macros.',
    link: '/macro-matcher',
    gradient: 'linear-gradient(135deg, #00ff88 0%, #00ccff 100%)',
    glowColor: 'rgba(0,255,136,0.25)',
    badge: '🏋️ Fitness'
  },
  {
    id: 4,
    emoji: '👥',
    title: 'Group Order',
    tagline: 'Order together, split the bill.',
    description: 'Create a room, share the code with friends. Everyone adds their own items to one shared cart. The bill is split automatically — no more arguments!',
    link: '/group-cart',
    gradient: 'linear-gradient(135deg, #00aaff 0%, #aa00ff 100%)',
    glowColor: 'rgba(0,170,255,0.25)',
    badge: '👯 Social'
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' }
  })
};

export default function Discover() {
  return (
    <>
      <Navbar />
      <div className="discover-page">
        <div className="container">
          {/* Hero */}
          <motion.div
            className="discover-hero text-center"
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="discover-pill">⚡ Only on FoodExpress</span>
            <h1 className="discover-heading">
              Features You Won't Find<br />Anywhere Else
            </h1>
            <p className="discover-subtext">
              We built tools that Zomato and Swiggy never thought of. Explore them below.
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="features-grid">
            {features.map((f, i) => (
              <motion.div
                key={f.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <Link to={f.link} className="feature-card-link">
                  <div
                    className="feature-card"
                    style={{ '--glow': f.glowColor }}
                  >
                    {/* Badge */}
                    <span className="feature-badge">{f.badge}</span>

                    {/* Gradient Orb */}
                    <div className="card-orb" style={{ background: f.gradient }}></div>

                    {/* Content */}
                    <div className="card-emoji">{f.emoji}</div>
                    <h2 className="card-title">{f.title}</h2>
                    <p className="card-tagline">{f.tagline}</p>
                    <p className="card-desc">{f.description}</p>

                    {/* CTA */}
                    <div className="card-cta" style={{ background: f.gradient }}>
                      Try it now <i className="fa-solid fa-arrow-right ms-2"></i>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
