import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageWrapper from "./components/PageWrapper";
import BottomNav from "./Navbar/BottomNav";
import AIVoiceAssistant from "./components/AIVoiceAssistant";

import Home from "./Home/Home";
import Contact from "./contact/Contact";
import Login from "./Login/Login";
import Restaurants from "./Restaurants/Restaurants";
import Menu from "./menu/Menu";       // Food menu page
import Checkout from "./Checkout/Checkout"; // Checkout page
import Product from "./Product/Product"; // Product page
import RestaurantDetail from "./Restaurants/RestaurantDetail";
import HelpCenter from "./InfoPages/HelpCenter";
import PrivacyPolicy from "./InfoPages/PrivacyPolicy";
import TermsConditions from "./InfoPages/TermsConditions";
import LiveTracking from "./Tracking/LiveTracking";
import Profile from "./Profile/Profile";
import DeliveryJoin from "./DeliveryJoin/DeliveryJoin";
import DeliveryLogin from "./DeliveryJoin/DeliveryLogin";
import DeliveryDashboard from "./DeliveryJoin/DeliveryDashboard";
import RestaurantPartner from "./RestaurantPartner/RestaurantPartner";
import PartnerLogin from "./RestaurantPartner/PartnerLogin";
import SubscriptionPass from "./InfoPages/SubscriptionPass";

import MysteryBox from "./MysteryBox/MysteryBox";
import FoodTinder from "./FoodTinder/FoodTinder";
import MacroMatcher from "./MacroMatcher/MacroMatcher";
import GroupCart from "./GroupCart/GroupCart";
import Discover from "./Discover/Discover";
import FloatingQR from "./components/FloatingQR";

import AOS from 'aos';
import 'aos/dist/aos.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartProvider } from "./context/CartContext";
import { MenuProvider } from "./context/MenuContext";
import { NotificationProvider } from "./context/NotificationContext";
import AdminLogin from './Admin/AdminLogin';
import AdminDashboard from './Admin/AdminDashboard';
import VendorDashboard from './Admin/VendorDashboard';
import AdminPanel from './Admin/AdminPanel';
import AdminVendorList from './Admin/AdminVendorList';


// ScrollToTop Helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Main Pages */}
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/Menu" element={<PageWrapper><Menu /></PageWrapper>} />
        <Route path="/checkout" element={<PageWrapper><Checkout /></PageWrapper>} />
        <Route path="/product/:name" element={<PageWrapper><Product /></PageWrapper>} />
        <Route path="/tracking" element={<PageWrapper><LiveTracking /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />

        {/* Other Pages */}
        <Route path="/restaurants" element={<PageWrapper><Restaurants /></PageWrapper>} />
        <Route path="/restaurants/:id" element={<PageWrapper><RestaurantDetail /></PageWrapper>} />
        <Route path="/delivery-join" element={<PageWrapper><DeliveryJoin /></PageWrapper>} />
        <Route path="/delivery/login" element={<PageWrapper><DeliveryLogin /></PageWrapper>} />
        <Route path="/delivery/dashboard" element={<PageWrapper><DeliveryDashboard /></PageWrapper>} />
        <Route path="/partner" element={<PageWrapper><RestaurantPartner /></PageWrapper>} />
        <Route path="/partner/login" element={<PageWrapper><PartnerLogin /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />

        {/* Info Pages */}
        <Route path="/help" element={<PageWrapper><HelpCenter /></PageWrapper>} />
        <Route path="/privacy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
        <Route path="/terms" element={<PageWrapper><TermsConditions /></PageWrapper>} />
        <Route path="/pro" element={<PageWrapper><SubscriptionPass /></PageWrapper>} />

        <Route path="/admin-login" element={<PageWrapper><AdminLogin /></PageWrapper>} />
        <Route path="/admin-dashboard" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
        <Route path="/vendor-dashboard" element={<PageWrapper><VendorDashboard /></PageWrapper>} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/vendor" element={<AdminVendorList />} />


        {/* Unique Features */}
        <Route path="/discover" element={<PageWrapper><Discover /></PageWrapper>} />
        <Route path="/mystery-box" element={<PageWrapper><MysteryBox /></PageWrapper>} />
        <Route path="/food-tinder" element={<PageWrapper><FoodTinder /></PageWrapper>} />
        <Route path="/macro-matcher" element={<PageWrapper><MacroMatcher /></PageWrapper>} />
        <Route path="/group-cart" element={<PageWrapper><GroupCart /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      startEvent: 'load',
      disable: 'mobile' ? false : false, // ensure it runs on mobile
    });
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <NotificationProvider>
        <MenuProvider>
          <CartProvider>
            <ToastContainer position="bottom-right" autoClose={3000} />
            <AnimatedRoutes />
            <BottomNav />
            <FloatingQR />
            <AIVoiceAssistant />
          </CartProvider>
        </MenuProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;
