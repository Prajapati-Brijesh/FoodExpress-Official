import React, { createContext, useState, useEffect } from 'react';
import { categories as localCategories, offers as localOffers, allProducts as localAllProducts } from '../data';

export const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [categories, setCategories] = useState(localCategories);
  const [offers, setOffers] = useState(localOffers);
  const [allProducts, setAllProducts] = useState(localAllProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/get-menu/')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && (Object.keys(data.data.categories || {}).length > 0)) {
          setCategories(data.data.categories || {});
          setOffers(data.data.offers || {});
          setAllProducts(data.data.allProducts || []);
        } else {
          // Fallback to local data if backend is empty
          setCategories(localCategories);
          setOffers(localOffers);
          setAllProducts(localAllProducts);
        }
      })
      .catch(err => {
        console.error("Error fetching menu data, falling back to local data:", err);
        setCategories(localCategories);
        setOffers(localOffers);
        setAllProducts(localAllProducts);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <MenuContext.Provider value={{ categories, offers, allProducts, loading }}>
      {children}
    </MenuContext.Provider>
  );
};
