// ContactPage.jsx
import React, { useState, useEffect } from "react";
import "./Contact.css";
import Footer from "../Footer";
import Navbar from "../Navbar/Navbar";
import { useTranslation } from "react-i18next";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();
  
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };
  
  useEffect(() => {
    document.body.classList.add("contact-bg");
    return () => document.body.classList.remove("contact-bg");
  }, []);
  return (
    <>
      <Navbar />
      <div className="contact-page-wrapper" style={{ marginTop: '80px', minHeight: '80vh', paddingBottom: '50px' }}>
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-down">
            <h1 className="fw-bold display-5 text-white">{t('contact_us_title')}</h1>
            <p className="text-secondary lead mx-auto" style={{ maxWidth: "600px" }}>
              {t('contact_desc')}
            </p>
          </div>

          <div className="row g-5 align-items-stretch">
            {/* Left Column: Form */}
            <div className="col-lg-6" data-aos="fade-right">
              <div className="contact-form-wrapper h-100 p-4 p-md-5 rounded-4 shadow-sm" style={{ background: "rgba(0, 0, 0, 0.55)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 className="fw-bold mb-4 text-white">{t('send_message')}</h3>
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-group position-relative mb-4">
                    <input
                      type="text"
                      className="form-control form-control-lg bg-dark text-white border-secondary shadow-sm rounded-3 px-4 py-3"
                      name="name"
                      placeholder={t('full_name')}
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group position-relative mb-4">
                    <input
                      type="email"
                      className="form-control form-control-lg bg-dark text-white border-secondary shadow-sm rounded-3 px-4 py-3"
                      name="email"
                      placeholder={t('email')}
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group position-relative mb-4">
                    <textarea
                      className="form-control form-control-lg bg-dark text-white border-secondary shadow-sm rounded-3 px-4 py-3"
                      name="message"
                      placeholder={t('message')}
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      required
                    />
                  </div>
                  <button className="btn-brand btn-lg w-100 rounded-pill py-3 fw-bold mt-2" type="submit">
                    {t('send_message')} <i className="fa-solid fa-paper-plane ms-2"></i>
                  </button>
                  {submitted && (
                    <div className="alert alert-success mt-4 rounded-3 text-center fw-bold shadow-sm" role="alert">
                      <i className="fa-solid fa-circle-check me-2"></i> {t('message_sent_success') || 'Thank you! Your message has been sent successfully.'}
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Right Column: Info & Map */}
            <div className="col-lg-6" data-aos="fade-left">
              <div className="contact-info-wrapper h-100 d-flex flex-column">
                
                {/* Contact details cards */}
                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <div className="p-4 rounded-4 shadow-sm text-center bg-dark border border-secondary text-white h-100" style={{ background: "rgba(0,0,0,0.5)" }}>
                      <i className="fa-solid fa-phone fa-2x mb-3" style={{ color: "var(--brand-primary)" }}></i>
                      <h5 className="fw-bold">{t('phone')}</h5>
                      <p className="text-secondary mb-0">+91 93131 16750</p>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-4 rounded-4 shadow-sm text-center bg-dark border border-secondary text-white h-100" style={{ background: "rgba(0,0,0,0.5)" }}>
                      <i className="fa-solid fa-envelope fa-2x mb-3" style={{ color: "var(--brand-primary)" }}></i>
                      <h5 className="fw-bold">{t('email')}</h5>
                      <p className="text-secondary mb-0">prajabrijesh67@gmail.com</p>
                    </div>
                  </div>
                </div>

                <div className="map-container rounded-4 shadow-sm flex-grow-1 overflow-hidden" style={{ minHeight: "250px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <iframe
                    title="Google Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57804.62869288465!2d72.532500!3d23.025800!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84a23b2b0001%3A0x8b7a2f98b3d2f6d7!2sAhmedabad%2C%20Gujarat%2C%20India!5e0!3m2!1sen!2sin!4v1700000000000"
                    allowFullScreen
                    loading="lazy"
                    style={{ width: "100%", height: "100%", border: 0 }}
                  ></iframe>
                </div>

                <div className="social-icons d-flex justify-content-center gap-4 mt-4">
                  <a href="#" className="text-white bg-dark border border-secondary shadow-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px", fontSize: "20px", transition: "0.3s" }}>
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="text-white bg-dark border border-secondary shadow-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px", fontSize: "20px", transition: "0.3s" }}>
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="text-white bg-dark border border-secondary shadow-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px", fontSize: "20px", transition: "0.3s" }}>
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" className="text-white bg-dark border border-secondary shadow-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px", fontSize: "20px", transition: "0.3s" }}>
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
