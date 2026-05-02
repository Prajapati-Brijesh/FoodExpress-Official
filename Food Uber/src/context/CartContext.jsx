import React, { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("food_uber_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("food_uber_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, offerType = null, quantity = 1) => {
    const user = localStorage.getItem("user");
    if (!user) {
      toast.error("🔒 Please sign in first to add items to your cart!");
      navigate("/login");
      return;
    }

    setCart((prev) => {
      let newCart = [...prev];
      
      for (let i = 0; i < quantity; i++) {
        if (offerType === "Buy 1 Get 1") {
          const count = newCart.filter((c) => c.offerType === "Buy 1 Get 1").length;
          if (count % 2 === 0) {
            newCart.push({ ...item, qty: 1, offerType, isFree: false });
          } else {
            newCart.push({ ...item, qty: 1, price: 0, offerType, isFree: true });
          }
        } else {
          let finalPrice = item.price;
          if (offerType === "40% Off") finalPrice = Math.round(item.price * 0.6);
          newCart.push({ ...item, price: finalPrice, qty: 1, offerType, isFree: false });
        }
      }
      
      return newCart;
    });

    toast.success(`✨ ${quantity > 1 ? quantity + 'x ' : ''}${item.name} added to cart!`);
  };

  const removeItem = (name) => {
    setCart((prev) => prev.filter((item) => item.name !== name));
    toast.error(`❌ ${name} removed from cart`);
  };

  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce((sum, item) => sum + (item.isFree ? 0 : item.price * item.qty), 0);
  const cartItemCount = cart.length;

  return (
    <CartContext.Provider value={{ cart, addToCart, removeItem, clearCart, total, cartItemCount }}>
      {children}
    </CartContext.Provider>
  );
};
