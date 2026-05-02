import React, { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import Navbar from '../Navbar/Navbar';
import Footer from '../footer';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-wrapper" style={{ background: "transparent" }}>
      <Navbar />
      <div className="pt-5 pb-5" style={{ minHeight: "75vh", marginTop: "80px" }}>
        <Container>
          <div className="text-center mb-5" data-aos="fade-down">
            <h1 className="fw-bold display-4 text-white">Privacy Policy</h1>
            <p className="text-secondary lead mx-auto" style={{ maxWidth: "600px" }}>
              Your privacy is critically important to us. Learn how we handle your data.
            </p>
          </div>

          <div className="p-4 p-md-5 rounded-4 shadow-sm mx-auto text-light" style={{ maxWidth: "800px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.05)" }} data-aos="fade-up">
            <h4 className="fw-bold text-white mb-3">1. Information We Collect</h4>
            <p className="text-secondary mb-4">
              We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.
            </p>

            <h4 className="fw-bold text-white mb-3">2. Use of Information</h4>
            <p className="text-secondary mb-4">
              We may use the information we collect about you to Provide, maintain, and improve our Services, including, for example, to facilitate payments, send receipts, provide products and services you request (and send related information), develop new features, provide customer support to Users and Drivers, develop safety features, authenticate users, and send product updates and administrative messages.
            </p>

            <h4 className="fw-bold text-white mb-3">3. Sharing of Information</h4>
            <p className="text-secondary mb-4">
              We may share the information we collect about you with delivery partners to enable them to provide the Services you request. For example, we share your name, delivery address, and order details with the restaurant and the delivery agent.
            </p>

            <h4 className="fw-bold text-white mb-3">4. Security Checks</h4>
            <p className="text-secondary mb-0">
              We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. We use advanced encryption methodologies to keep your payments safe.
            </p>
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
}
