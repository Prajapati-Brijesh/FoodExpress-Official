import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../Navbar/Navbar";
import Footer from "../footer";

function Login() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [otpStage, setOtpStage] = useState(false); // OTP phase

  const [user, setUser] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Check login on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // ===== LOGIN (Real API) =====
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.status === "success") {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}! 👋`);
        setTimeout(() => navigate("/Menu"), 1500);
      } else {
        toast.error(data.message || "Invalid email or password");
      }
    } catch (err) {
      toast.error("Could not connect to server. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    // Simulate network request
    setTimeout(() => {
      const mockGoogleUser = {
        name: "Google User",
        email: "user@gmail.com",
        contact: "9876543210",
        picture: "https://lh3.googleusercontent.com/a/default-user=s96-c"
      };
      localStorage.setItem("user", JSON.stringify(mockGoogleUser));
      setUser(mockGoogleUser);
      setGoogleLoading(false);
      toast.success("Successfully logged in with Google! 🚀");
      setTimeout(() => {
        navigate("/Menu");
      }, 1500);
    }, 1500);
  };

  // ===== SIGNUP CLICK → SEND OTP =====
  const handleSignupClick = (e) => {
    e.preventDefault();

    if (!name || !email || !contact || !password) {
      alert("Please fill all fields");
      return;
    }

    // Generate OTP
    const randomOtp = Math.floor(1000 + Math.random() * 9000);
    setGeneratedOtp(randomOtp);
    setOtpStage(true);

    alert("Demo OTP: " + randomOtp); // demo only
  };

  // ===== VERIFY OTP & CREATE ACCOUNT (Real API) =====
  const verifyOtpAndCreateUser = async () => {
    if (parseInt(otp) !== generatedOtp) {
      toast.error("Wrong OTP");
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/api/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, contact, password })
      });
      const data = await res.json();
      if (data.status === "success") {
        toast.success("Account created! Please log in.");
        setIsSignup(false);
        setOtpStage(false);
        setName(""); setEmail(""); setContact(""); setPassword(""); setOtp("");
      } else {
        toast.error(data.message || "Signup failed.");
      }
    } catch (err) {
      toast.error("Could not connect to server.");
    }
  };

  // ===== LOGOUT =====
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <>
    <Navbar />
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ 
        minHeight: "100vh", 
        backgroundColor: "transparent",
        paddingTop: "100px",
        paddingBottom: "80px"
      }}
    >
      <div 
        className="p-4 p-md-5 shadow-lg rounded-4 border-0" 
        data-aos="zoom-in" 
        data-aos-duration="600" 
        style={{ 
          maxWidth: "420px", 
          width: "100%",
          background: "rgba(0, 0, 0, 0.55)",
          backdropFilter: "blur(12px)",
        }}
      >
        {user ? (
          <div className="text-center">
            <h4 className="fw-bold mb-3 text-white"><i className="fa-solid fa-face-smile text-brand me-2"></i>Welcome Back</h4>
            <div className="bg-dark p-3 rounded-3 shadow-sm mb-4 border d-flex flex-column align-items-center" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {user.picture ? (
                <img src={user.picture} alt="profile" className="rounded-circle mb-3" style={{ width: '60px', height: '60px' }} />
              ) : (
                <div className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                  <i className="fa-solid fa-user fs-3 text-white"></i>
                </div>
              )}
              <p className="fw-bold fs-5 mb-1 text-white">{user.name}</p>
              <p className="text-secondary small mb-0">{user.email}</p>
            </div>

            <button className="btn btn-outline-danger w-100 rounded-pill fw-bold py-2 shadow-sm" onClick={handleLogout}>
              Logout <i className="fa-solid fa-arrow-right-from-bracket ms-2"></i>
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-4 pb-2 border-bottom border-secondary">
              <h3 className="fw-bold mb-1 text-white">
                {isSignup ? "Create Account" : "Welcome Back"}
              </h3>
              <p className="text-secondary small">
                {isSignup ? "Sign up to join Food Uber" : "Login to order your favorite meals"}
              </p>
            </div>

            <form onSubmit={isSignup ? handleSignupClick : handleLogin}>
              {isSignup && (
                <>
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-white shadow-sm rounded-3"
                      id="nameInput"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <label htmlFor="nameInput" className="text-secondary">Full Name</label>
                  </div>

                  <div className="form-floating mb-3">
                    <input
                      type="tel"
                      className="form-control bg-dark border-secondary text-white shadow-sm rounded-3"
                      id="contactInput"
                      placeholder="Mobile Number"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                    />
                    <label htmlFor="contactInput" className="text-secondary">Mobile Number</label>
                  </div>
                </>
              )}

              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control bg-dark border-secondary text-white shadow-sm rounded-3"
                  id="emailInput"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label htmlFor="emailInput" className="text-secondary">Email Address</label>
              </div>

              <div className="form-floating mb-4">
                <input
                  type="password"
                  className="form-control bg-dark border-secondary text-white shadow-sm rounded-3"
                  id="passwordInput"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label htmlFor="passwordInput" className="text-secondary">Password</label>
              </div>

              {/* OTP FIELD AFTER SIGNUP CLICK */}
              {otpStage && (
                <div className="mb-4 p-3 bg-dark rounded-3 shadow-sm border border-secondary" data-aos="fade-down">
                  <p className="text-secondary small text-center mb-2">We've generated an OTP for you to verify.</p>
                  <div className="form-floating mb-3">
                    <input
                      type="number"
                      className="form-control border-secondary bg-dark text-white rounded-3"
                      id="otpInput"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <label htmlFor="otpInput" className="text-muted">Enter OTP</label>
                  </div>

                  <button
                    type="button"
                    className="btn btn-success w-100 rounded-pill py-2 fw-bold shadow-sm"
                    onClick={verifyOtpAndCreateUser}
                  >
                    Verify & Create Account <i className="fa-solid fa-check ms-1"></i>
                  </button>
                </div>
              )}

              {!otpStage && (
                <button className="btn-brand w-100 py-3 rounded-pill fw-bold fs-5 shadow-sm d-flex justify-content-center align-items-center gap-2">
                  {isSignup ? "Sign Up" : "Login"} {isSignup ? <i className="fa-solid fa-user-plus"></i> : <i className="fa-solid fa-arrow-right-to-bracket"></i>}
                </button>
              )}
            </form>

            {!otpStage && (
              <>
                <div className="d-flex align-items-center my-4">
                  <div className="flex-grow-1 border-top border-secondary"></div>
                  <span className="mx-3 text-secondary small">OR</span>
                  <div className="flex-grow-1 border-top border-secondary"></div>
                </div>

                <button 
                  className="btn btn-light w-100 py-2 rounded-pill fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <span className="spinner-border spinner-border-sm text-dark" role="status" aria-hidden="true"></span>
                  ) : (
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style={{ width: "20px" }} />
                  )}
                  {googleLoading ? "Connecting..." : "Continue with Google"}
                </button>
              </>
            )}

            <div className="text-center mt-4 pt-3 border-top border-secondary">
              <p className="text-secondary mb-2 small">
                {isSignup ? "Already have an account?" : "New to Food Uber?"}{" "}
                <span
                  style={{ color: "var(--brand-primary)", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setOtpStage(false);
                  }}
                >
                  {isSignup ? "Log In" : "Create an Account"}
                </span>
              </p>
              <p className="text-secondary small mb-0 mt-2">
                Are you a restaurant partner? <span className="text-warning cursor-pointer fw-bold" onClick={() => navigate('/partner/login')}>Partner Login</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
    <Footer />
    </>
  );
}

export default Login;
