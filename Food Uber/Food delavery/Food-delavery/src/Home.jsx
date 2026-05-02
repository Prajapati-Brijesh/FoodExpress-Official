import React from 'react'
import InstamartSection from "./Instamart/InstamartSection";
import RestaurantSection from "./Restaurant/RestaurantSection";
import Cities from "./cities/Cities";
import Footer from "./foods/footer/Footer";
// import Navibar from './Navibar/Navibar'

function Home() {
  return (
    <div>
        <Navibar />
        {/* Hero Section */}
      <div className="hero text-center text-white">
        <h1>Fast Food Delivery </h1>
         <h1 className="title">
        Best restaurants. <span>FoodExpress it!</span>
      </h1>

      <div className="search-container d-flex justify-content-center ">
        <div className="location-box">
          <span className="icon"></span>
          <input 
            type="text"
            placeholder="Enter your delivery location"
          />
          <span className="arrow"></span>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search for restaurant, item or more"
          />
          <span className="icon"></span>
        </div>
      </div>
        <div className="offer-section">
      <div className="container">
        <div className="row g-4">
<div className="container my-5">
        <div className="row g-3 d-flex justify-content-center ">
          <div className="col-md-3 ">
            <div className="card">
              <a href="#">
                <img src="./one1.avif" className="card-img-top"
              />
                </a>
            </div>
          </div>


        {/* {ofer card} */}

        
          <div className="col-md-3">
            <div className="card">
            <a href="#">
                <img src="./tow.avif" className="card-img-top"
              />
                </a>
            </div>
          </div>

          <div className="col-md-3 ">
            <div className="card">
            <a href="#">
                <img src="./one.avif" className="card-img-top"
              />
                </a>
            </div>
          </div>
        </div>
      </div>

        </div>
      </div>
    </div>
      </div>

  {/* 👇 ADD HERE */}
      <FoodCategories />
      <InstamartSection />
      <RestaurantSection />
      <Cities />

      {/* Footer */}
      {/* <footer className="bg-dark text-white text-center p-3">

</footer> */}
    <Footer />
    
    </div>
  )
}

export default Home
