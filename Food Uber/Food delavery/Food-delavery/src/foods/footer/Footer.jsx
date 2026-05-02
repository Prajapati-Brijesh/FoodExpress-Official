import React from "react";
import "./Footer.css"

function Footer() {
  return (
    <footer className=" container-fluid bg-light pt-5 ">
      <div className="containe">
        <div className="row bg-black p-4">

          <div className="col-md-3 mb-4">
            <h4 className="text-warning fw-bold">⚡ FoodExpress</h4>
            <p className="year">© 2026 FoodExpress</p>
          </div>

          <div className="col-md-2 mb-4">
            <h6 className="fw-bold">Company</h6>
            <ul className="list-unstyled text-muted">
              <li>About Us</li>
              <li>Careers</li>
              <li>Team</li>
              <li>Blog</li>
            </ul>
          </div>

          <div className="col-md-2 mb-4">
            <h6 className="fw-bold">Contact</h6>
            <ul className="list-unstyled text-muted">
              <li>Help & Support</li>
              <li>Partner With Us</li>
              <li>Ride With Us</li>
            </ul>
          </div>

          <div className="col-md-2 mb-4">
            <h6 className="fw-bold">Cities</h6>
            <ul className="list-unstyled text-muted">
              <li>Ahmedabad</li>
              <li>Surat</li>
              <li>Vadodara</li>
              <li>Rajkot</li>
            </ul>
          </div>

          <div className="col-md-3 mb-4">
            <h6 className="fw-bold">Social Links</h6>
            <div className="d-flex gap-3 fs-5">
              <i className="bi bi-instagram"></i>
              <i className="bi bi-facebook"></i>
              <i className="bi bi-twitter"></i>
              <i className="bi bi-linkedin"></i>
            </div>
          </div>

      <div className=" text-white text-center py-2 mt-3">
        © 2026 FoodExpress • All Rights Reserved
      </div>
        </div>
      </div>

    </footer>
  );
}

export default Footer;
