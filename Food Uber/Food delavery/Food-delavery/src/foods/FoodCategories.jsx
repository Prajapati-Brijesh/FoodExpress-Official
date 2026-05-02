import React, { useRef } from "react";
import "./FoodCategories.css";

const categories = [

  { img: "./Chole Bhature.avif" },
  { img: "./Pizza.avif" },
  { img: "./Burger.avif" },
  { img: "./Rolls.avif" },
  { img: "./Khichdi.avif" },
  { img: "./Pav Bhaji.avif" },
  { img: "./Paratha.avif" },
  { img: "./Noodles.avif" },
  { img: "./Ice Cream.avif" },
  { img: "./Coffee.avif" },
  { img: "./Idli.avif" }
];

function FoodCategories() {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
       
          <div className="category-section">
    <div className="category-header">
        <h2>Order our best food options</h2>
        <div className="arrows">
          <button onClick={scrollLeft}>←</button>
          <button onClick={scrollRight}>→</button>
        </div>
      </div>

      <div className="category-list" ref={scrollRef}>
        {categories.map((item, index) => (
          <div className="category-card" key={index}>
            <img src={item.img} alt={item.name} />
            <p>{item.name}</p>
          </div>
        ))}
      </div>
        
    </div>
         
  );
}

export default FoodCategories;
 