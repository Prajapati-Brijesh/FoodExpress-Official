import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../Navbar/Navbar';
import Footer from '../footer';
import { CartContext } from '../context/CartContext';
import './GroupCart.css';

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function GroupCart() {
  const { addToCart, cart, total } = useContext(CartContext);
  const [phase, setPhase] = useState('home'); // 'home' | 'host' | 'join' | 'session'
  const [roomCode, setRoomCode] = useState('');
  const [yourName, setYourName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [members, setMembers] = useState([]);
  const [sessionCart, setSessionCart] = useState([]);

  const startSession = () => {
    if (!yourName.trim()) { toast.error("Enter your name first!"); return; }
    const code = generateRoomCode();
    setRoomCode(code);
    setMembers([{ name: yourName, items: [], color: '#ff00cc' }]);
    setPhase('session');
    toast.success(`Room created! Share code: ${code}`);
  };

  const joinSession = () => {
    if (!yourName.trim() || !joinCode.trim()) { toast.error("Fill all fields!"); return; }
    setRoomCode(joinCode.toUpperCase());
    setMembers([
      { name: 'Friend (Host)', items: [], color: '#3333ff' },
      { name: yourName, items: [], color: '#ff00cc' }
    ]);
    setPhase('session');
    toast.success(`Joined session ${joinCode.toUpperCase()}!`);
  };

  // Simulate adding an item to the current user's session bucket
  const quickItems = [
    { name: 'Paneer Butter Masala', price: 180, emoji: '🍛' },
    { name: 'Veg Burger', price: 80, emoji: '🍔' },
    { name: 'Cheese Pizza', price: 200, emoji: '🍕' },
    { name: 'Veg Biryani', price: 160, emoji: '🍚' },
    { name: 'French Fries', price: 90, emoji: '🍟' },
    { name: 'Cold Coffee', price: 120, emoji: '☕' },
  ];

  const addSessionItem = (item) => {
    const newSessionCart = [...sessionCart, { ...item, addedBy: yourName || 'You' }];
    setSessionCart(newSessionCart);
    addToCart({ name: item.name, price: item.price, img: '' });
    toast.success(`${item.emoji} ${item.name} added!`);
  };

  // Calculate split bill
  const splitBill = () => {
    const grouped = sessionCart.reduce((acc, item) => {
      acc[item.addedBy] = (acc[item.addedBy] || 0) + item.price;
      return acc;
    }, {});
    return grouped;
  };

  return (
    <>
      <Navbar />
      <div className="group-cart-page">
        <div className="container pt-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <motion.div className="text-center mb-5" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="group-title">
                  <i className="fa-solid fa-people-group me-2"></i> Group Order
                </h1>
                <p className="group-subtitle">
                  Order with friends. Everyone adds to the same cart, bill splits automatically. No Zomato, no Swiggy does this.
                </p>
              </motion.div>

              {phase === 'home' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="row g-4">
                  <div className="col-md-6">
                    <div className="group-option-card" onClick={() => setPhase('host')}>
                      <div className="option-emoji">🏠</div>
                      <h4>Create a Room</h4>
                      <p>Start a group session and invite your friends</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="group-option-card" onClick={() => setPhase('join')}>
                      <div className="option-emoji">🔗</div>
                      <h4>Join a Room</h4>
                      <p>Enter a room code shared by your friend</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {(phase === 'host' || phase === 'join') && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group-form-card">
                  <h5 className="fw-bold text-white mb-4">
                    {phase === 'host' ? '🏠 Create Your Room' : '🔗 Join a Room'}
                  </h5>
                  <input
                    className="group-input mb-3"
                    placeholder="Your Name"
                    value={yourName}
                    onChange={e => setYourName(e.target.value)}
                  />
                  {phase === 'join' && (
                    <input
                      className="group-input mb-3 text-uppercase"
                      placeholder="Room Code (e.g. AB12CD)"
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    />
                  )}
                  <button className="group-btn" onClick={phase === 'host' ? startSession : joinSession}>
                    {phase === 'host' ? '🚀 Create & Get Code' : '🔗 Join Session'}
                  </button>
                  <button className="group-btn-back mt-3" onClick={() => setPhase('home')}>← Back</button>
                </motion.div>
              )}

              {phase === 'session' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Room Code Banner */}
                  <div className="room-banner mb-4">
                    <div>
                      <div className="room-label">Room Code</div>
                      <div className="room-code">{roomCode}</div>
                    </div>
                    <button className="btn btn-outline-light btn-sm rounded-pill" onClick={() => { navigator.clipboard.writeText(roomCode); toast.success("Code copied!"); }}>
                      <i className="fa-solid fa-copy me-1"></i> Copy
                    </button>
                  </div>

                  <div className="row g-4">
                    {/* Quick Add Items */}
                    <div className="col-md-6">
                      <h6 className="text-secondary text-uppercase mb-3" style={{ letterSpacing: '1px', fontSize: '12px' }}>Quick Add</h6>
                      <div className="d-flex flex-column gap-2">
                        {quickItems.map((item, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            className="quick-item"
                            onClick={() => addSessionItem(item)}
                          >
                            <span className="quick-emoji">{item.emoji}</span>
                            <span className="quick-name">{item.name}</span>
                            <span className="quick-price">₹{item.price}</span>
                            <i className="fa-solid fa-plus ms-auto text-success"></i>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Group Cart & Split */}
                    <div className="col-md-6">
                      <h6 className="text-secondary text-uppercase mb-3" style={{ letterSpacing: '1px', fontSize: '12px' }}>Group Cart ({sessionCart.length} items)</h6>
                      <div className="group-cart-list mb-4">
                        {sessionCart.length === 0 ? (
                          <div className="text-center py-4 text-secondary">No items yet. Add something!</div>
                        ) : (
                          sessionCart.map((item, i) => (
                            <div key={i} className="group-cart-item">
                              <span>{item.emoji} {item.name}</span>
                              <span className="text-success">₹{item.price}</span>
                            </div>
                          ))
                        )}
                      </div>

                      {sessionCart.length > 0 && (
                        <div className="split-card">
                          <h6 className="fw-bold text-white mb-3">💰 Split Bill</h6>
                          {Object.entries(splitBill()).map(([name, amount]) => (
                            <div key={name} className="d-flex justify-content-between mb-2">
                              <span className="text-secondary">{name}</span>
                              <span className="fw-bold text-warning">₹{amount}</span>
                            </div>
                          ))}
                          <hr className="border-secondary" />
                          <div className="d-flex justify-content-between">
                            <span className="fw-bold text-white">Total</span>
                            <span className="fw-bold text-success">₹{sessionCart.reduce((s, i) => s + i.price, 0)}</span>
                          </div>
                        </div>
                      )}
                    </div>
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
