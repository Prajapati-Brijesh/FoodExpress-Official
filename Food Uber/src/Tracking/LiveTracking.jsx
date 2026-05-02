import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./LiveTracking.css";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Modal, Form, Button } from "react-bootstrap";

// ─── Fix default Leaflet icons ────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Custom Icons ─────────────────────────────────────────────────────────────
const userIcon = L.divIcon({
  className: "",
  html: `<div class="pulse-marker">
           <div class="pulse-ring"></div>
           <div class="pulse-dot">🏠</div>
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const driverIcon = L.divIcon({
  className: "",
  html: `<div class="driver-marker">🛵</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const restaurantIcon = L.divIcon({
  className: "",
  html: `<div class="restaurant-marker">🍽️</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// ─── Status Steps ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: 0, icon: "✅", label: "Order Placed",      desc: "We received your order!" },
  { id: 1, icon: "👨‍🍳", label: "Preparing Food",   desc: "Chef is cooking your meal." },
  { id: 2, icon: "🛵", label: "Out for Delivery",  desc: "Driver is on the way!" },
  { id: 3, icon: "📍", label: "Nearby",             desc: "Almost there!" },
  { id: 4, icon: "🎉", label: "Delivered",          desc: "Enjoy your meal! 😋" },
];

// ─── Map auto-recenter helper ─────────────────────────────────────────────────
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// ─── Generate route points between two coords ─────────────────────────────────
function interpolatePoints(start, end, count = 20) {
  return Array.from({ length: count + 1 }, (_, i) => {
    const t = i / count;
    return [
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t,
    ];
  });
}

function interpolatePolyline(points, numPoints) {
  if (points.length < 2) return points;
  let totalDist = 0;
  const dists = [0];
  for (let i = 0; i < points.length - 1; i++) {
    const d = Math.hypot(points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]);
    totalDist += d;
    dists.push(totalDist);
  }

  const res = [];
  for (let i = 0; i <= numPoints; i++) {
    const target = (i / numPoints) * totalDist;
    for (let j = 0; j < points.length - 1; j++) {
      if (target >= dists[j] && target <= dists[j + 1]) {
        const segmentLen = dists[j + 1] - dists[j];
        const t = segmentLen === 0 ? 0 : (target - dists[j]) / segmentLen;
        res.push([
          points[j][0] + (points[j + 1][0] - points[j][0]) * t,
          points[j][1] + (points[j + 1][1] - points[j][1]) * t
        ]);
        break;
      }
    }
  }
  return res;
}

// ─── Drivers List ─────────────────────────────────────────────────────────────
const DRIVERS = [
  { name: "Rahul Kumar",   vehicle: "GJ 12 AB 3456", rating: "4.9", phone: "+919876543210" },
  { name: "Amit Sharma",   vehicle: "GJ 04 CD 7890", rating: "4.7", phone: "+919812345678" },
  { name: "Suresh Yadav",  vehicle: "GJ 01 EF 2345", rating: "4.8", phone: "+919823456789" },
  { name: "Deepak Singh",  vehicle: "GJ 20 GH 6789", rating: "4.6", phone: "+919834567890" },
  { name: "Vijay Patil",   vehicle: "GJ 43 IJ 1234", rating: "5.0", phone: "+919845678901" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LiveTracking() {
  const navigate = useNavigate();
  const [userPos, setUserPos]             = useState(null);
  const [driverPos, setDriverPos]         = useState(null);
  const [restaurantPos, setRestaurantPos] = useState(null);
  const [routePoints, setRoutePoints]     = useState([]);
  const [travelledPts, setTravelledPts]   = useState([]);
  const [currentStep, setCurrentStep]     = useState(0);
  const [eta, setEta]                     = useState(30);
  const [arrivalTime, setArrivalTime]     = useState("");
  const [locationError, setLocationError] = useState(false);
  const [gpsActive, setGpsActive]         = useState(false);   // live GPS indicator
  const [accuracy, setAccuracy]           = useState(null);    // GPS accuracy in meters
  const watchIdRef = useRef(null);  // to stop watchPosition on unmount

  // Cancel Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // ── Delivery info from Checkout form ──
  const [deliveryInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("delivery_info") || "null");
    } catch { return null; }
  });

  // ── Real driver info from backend (set when driver accepts) ──
  const [driver, setDriver] = useState({ name: null, phone: null });

  const stepRef = useRef(currentStep);
  stepRef.current = currentStep;

  // ── Polling Real Order Status ──
  useEffect(() => {
    if (!deliveryInfo?.orderId) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/get-order/${deliveryInfo.orderId}/`);
        const data = await response.json();
        
        if (data.status === "success") {
          // Map DB status to UI steps
          const statusMap = {
            "New": 0,
            "Preparing": 1,
            "Ready": 2,
            "Out for Delivery": 3,
            "Delivered": 4,
            "Cancelled": 0 // Just leave at 0 if cancelled, though it shouldn't show tracking ideally
          };
          
          if (statusMap[data.orderStatus] !== undefined) {
            setCurrentStep(statusMap[data.orderStatus]);
          }

          // Update driver info if assigned
          if (data.driverName) {
            setDriver(prev => ({
              ...prev,
              name: data.driverName,
              phone: data.driverPhone || prev.phone
            }));
          }
        }
      } catch (err) {
        console.error("Failed to poll order status", err);
      }
    };

    // Poll immediately, then every 5 seconds
    pollStatus();
    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [deliveryInfo?.orderId]);

  // 1️⃣  LIVE GPS — 2-step: quick fix first, then continuous watch
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }

    const initRoute = async (lat, lng) => {
      const rest = [lat + 0.007, lng + 0.006];
      setRestaurantPos(rest);
      setDriverPos(rest);
      
      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${lng + 0.006},${lat + 0.007};${lng},${lat}?overview=full&geometries=geojson`);
        const data = await res.json();
        
        if (data.code === 'Ok' && data.routes.length > 0) {
          // OSRM returns [lng, lat], map to [lat, lng]
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          const smoothPts = interpolatePolyline(coords, 1800);
          setRoutePoints(smoothPts);
        } else {
          const pts = interpolatePoints(rest, [lat, lng], 1800);
          setRoutePoints(pts);
        }
      } catch (err) {
        console.error("Routing failed, falling back", err);
        const pts = interpolatePoints(rest, [lat, lng], 1800);
        setRoutePoints(pts);
      }
    };

    // Step 1: Fast one-time fix to show map quickly
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords;
        setUserPos([lat, lng]);
        setAccuracy(Math.round(acc));
        setGpsActive(true);
        initRoute(lat, lng);
      },
      () => { /* silent — watchPosition will handle errors */ },
      { enableHighAccuracy: false, timeout: 5000 }   // fast & low-power for first fix
    );

    // Step 2: Continuous high-accuracy watch
    const onWatch = (pos) => {
      const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords;
      setUserPos([lat, lng]);
      setAccuracy(Math.round(acc));
      setGpsActive(true);

      // Init route only once
      setRestaurantPos((prev) => {
        if (prev) return prev;
        initRoute(lat, lng);
        return [lat + 0.007, lng + 0.006];
      });
    };

    const onError = (err) => {
      // Only show fallback if we never got a real fix
      setUserPos((prev) => {
        if (prev) return prev;  // already have a position, keep it
        // Fallback demo (Surat)
        const user = [21.1702, 72.8311];
        initRoute(21.1702, 72.8311);
        setLocationError(true);
        setGpsActive(false);
        return user;
      });
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      onWatch,
      onError,
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );

    return () => {
      if (watchIdRef.current !== null)
        navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  // 2️⃣  Animate driver along route
  useEffect(() => {
    if (routePoints.length === 0) return;
    
    // Only move driver if step is Out for Delivery (3)
    if (currentStep < 3) return;

    let idx = 0;
    const timer = setInterval(() => {
      idx += 1;
      if (idx >= routePoints.length) {
        clearInterval(timer);
        setEta(0);
        return;
      }
      setDriverPos(routePoints[idx]);
      setTravelledPts(routePoints.slice(0, idx + 1));

      // ETA countdown in minutes
      const remaining = Math.ceil((routePoints.length - idx) / 60);
      setEta(remaining);
      
    }, 1000); // 1 second per segment -> ~1800 s total

    return () => clearInterval(timer);
  }, [routePoints, currentStep]);

  // Update arrival time whenever ETA changes
  useEffect(() => {
    if (eta > 0) {
      const targetDate = new Date(Date.now() + eta * 60000);
      setArrivalTime(targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  }, [eta]);

  const isDelivered = currentStep === 4;

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!cancelReason) {
      toast.warning("Please select a reason for cancellation.");
      return;
    }

    setIsCancelling(true);

    if (!deliveryInfo?.orderId) {
      // Fallback for offline/demo orders
      setTimeout(() => {
        toast.error("🚨 Order Cancelled: " + cancelReason);
        setShowCancelModal(false);
        navigate("/");
      }, 800);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/orders/cancel/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: deliveryInfo.orderId, reason: cancelReason })
      });
      const data = await response.json();
      if (data.status === "success") {
        toast.error("🚨 Order Cancelled: " + cancelReason);
        setShowCancelModal(false);
        navigate("/");
      } else {
        toast.error("Failed to cancel order: " + data.message);
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      toast.error("Network error while cancelling order.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="tracking-page">

        {/* ── Hero Banner ── */}
        <div className="tracking-hero">
          <div className="hero-content">
            <div className="hero-emoji">🛵</div>
            <h1 className="hero-title">Live Order Tracking</h1>
            <p className="hero-sub">Watch your food come to you in real time!</p>
          </div>
          <div className="hero-wave" />
        </div>

        <div className="tracking-body container-fluid px-3 px-md-5">
          <div className="row g-4">

            {/* ── LEFT: Map ── */}
            <div className="col-lg-8">
              <div className="map-card">
                <div className="map-card-header">
                  <span className="live-badge"><span className="live-dot" />LIVE</span>
                  <span className="map-title">📍 Delivery Map</span>

                  {/* GPS Status */}
                  {gpsActive ? (
                    <span className="gps-active-badge">
                      🛰️ GPS Active
                      {accuracy && <span className="gps-acc"> ±{accuracy}m</span>}
                    </span>
                  ) : (
                    <span className="gps-searching-badge">📡 Searching GPS…</span>
                  )}

                  {locationError && (
                    <span className="location-warn">⚠️ Demo location</span>
                  )}
                </div>

                {userPos ? (
                  <MapContainer
                    center={userPos}
                    zoom={14}
                    className="leaflet-map"
                    zoomControl={true}
                    scrollWheelZoom={false}
                  >
                    {/* 🗺️ Google Maps-like tile layer */}
                    <TileLayer
                      url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                      attribution="&copy; Google Maps"
                      subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                      maxZoom={20}
                    />

                    {/* Planned route — Google Maps style dashed blue */}
                    {routePoints.length > 1 && (
                      <Polyline
                        positions={routePoints}
                        pathOptions={{ color: "#BFD7FF", weight: 5, dashArray: "8,6", opacity: 0.7 }}
                      />
                    )}

                    {/* Travelled path — Google Maps style solid blue */}
                    {travelledPts.length > 1 && (
                      <Polyline
                        positions={travelledPts}
                        pathOptions={{ color: "#1A73E8", weight: 6, opacity: 1 }}
                      />
                    )}

                    {/* Markers */}
                    {restaurantPos && (
                      <Marker position={restaurantPos} icon={restaurantIcon}>
                        <Popup>🍽️ Restaurant</Popup>
                      </Marker>
                    )}
                    {driverPos && (
                      <Marker position={driverPos} icon={driverIcon}>
                        <Popup>🛵 {driver.name} — Your Driver</Popup>
                      </Marker>
                    )}
                    {userPos && (
                      <>
                        <Marker position={userPos} icon={userIcon}>
                          <Popup>🏠 Your Live Location<br/>{accuracy ? `±${accuracy}m accuracy` : ''}</Popup>
                        </Marker>
                        {/* GPS Accuracy circle */}
                        {accuracy && (
                          <Circle
                            center={userPos}
                            radius={accuracy}
                            pathOptions={{ color: '#4ade80', fillColor: '#4ade80', fillOpacity: 0.08, weight: 1.5, dashArray: '4,4' }}
                          />
                        )}
                      </>
                    )}

                    <RecenterMap center={userPos} />
                  </MapContainer>
                ) : (
                  <div className="map-loading">
                    <div className="spinner" />
                    <p>Fetching your location…</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT: Info Panel ── */}
            <div className="col-lg-4 d-flex flex-column gap-4">

              {/* ETA Card */}
              <div className={`eta-card ${isDelivered ? "delivered" : ""}`}>
                {isDelivered ? (
                  <>
                    <div className="eta-emoji">🎉</div>
                    <h2 className="eta-time">Delivered!</h2>
                    <p className="eta-label">Enjoy your delicious meal 😋</p>
                    <button className="btn-back" onClick={() => navigate("/")}>
                      🏠 Back to Home
                    </button>
                  </>
                ) : (
                  <>
                    <div className="eta-emoji">⏱️</div>
                    <h2 className="eta-time">{arrivalTime}</h2>
                    <p className="eta-label">Estimated Arrival ({eta} mins)</p>
                    <div className="eta-progress-bar">
                      <div
                        className="eta-progress-fill"
                        style={{ width: `${((30 - eta) / 30) * 100}%` }}
                      />
                    </div>
                    {currentStep < 3 && (
                      <button 
                        className="btn-back" 
                        style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', marginTop: '20px' }}
                        onClick={handleCancelClick}
                      >
                        🚫 Cancel Order
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Driver Card */}
              <div className="driver-card">
                <h5 className="card-heading">🛵 Your Delivery Partner</h5>
                {driver.name ? (
                  <div className="driver-info">
                    <div className="driver-avatar">{driver.name[0]}</div>
                    <div>
                      <p className="driver-name">{driver.name}</p>
                      <p className="driver-vehicle">📞 {driver.phone}</p>
                      <div className="driver-rating">
                        <span style={{ color: '#4ade80', fontSize: '0.85rem' }}>✅ On the way!</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="driver-info">
                    <div className="driver-avatar" style={{ background: 'rgba(255,255,255,0.05)', color: '#666' }}>?</div>
                    <div>
                      <p className="driver-name" style={{ color: '#9ca3af' }}>Looking for a driver...</p>
                      <p className="driver-vehicle" style={{ fontSize: '0.8rem', color: '#6b7280' }}>Will be assigned once order is ready</p>
                    </div>
                  </div>
                )}
                {driver.name && (
                  <div className="driver-actions">
                    <a href={`tel:${driver.phone}`} className="action-btn call-btn">
                      📞 Call Driver
                    </a>
                    <button className="action-btn chat-btn">💬 Chat</button>
                  </div>
                )}
              </div>

              {/* Status Steps */}
              <div className="status-card">
                <h5 className="card-heading">📦 Order Status</h5>
                <div className="steps-list">
                  {STEPS.map((step) => {
                    const isActive   = step.id === currentStep;
                    const isComplete = step.id < currentStep;
                    return (
                      <div
                        key={step.id}
                        className={`step-item ${isActive ? "active" : ""} ${isComplete ? "complete" : ""}`}
                      >
                        <div className="step-icon-wrap">
                          <span className="step-icon">{step.icon}</span>
                          {step.id < STEPS.length - 1 && <div className="step-line" />}
                        </div>
                        <div className="step-text">
                          <p className="step-label">{step.label}</p>
                          <p className="step-desc">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Address Card */}
              {deliveryInfo && (
                <div className="address-card">
                  <h5 className="card-heading">📍 Delivery Address</h5>
                  <div className="address-row">
                    <span className="address-icon">👤</span>
                    <div>
                      <p className="address-label">Name</p>
                      <p className="address-val">{deliveryInfo.name}</p>
                    </div>
                  </div>
                  <div className="address-row">
                    <span className="address-icon">📞</span>
                    <div>
                      <p className="address-label">Phone</p>
                      <p className="address-val">{deliveryInfo.phone}</p>
                    </div>
                  </div>
                  <div className="address-row">
                    <span className="address-icon">📮</span>
                    <div>
                      <p className="address-label">Address</p>
                      <p className="address-val">{deliveryInfo.address}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── Cancel Order Modal ── */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton style={{ background: '#1a1a1a', borderBottom: '1px solid #333' }}>
          <Modal.Title style={{ color: '#fff', fontSize: '1.2rem' }}>Cancel Order</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a1a', color: '#fff' }}>
          <p className="mb-3 text-secondary">Please tell us why you want to cancel your order:</p>
          <Form>
            {[
              "Ordered by mistake",
              "Delivery is taking too long",
              "Changed my mind",
              "Forgot to apply coupon",
              "Other reason"
            ].map((reason, idx) => (
              <Form.Check 
                key={idx}
                type="radio"
                id={`reason-${idx}`}
                name="cancelReason"
                label={reason}
                value={reason}
                checked={cancelReason === reason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mb-2 custom-radio"
                style={{ cursor: 'pointer' }}
              />
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: '#1a1a1a', borderTop: '1px solid #333' }}>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)} disabled={isCancelling}>
            Go Back
          </Button>
          <Button variant="danger" onClick={confirmCancelOrder} disabled={isCancelling || !cancelReason}>
            {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </>
  );
}
