import "./RestaurantSection.css";
import { useRef } from "react";

const restaurants = [
  {
    name: "The Morocco Garden",
    img: "./666e4a55-1ed8-4c87-99ee-e7b65b093bcd_20240520T120035646.avif",
    rating: "4.2",
    type: "North Indian · Chinese",
    price: "₹800 for two",
    place: "Katargam, Surat",
    dist: "4.8 km",
    offer: "Flat 15% off on pre-booking",
  },
  {
    name: "Nothing Before Coffee",
    img: "/16c21143-8d2a-4371-b537-dd0c381ab579_202505043f84a82a222da4f219a89e72d2a2e0d62.avif",
    rating: "4.7",
    type: "Fast Food · Beverages",
    price: "₹500 for two",
    place: "Utran, Surat",
    dist: "6.8 km",
    offer: "Flat 10% off on walk-in",
  },
  {
    name: "Justice 24 restaurant",
    img: "./",
    rating: "5.0",
    type: "Beverages · North Indian",
    price: "₹500 for two",
    place: "Althan, Surat",
    dist: "6.2 km",
    offer: "Flat 40% off on pre-booking",
  },
  {
    name: "Justice 24 restaurant",
    img: "./",
    rating: "5.0",
    type: "Beverages · North Indian",
    price: "₹500 for two",
    place: "Althan, Surat",
    dist: "6.2 km",
    offer: "Flat 40% off on pre-booking",
  },
  {
    name: "Justice 24 restaurant",
    img: "/res3.jpg",
    rating: "5.0",
    type: "Beverages · North Indian",
    price: "₹500 for two",
    place: "Althan, Surat",
    dist: "6.2 km",
    offer: "Flat 40% off on pre-booking",
  },
];

export default function Dineout() {
  const ref = useRef(null);

  return (
    <div className="dineout-wrap">
      <a href="" className="title2">

      <div className="title-row">
        <h2>Discover best restaurants on Dineout</h2>
        <div>
          <button onClick={() => ref.current.scrollBy({ left: -350, behavior: "smooth" })}>←</button>
          <button onClick={() => ref.current.scrollBy({ left: 350, behavior: "smooth" })}>→</button>
        </div>
      </div>

      <div className="card-row" ref={ref}>
        {restaurants.map((r, i) => (
          <div className="res-card" key={i}>
            <div
              className="img-box"
              style={{ backgroundImage: `url(${r.img})` }}
            >
              <span className="rating">★ {r.rating}</span>
              <h3>{r.name}</h3>
            </div>

            <div className="info">
              <div className="line">
                <span>{r.type}</span>
                <span>{r.price}</span>
              </div>
              <div className="line">
                <span>{r.place}</span>
                <span>{r.dist}</span>
              </div>

              <span className="tag">Table booking</span>

              <div className="offer">{r.offer}</div>
              <div className="bank">Up to 10% off with bank offers</div>
            </div>
          </div>
        ))}
      </div>
      </a>
    </div>
  );
}
