import React, { useRef } from "react";
import "./InstamartSection.css";

const data = [
  { title: "Paan Corner", img: "./1eae2df9-95a5-40e5-a2c0-92bb4893637a_5e1e6c72-dde5-4a12-8bdf-c7cbc4b0644b.avif" },
  { title: "Cold Drinks and Juices", img: "./37d399b1-52d2-47ef-bdd8-8951e51819fc_0361a93d-e864-49be-a57d-46c958eb7b56.avif" },
  { title: "Office and Electricals", img: "./52a66c89-6516-489f-96ac-b15286900648_ebbfd2d1-9b36-4ce3-b08c-7378f1ca6d7d.avif" },
  { title: "sweet tooth", img: "./83a9b71b-1db7-4cbe-a9f7-ead650d26326_3afbe8c8-f5c8-4dd7-8357-f5711f80646b.avif" },
  { title: "Home kitchen", img: "./657a922d-067a-4e0b-b967-b3e0c7906fa9_485311db-2f22-4193-a05d-963f18a89150.avif" },
  { title: "Pet supplies", img: "./705173ff-7cd9-4d7e-9e5b-3886d81411b9_bb324827-9556-48e4-b8f6-280706478fe2.avif  " },
];

function InstamartSection() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    scrollRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <div className="insta-section">
      <div className="insta-header">
        <h2>Shop groceries on Instamart</h2>
        <div>
          <button onClick={() => scroll("left")}>←</button>
          <button onClick={() => scroll("right")}>→</button>
        </div>
      </div>

      <div className="insta-scroll" ref={scrollRef}>
        {data.map((item, i) => (
          <div className="insta-card" key={i}>
            <img src={item.img} alt={item.title} />
            <p>{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InstamartSection;
