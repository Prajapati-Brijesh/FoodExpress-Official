import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const email = localStorage.getItem("userEmail") || "Guest User";
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("past_orders") || "[]");
    setOrders(savedOrders.reverse());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPassword");
    window.location.href = "/";
  };

  return (
    <div className="dash-wrapper">
      <div className="dash-card" data-aos="fade-up" style={{ maxWidth: "600px" }}>
        <h1>Welcome 🎉</h1>
        <p className="email">{email}</p>

        {orders.length > 0 && (
          <div className="text-start mt-4 mb-4">
            <h5 className="mb-3">Your Recent Orders</h5>
            {orders.map((order, i) => (
              <div key={i} className="border border-secondary p-2 rounded mb-2" style={{ background: "rgba(0,0,0,0.4)", fontSize: "14px" }}>
                <div className="d-flex justify-content-between mb-1">
                  <strong className="text-white">Order #{order.id.toString().slice(-4)}</strong>
                  <strong className="text-success">₹{order.total}</strong>
                </div>
                <div className="text-secondary mb-1">{order.date}</div>
                <div className="text-light">{order.items.map(item => `${item.name} (x${item.qty})`).join(", ")}</div>
              </div>
            ))}
          </div>
        )}

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <style>{`
        .dash-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ff6b00, #ff9f1a);
          padding: 20px;
        }

        .dash-card {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(12px);
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.1);
          max-width: 400px;
          width: 100%;
          color: white;
        }

        .dash-card h1 {
          margin-bottom: 10px;
        }

        .email {
          color: #bbb;
          margin-bottom: 20px;
        }

        .logout-btn {
          padding: 12px 25px;
          border: none;
          border-radius: 12px;
          background: #ff6b00;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: 0.3s;
        }

        .logout-btn:hover {
          background: #e65c00;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
