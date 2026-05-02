import FoodCategories from "../foods/FoodCategories";
import Home from "../Home";
// import "./FoodCategories.css";
// import "./App.css";
// import InstamartSection from "../Instamart/InstamartSection";
// import RestaurantSection from "../Restaurant/RestaurantSection";
// import Cities from "../cities/Cities";
// import Footer from "../foods/footer/Footer";


function Navibar() {
  //  return <FoodCategories />;
  <button
  className="btn btn-primary"
  onClick={() => alert("Item added to cart 🛒")}
>
  Add to Cart
</button>
  return (
    <>
      {/* Navbar */}
      
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="#">
            FoodExpress
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><link className="nav-link" to="/">Home</link></li>
              {/* <li className="nav-item"><link className="nav-link" to="#">About</link></li> */}
              <li className="nav-item"><link className="nav-link" to="#">Menu</link></li>
              <li className="nav-item"><link className="nav-link" to="#">Shops</link></li>
              <li className="nav-item"><link className="nav-link" to="#">Restaurants </link></li>
              <li className="nav-item"><link className="nav-link" to="#">Contect</link></li>
              <li className="nav-item"><link className="nav-link" to="#">Login </link></li>

            </ul>
          </div>
        </div>
      </nav>
        <Home />
     
    </>
  );
}
export default Navibar;