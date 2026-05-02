import React, { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer';

export default function TermsConditions() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-wrapper" style={{ background: "transparent" }}>
      <Navbar />
      <div className="pt-5 pb-5" style={{ minHeight: "75vh", marginTop: "80px" }}>
        <Container>
          <div className="text-center mb-5" data-aos="fade-down">
            <h1 className="fw-bold display-4 text-white">Terms & Conditions</h1>
            <p className="text-secondary lead mx-auto" style={{ maxWidth: "600px" }}>
              Please read these terms and conditions carefully before using FoodExpress.
            </p>
          </div>

          <div className="p-4 p-md-5 rounded-4 shadow-sm mx-auto text-light" style={{ maxWidth: "800px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.05)" }} data-aos="fade-up">
            <h4 className="fw-bold text-white mb-3">1. Acceptance of Terms</h4>
            <p className="text-secondary mb-4">
              By accessing and using our application, you accept and agree to be bound by the terms and provisions of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>

            <h4 className="fw-bold text-white mb-3">2. User Accounts</h4>
            <p className="text-secondary mb-4">
              To use certain features of the service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and keep your account information up-to-date. You are responsible for safeguarding your password.
            </p>

            <h4 className="fw-bold text-white mb-3">3. Orders and Payment</h4>
            <p className="text-secondary mb-4">
              All orders are subject to availability and confirmation of the order price. Dispatch times may vary according to availability and any guarantees or representations made as to delivery times are subject to any delays resulting from postal delays or force majeure for which we will not be responsible.
            </p>

            <h4 className="fw-bold text-white mb-3">4. Limitation of Liability</h4>
            <p className="text-secondary mb-0">
              FoodExpress shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
}
