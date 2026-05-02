import "./Cities.css";

const foodCities = [
  "Bangalore","Gurgaon","Hyderabad","Delhi",
  "Mumbai","Pune","Kolkata","Chennai",
  "Ahmedabad","Chandigarh","Jaipur"
];

const groceryCities = [
  "Bangalore","Gurgaon","Hyderabad","Delhi",
  "Mumbai","Pune","Kolkata","Chennai",
  "Ahmedabad","Chandigarh","Jaipur"
];

export default function Cities() {
  return (
    <div className="cities-section">

      {/* FOOD */}
      <h2>Cities with food delivery</h2>
      <div className="cities-grid">
        {foodCities.map((city, i) => (
          <div className="city-card" key={i}>
            Order food online in<br /><b>{city}</b>
          </div>
        ))}
        <div className="city-card show-more">
          Show More ⌄
        </div>
      </div>

      {/* GROCERY */}
      <h2 className="gap">Cities with grocery delivery</h2>
      <div className="cities-grid">
        {groceryCities.map((city, i) => (
          <div className="city-card" key={i}>
            Order grocery delivery in<br /><b>{city}</b>
          </div>
        ))}
        <div className="city-card show-more">
          Show More ⌄
        </div>
      </div>

    </div>
  );
}
