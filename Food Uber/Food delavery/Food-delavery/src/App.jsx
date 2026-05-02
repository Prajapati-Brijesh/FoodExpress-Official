import React from "react";
import './app.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navibar from "./Navibar/Navibar";
// import Home from "./Home";

// Dummy pages (baad me design karenge)
function Menu() { return <h2 className="p-5">Menu Page</h2>; }
function Shops() { return <h2 className="p-5">Shops Page</h2>; }
function Restaurants() { return <h2 className="p-5">Restaurants Page</h2>; }
function Contact() { return <h2 className="p-5">Contact Page</h2>; }
function Login() { return <h2 className="p-5">Login Page</h2>; }

function App() {
  return (
    <Router>
      <Routes>
        {/* Home page = Navibar full UI */}
        <Route path="/" element={<Navibar />} />

        {/* Other pages */}
        <Route path="/Home" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/shops" element={<Shops />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}
export default App;